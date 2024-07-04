import { HexString } from "aptos";
import { appendFile, readFile, unlink, writeFile } from "node:fs/promises";
import tape from "tape";
import { SENDER_ACCOUNTS, TEST_FORK } from "./comm.js";
import { IGNORE_TEST, SKIP_ALL_LABEL } from "./skip.js";
import { AptosClient } from "aptos";
import { NODE_URL } from "./config.js";
import { appendFileSync } from "node:fs";
import fse from "fs-extra/esm";
import path from "node:path";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const client = new AptosClient(NODE_URL);

let SENDER_ACCOUNT;
export async function sendTx(payload) {
    const from = SENDER_ACCOUNT.address();
    // there is one tx need about 60s to finish
    const timeoutSecs = 60;
    const txnRequest = await client.generateTransaction(from.hexString, payload, {
        expiration_timestamp_secs: timeoutSecs + Math.trunc(Date.now() / 1000),
    });
    const signedTxn = await client.signTransaction(SENDER_ACCOUNT, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    console.log("Transaction submitted with hash:", transactionRes.hash);
    return client.waitForTransactionWithResult(transactionRes.hash, { timeoutSecs });
}
function toBuffer(hex) {
    if (hex.startsWith("0x")) hex = hex.slice(2);
    if (hex.length % 2 !== 0) hex = "0" + hex;
    hex = "0x" + hex;
    return new HexString(hex).toUint8Array();
}

function isSkip(source, name, label) {
    let comment = "";
    const skip = IGNORE_TEST.some((t) => {
        const skip_labels = t.label.split(",");
        const skip_names = t.name.split(",");
        const isSkipLabel =
            skip_labels.includes(SKIP_ALL_LABEL) || label.length === 0 ? true : skip_labels.includes(label);
        const isPathSkip = t.path.includes(source);
        const isSKipName = skip_names.includes(SKIP_ALL_LABEL)
        const isSkip = isSKipName && isSkipLabel && isPathSkip;
        if (isSkip) {
            comment = t.comment;
        }
        return isSkip;
    });
    return { skip, comment };
}

function hasAccessListOrBlob(tx) {
    const hasAL = tx.accessLists && tx.accessLists.length > 0 && tx.accessLists.every((al) => al.length > 0);
    const hasBlob = tx.blobVersionedHashes && tx.blobVersionedHashes.length > 0;
    return hasAL || hasBlob;
}

function getNewFileName(source, i) {
    const p = path.parse(source);
    fse.ensureDirSync(p.dir.replace("ethereum-tests", "static"));
    return `${p.dir.replace("ethereum-tests", "static")}/${i}-${p.name}.txt`;
}

async function saveMulEnvJson(source, index, data, total) {
    if (total <= 1) return;
    const p = path.parse(source);
    const name = p.name + "-" + index;
    const dir = p.dir.replace("ethereum-tests", "ethereum-tests-parsed");
    fse.ensureDirSync(dir);
    await writeFile(
        `${dir}/${name}.json`,
        JSON.stringify(
            {
                [name]: data,
            },
            null,
            2
        )
    );
}

export async function runTask(opt) {
    const { index, source, account } = opt;
    SENDER_ACCOUNT = SENDER_ACCOUNTS[account];
    const summary_file = getNewFileName(source, index);
    await unlink(summary_file).catch(() => { });
    await appendFile(summary_file, source + "\n");
    const testCase = JSON.parse((await readFile(source, "utf8")).toString());
    const testEnvs = Object.values(testCase);
    const testNames = Object.keys(testCase);
    for (let i = 0; i < testNames.length; i++) {
        const name = `${index},${i} ` + testNames[i];
        const skipCheckName = testNames[i];
        const json = testEnvs[i];
        const pre = json["pre"];
        const post = json["post"][TEST_FORK];
        if (!post || post.length === 0) {
            const msg = "No " + TEST_FORK + " post state found";
            const output = `${new Date().toISOString()} [SKIP] ${name} ${msg}`;
            appendFileSync(summary_file, output + "\n");
            continue;
        }
        const tx = json["transaction"];
        if (hasAccessListOrBlob(tx)) {
            const msg = "AccessList or Blob is not supported";
            const output = `${new Date().toISOString()} [SKIP] ${name} ${msg}`;
            appendFileSync(summary_file, output + "\n");
            continue;
        }
        const info = json["_info"];
        const env = json["env"];
        const addresses = [];
        const codes = [];
        const balances = [];
        const nonces = [];
        const storage_keys = [];
        const storage_values = [];
        const envs = [
            toBuffer(env["currentBaseFee"]),
            toBuffer(env["currentCoinbase"]),
            toBuffer(env["currentDifficulty"]),
            toBuffer(env["currentExcessBlobGas"]),
            toBuffer(env["currentGasLimit"]),
            toBuffer(env["currentNumber"]),
            toBuffer(env["currentRandom"]),
            toBuffer(env["currentTimestamp"]),
        ];
        await saveMulEnvJson(source, i, json, testNames.length);
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
            let gasPrice = tx.gasPrice;
            if (!gasPrice) {
                gasPrice =
                    "0x" +
                    Math.min(
                        parseInt(env["currentBaseFee"]) + parseInt(tx.maxPriorityFeePerGas),
                        parseInt(tx.maxFeePerGas)
                    ).toString(16);
            }
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
                    toBuffer(tx.data[indexes["data"]]),
                    toBuffer(tx.gasLimit[indexes["gas"]]),
                    toBuffer(gasPrice),
                    toBuffer(tx.value[indexes["value"]]),
                    envs,
                ],
            };
            let label = info["labels"]?.[i] ?? "";
            let loc = `${name} ${i + 1}/${post.length} data:${indexes.data},gas:${indexes.gas},value:${indexes.value
                } ${label}`;
            const { skip, comment } = isSkip(source, skipCheckName, label);
            if (skip) {
                const output = `${new Date().toISOString()} [SKIP] ${loc} ${comment}`;
                appendFileSync(summary_file, output + "\n");
                continue;
            }
            let status = "";
            let msg = "";
            tape(loc, async (t) => {
                try {
                    const res = await sendTx(payload);
                    if (res.success) {
                        const root_data = res.events.find(
                            (e) => e.type === "0x1::evm_for_test::ExecResultEvent"
                        );
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
                } catch (error) {
                    t.fail(` ${error.message}`);
                    status += "[EXCEPTION]";
                    msg += `${error.message}`;
                } finally {
                    const output = `${new Date().toISOString()} ${status} ${loc} ${msg}`;
                    await appendFile(summary_file, output + "\n");
                    t.end();
                }
            });
        }
    }
}
