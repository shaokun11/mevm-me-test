import { AptosAccount, AptosClient, HexString } from "aptos"
import { NODE_URL, EVM_SENDER } from "./config.js";
import fg from 'fast-glob';
import { readFile } from 'node:fs/promises'
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

export async function sendTest(source) {
  const file_path = files.find((file) => file.includes(source));
  if (!file_path) throw new Error(source + " not found ")
  const key = source.substring(source.lastIndexOf('/') + 1, source.lastIndexOf('.'));
  const json = await JSON.parse((await readFile(file_path, 'utf8')).toString());
  const pre = json[key]['pre']
  const post = json[key]['post']["Cancun"]
  const tx = json[key]['transaction']
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
    let out = `${source} index ${i} `
    const res = await sendTx(payload)
    if (res.success) {
      const root_data = res.events.find((e) => e.type === "0x1::evm_for_test::ExecResultEvent")
      if (post[i].hash === root_data.data.state_root) {
        out += chalk.green("[PASSED]")
      } else {
        out += chalk.yellow("[FAILED]") + " " + JSON.stringify(root_data.data)
      }
    } else {
      out += chalk.red("[ERROR]") + " " + res.vm_status
    }
    console.log(out)
    await sleep(200)
  }
}

// sendTest("vmArithmeticTest/add.json")
sendTest("vmArithmeticTest/addmod.json")
