import { AptosAccount, AptosClient, HexString } from "aptos"
import { NODE_URL, EVM_SENDER } from "./config.js";
import fg from 'fast-glob';
import { readFile } from 'node:fs/promises'

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
  console.log("--from--", from.hexString)
  const txnRequest = await client.generateTransaction(from.hexString, payload);
  const signedTxn = await client.signTransaction(SENDER_ACCOUNT, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  const res = await client.getTransactionByHash(transactionRes.hash);
  console.log(res);
}
function toBuffer(hex) {
  return new HexString(hex).toUint8Array();
}

export async function sendTest() {
  const file_path = files.find((file) => file.includes("vmArithmeticTest/add.json"));
  const json = await JSON.parse((await readFile(file_path, 'utf8')).toString());
  const pre = json['add']['pre']
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
  const tx = json['add']['transaction']
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
      toBuffer(tx.data[0]),
      toBuffer(tx.gasPrice),
      toBuffer(tx.value[0]),
    ],
  };
  console.log("--payload--", payload)
  sendTx(payload)
}


// sendTest()


function getTx(){
  client.getTransactionByHash("0xbd92a17e884b3053f081240c150192f054dd5b0fcef21bf28554c0e8632d806f").then(res=>{
    console.log(res.events[0].data)
  })
}
getTx()