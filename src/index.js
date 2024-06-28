import { AptosAccount, AptosClient, HexString } from "aptos"
import { NODE_URL, EVM_SENDER } from "./config.js";
import fg from 'fast-glob';
import { appendFile, readFile, writeFile } from 'node:fs/promises'
import tape from "tape";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const client = new AptosClient(NODE_URL)
const SENDER_ACCOUNT = AptosAccount.fromAptosAccountObject({
  privateKeyHex: EVM_SENDER,
});

async function listFiles() {
  const DIR = "ethereum-tests/GeneralStateTests/VMTests"
  const pattern = `${DIR}/**/*.json`;
  try {
    const files = await fg(pattern);
    return files;
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
const files = await listFiles()
files.sort()

export async function sendTx(payload) {
  const from = SENDER_ACCOUNT.address()
  const txnRequest = await client.generateTransaction(from.hexString, payload);
  const signedTxn = await client.signTransaction(SENDER_ACCOUNT, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  return client.getTransactionByHash(transactionRes.hash);

}
function toBuffer(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2)
  if (hex.length % 2 !== 0) hex = "0" + hex
  hex = "0x" + hex
  return new HexString(hex).toUint8Array();
}


async function timeoutExe(ms) {
  await sleep(ms);
  return {
    success: false,
    vm_status: 'timeout',
    hash: "0x0"
  }
}
let has_error = false

export async function sendTest(index, source) {
  console.log('start ', source, has_error)
  const file_path = files.find((file) => file.includes(source));
  if (!file_path) throw new Error(source + " not found ")
  const key = source.substring(source.lastIndexOf('/') + 1, source.lastIndexOf('.'));
  const parts = source.split('/');
  const result = `${parts[parts.length - 2]}/${parts[parts.length - 1].replace('.json', '')}`;
  const summary_file = `static/${index}-${result.replace("/", "-")}.txt`
  await writeFile(summary_file, "")
  const json = JSON.parse((await readFile(file_path, 'utf8')).toString());
  const pre = json[key]['pre']
  const post = json[key]['post']["Cancun"]
  const tx = json[key]['transaction']
  const info = json[key]['_info']
  const addresses = []
  const codes = []
  const balances = []
  const nonces = []
  const storage_keys = []
  const storage_values = []
  for (let [k, v] of Object.entries(pre)) {
    addresses.push(toBuffer(k))
    codes.push(toBuffer(v['code']))
    balances.push(toBuffer(v['balance']))
    nonces.push(parseInt(v['nonce']))
    const storage_map = v['storage']
    if (storage_map) {
      const keys = []
      const values = []
      for (let [k, v] of Object.entries(storage_map)) {
        keys.push(toBuffer(k))
        values.push(toBuffer(v))
      }
      storage_keys.push(keys)
      storage_values.push(values)
    } else {
      storage_keys.push([])
      storage_values.push([])
    }
  }
  for (let i = 0; i < post.length; i++) {
    const indexes = post[i].indexes
    const payload = {
      function: `0x1::evm_for_test::run_test`,
      type_arguments: [],
      arguments: [
        addresses,
        codes,
        nonces,
        balances,
        storage_keys,
        storage_values,
        toBuffer(tx.sender),
        toBuffer(tx.to),
        toBuffer(indexes['data'] !== undefined ? tx.data[indexes['data']] : "0x"),
        toBuffer(tx.gasPrice),
        toBuffer(indexes['value'] !== undefined ? tx.value[indexes['value']] : "0x0"),
      ],
    };
    const label = info["labels"]?.[i] ?? ""
    let loc = `${source} ${i + 1} ${label} `
    let status = ""
    let msg = ""
    const timeout = 20 * 1000
    await new Promise((resolve) => {
      tape(loc, { timeout: timeout }, async (t) => {
        const res = await Promise.race([
          sendTx(payload),
          timeoutExe(timeout - 1000)
        ])
        if (res.success) {
          const root_data = res.events.find((e) => e.type === "0x1::evm_for_test::ExecResultEvent")
          t.equals(root_data.data.state_root, post[i].hash)
          if (post[i].hash === root_data.data.state_root) {
            status += "[PASSED]"
          } else {
            status += "[FAILED]"
            msg += JSON.stringify({
              ...root_data.data,
              expected: post[i].hash,
              hash: res.hash
            })
            has_error = true
          }
        } else {
          has_error = true
          t.fail(res.vm_status)
          status += "[ERROR]"
          msg += JSON.stringify({
            error: res.vm_status,
            hash: res.hash,
            expected: post[i].hash,
          })
        }
        const output = `${new Date().toISOString()} ${status} ${loc} ${msg}`
        await appendFile(summary_file, output + "\n")
        resolve()
      })
    })
  }
}



// sendTest("vmIOandFlowOperations/codecopy.json")

for (let i = 34; i < files.length; i++) {
  console.log('start ', i, has_error)
  if (has_error) break
  await sendTest(i, files[i])
  // break
}
// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
