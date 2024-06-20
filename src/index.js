import { AptosAccount, AptosClient, HexString } from "aptos"
import { NODE_URL, EVM_SENDER } from "./config.js";
import fg from 'fast-glob';
import { appendFile, readFile, writeFile } from 'node:fs/promises'
import chalk from "chalk";

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

export async function sendTx(payload) {
  const from = SENDER_ACCOUNT.address()
  const txnRequest = await client.generateTransaction(from.hexString, payload);
  const signedTxn = await client.signTransaction(SENDER_ACCOUNT, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  return client.getTransactionByHash(transactionRes.hash);

}
function toBuffer(hex) {
  return new HexString(hex).toUint8Array();
}

let RUN_STATUS = {
  PASSED: 0,
  FAILED: 0,
  ERROR: 0
}

export async function sendTest(source) {
  const file_path = files.find((file) => file.includes(source));
  if (!file_path) throw new Error(source + " not found ")
  const key = source.substring(source.lastIndexOf('/') + 1, source.lastIndexOf('.'));
  const json = await JSON.parse((await readFile(file_path, 'utf8')).toString());
  const pre = json[key]['pre']
  const post = json[key]['post']["Cancun"]
  const tx = json[key]['transaction']
  const info = json[key]['_info']
  const addresses = []
  const codes = []
  const balances = []
  const nonces = []
  for (let [k, v] of Object.entries(pre)) {
    addresses.push(toBuffer(k))
    codes.push(toBuffer(v['code']))
    balances.push(toBuffer(v['balance']))
    nonces.push(parseInt(v['nonce']))
  }
  for (let i = 0; i < tx.data.length; i++) {
    const payload = {
      function: `0x1::evm_for_test::run_test`,
      type_arguments: [],
      arguments: [
        addresses,
        codes,
        nonces,
        balances,
        toBuffer(tx.sender),
        toBuffer(tx.to),
        toBuffer(tx.data[i]),
        toBuffer(tx.gasPrice),
        toBuffer(tx.value[i] || tx.value[0] || "0x0"),
      ],
    };
    let loc = `${source} ${info["labels"]?.[i] ?? ""} `
    let status = ""
    let msg = ""
    const res = await sendTx(payload)
    if (res.success) {
      const root_data = res.events.find((e) => e.type === "0x1::evm_for_test::ExecResultEvent")
      if (post[i].hash === root_data.data.state_root) {
        // status += chalk.green("[PASSED]")
        status += "[PASSED]"
        RUN_STATUS.PASSED++
      } else {
        // status += chalk.yellow("[FAILED]")
        status += "[FAILED]"
        msg += JSON.stringify({
          ...root_data.data,
          expected: post[i].hash
        })
        RUN_STATUS.FAILED++
      }
    } else {
      // status += chalk.red("[ERROR]")
      status += "[ERROR]"
      msg += res.vm_status
      RUN_STATUS.ERROR++
    }
    const count = RUN_STATUS.PASSED + RUN_STATUS.FAILED + RUN_STATUS.ERROR
    const per = `${RUN_STATUS.PASSED}:${RUN_STATUS.FAILED}:${RUN_STATUS.ERROR} ${(RUN_STATUS.PASSED / (
      count) * 100).toFixed(4)}% `
    // const summary = chalk.gray(per)
    const summary = per
    const output = `${status} ${summary} ${loc} ${msg}`
    await appendFile("summary.txt", output + "\n")
    await writeFile("count.txt", `${count}`)
  }
}

// sendTest("vmArithmeticTest/add.json")
let start = 0
try {
  start = parseInt(await readFile("count.txt", 'utf8'))
} catch (error) {

}
for (let i = start; i < files.length; i++) {
  await sendTest(files[i])
}

