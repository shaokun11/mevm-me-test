import { AptosAccount, AptosClient, HexString } from "aptos"
import { NODE_URL, EVM_SENDER } from "./config.js";
import fg from 'fast-glob';
import { appendFile, readFile, unlink } from 'node:fs/promises'
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

export async function sendTest(data) {
  let source = data
  if (data instanceof Object) {
    source = data.name
  }
  const file_path = files.find((file) => file.includes(source));
  if (!file_path) throw new Error(source + " not found ")
  const key = source.substring(source.lastIndexOf('/') + 1, source.lastIndexOf('.'));
  const parts = source.split('/');
  const result = `${parts[parts.length - 2]}/${parts[parts.length - 1].replace('.json', '')}`;
  const summary_file = `static/${result.replace("/", "-")}.txt`
  await unlink(summary_file).catch(() => { })
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
    tape(loc, async (t) => {
      const res = await sendTx(payload)
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
        }
      } else {
        t.equals(false, res.vm_status)
        status += "[ERROR]"
        msg += JSON.stringify({
          error: res.vm_status,
          hash: res.hash,
          expected: post[i].hash,
        })
      }
      const output = `${new Date().toISOString()} ${status} ${loc} ${msg}`
      await appendFile(summary_file, output + "\n")
    })
  }
}

const passed = [
  "vmArithmeticTest/add",
  "vmArithmeticTest/addmod",
  "vmArithmeticTest/arith",
  "vmArithmeticTest/div",
  "vmArithmeticTest/divByZero",
  "vmArithmeticTest/exp",
  "vmArithmeticTest/mod",
  "vmArithmeticTest/not",
  "vmArithmeticTest/sub",
  "vmArithmeticTest/smod",
  "vmArithmeticTest/expPower2",
  "vmArithmeticTest/expPower256",
  "vmArithmeticTest/expPower256Of256",
  "vmArithmeticTest/signextend",
  "vmArithmeticTest/mulmod",
  {
    name: "vmArithmeticTest/mul",
    errors: [
      {
        error: 'stack underflow',
        label: "mul_0_23"
      }
    ]
  },
  "vmArithmeticTest/sdiv",
  {
    name: "vmArithmeticTest/fib",
    errors: [
      {
        error: 'TODO', // this label for also test at ethereumjs failed
        label: ""
      }
    ]
  },
  {
    name: "vmArithmeticTest/twoOps",
    errors: [
      {
        error: 'TODO',
        label: ""
      }
    ]
  },
  {
    name: "vmBitwiseLogicOperation/byte",
    errors: [
      {
        error: 'TODO',
        label: "byte_all"
      }
    ]
  },
  "vmBitwiseLogicOperation/and",
  "vmBitwiseLogicOperation/eq",
  "vmBitwiseLogicOperation/gt",
  "vmBitwiseLogicOperation/iszero",
  "vmBitwiseLogicOperation/lt",
  "vmBitwiseLogicOperation/not",
  "vmBitwiseLogicOperation/or",
  "vmBitwiseLogicOperation/slt",
  "vmBitwiseLogicOperation/xor",
  "vmBitwiseLogicOperation/sgt",
  {
    name: "vmIOandFlowOperations/codecopy",
    errors: [
      {
        error: 'out of gas',
        label: "codecopy_bigbuff"
      },
      {
        error: 'TODO',
        label: "codecopy_opcodes"
      },
      {
        error: 'TODO',
        label: "codecopy_2buff"
      },
    ]
  },
  {
    name:"vmIOandFlowOperations/gas",
    errors:[
      {
        error: 'TODO',
        label: "gas1"
      },
      {
        error: 'TODO',
        label: "gas2"
      },
    ]
  }
]

// sendTest("vmIOandFlowOperations/codecopy.json")

for (let i = 0; i < files.length; i++) {
  let send = true
  for (let j = 0; j < passed.length; j++) {
    const passed_name = passed[j].name ?? passed[j]
    const index = files[i].indexOf(passed_name)
    if (index !== -1) {
      if (files[i].slice(index + passed_name.length) === '.json') {
        send = false
        break
      }
    }
  }
  if (send) {
    // await sendTest(files[i])
  }
}
// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
