import fg from "fast-glob";
import { AptosClient, HexString } from "aptos";
import { NODE_URL } from "./config.js";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import tape from "tape";
import { DIR, SENDER_ACCOUNTS, TEST_FORK } from "./comm.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function listFiles() {
    const pattern = `${DIR}**/*.json`;
    try {
        const files = await fg(pattern);
        return files;
    } catch (err) {
        console.error("Error reading directory:", err);
    }
}
const files = await listFiles();
files.sort();

const client = new AptosClient(NODE_URL);
let SENDER_ACCOUNT;

export async function sendTx(payload) {
    const from = SENDER_ACCOUNT.address();
    const txnRequest = await client.generateTransaction(from.hexString, payload);
    const signedTxn = await client.signTransaction(SENDER_ACCOUNT, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    return client.getTransactionByHash(transactionRes.hash);
}
function toBuffer(hex) {
    if (hex.startsWith("0x")) hex = hex.slice(2);
    if (hex.length % 2 !== 0) hex = "0" + hex;
    hex = "0x" + hex;
    return new HexString(hex).toUint8Array();
}

async function timeoutExe(ms) {
    await sleep(ms);
    return {
        success: false,
        vm_status: "timeout",
        hash: "0x0",
    };
}

export async function test(opt) {
    const { index, source, account } = opt;
    SENDER_ACCOUNT = SENDER_ACCOUNTS[account];
    const key = source.substring(source.lastIndexOf("/") + 1, source.lastIndexOf("."));
    const source_file = source.slice(DIR.length);
    const summary_file = `static/${index}-${source_file.replace("/", "-").replace(".json", "")}.txt`;
    // reset summary file
    await writeFile(summary_file, "");
    const json = JSON.parse((await readFile(source, "utf8")).toString());
    const pre = json[key]["pre"];
    const post = json[key]["post"][TEST_FORK];
    if (!post || post.length === 0) {
        console.log("No post state found for ", source);
        return has_error;
    }
    const tx = json[key]["transaction"];
    const info = json[key]["_info"];
    const addresses = [];
    const codes = [];
    const balances = [];
    const nonces = [];
    const storage_keys = [];
    const storage_values = [];
    for (let [k, v] of Object.entries(pre)) {
        addresses.push(toBuffer(k));
        codes.push(toBuffer(v["code"]));
        balances.push(toBuffer(v["balance"]));
        nonces.push(parseInt(v["nonce"]));
        const storage_map = v["storage"];
        if (storage_map) {
            const keys = [];
            const values = [];
            for (let [k, v] of Object.entries(storage_map)) {
                keys.push(toBuffer(k));
                values.push(toBuffer(v));
            }
            storage_keys.push(keys);
            storage_values.push(values);
        } else {
            storage_keys.push([]);
            storage_values.push([]);
        }
    }
    for (let i = 0; i < post.length; i++) {
        const indexes = post[i].indexes;
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
                toBuffer(indexes["data"] !== undefined ? tx.data[indexes["data"]] : "0x"),
                toBuffer(tx.gasPrice),
                toBuffer(indexes["value"] !== undefined ? tx.value[indexes["value"]] : "0x0"),
            ],
        };
        const label = info["labels"]?.[i] ?? "";
        let loc = `${source} ${i + 1}/${post.length} ${label} `;
        let status = "";
        let msg = "";
        const timeout = 20 * 1000;
        tape(loc, { timeout: timeout }, async (t) => {
            const res = await Promise.race([sendTx(payload), timeoutExe(timeout - 1000)]);
            if (res.success) {
                const root_data = res.events.find((e) => e.type === "0x1::evm_for_test::ExecResultEvent");
                t.equals(root_data.data.state_root, post[i].hash);
                if (post[i].hash === root_data.data.state_root) {
                    status += "[PASSED]";
                } else {
                    status += "[FAILED]";
                    msg += JSON.stringify({
                        ...root_data.data,
                        expected: post[i].hash,
                        hash: res.hash,
                    });
                }
            } else {
                t.fail(res.vm_status);
                status += "[ERROR]";
                msg += JSON.stringify({
                    error: res.vm_status,
                    hash: res.hash,
                    expected: post[i].hash,
                });
            }
            const output = `${new Date().toISOString()} ${status} ${loc} ${msg}`;
            await appendFile(summary_file, output + "\n");
        });
    }
}

// sendTest("vmIOandFlowOperations/codecopy.json")

for (let i = 37; i < files.length; i++) {
    await test({
        index: i,
        source: files[i],
        account: 0,
    });
}

// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
// ```
// retesteth -t GeneralStateTests -- --clients t8ntool --vmtrace --testfile /home/ubuntu/shaokun/geth-test/test/tests/GeneralStateTests/VMTests/vmIOandFlowOperations/loopsConditionals.json --testpath /home/ubuntu/shaokun/geth-test/test/tests

// ```
