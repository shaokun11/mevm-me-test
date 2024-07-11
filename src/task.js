import { HexString } from "aptos";
import { appendFile, readFile, unlink, writeFile } from "node:fs/promises";
import tape from "tape";
import { SENDER_ACCOUNTS, TEST_FORK } from "./comm.js";
import {
    IGNORE_TEST,
    MOVE_VM_SKIP_BLOB_BASEFEE_KEY,
    MOVE_VM_SKIP_BLOB_HASH_KEY,
    MOVE_VM_SKIP_BLOB_KEY,
    MOVE_VM_SKIP_SELFDESTRUCT_KEY,
    MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    MSG_NOT_SUPPORT_BLOB_BASEFEE,
    MSG_NOT_SUPPORT_BLOB_HASH,
    MSG_NOT_SUPPORT_BLOB_TX,
    SKIP_ALL_LABEL,
    SKIP_ALL_NAME,
} from "./skip.js";
import { AptosClient } from "aptos";
import { NODE_URL } from "./config.js";
import { appendFileSync } from "node:fs";
import fse from "fs-extra/esm";
import path from "node:path";
const client = new AptosClient(NODE_URL);

const RUN_STATUS = {
    PASSED: "[PASSED]",
    FAILED: "[FAILED]",
    ERROR: "[ERROR]",
    EXCEPTION: "[EXCEPTION]",
    SKIP: "[SKIP]",
};

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

function isSkip(source, name, index) {
    let comment = "";
    const skip = IGNORE_TEST.some((t) => {
        const skip_labels_index = t.label.split(",");
        const skip_names = t.name.split(",");
        const isSkipLabel =
            skip_labels_index.includes(SKIP_ALL_LABEL) || skip_labels_index.includes(index + "");
        const isPathSkip = t.path.includes(source) || source.startsWith(t.path);
        const isSKipName = skip_names.includes(SKIP_ALL_NAME) || skip_names.includes(name);
        const isSkip = isSKipName && isSkipLabel && isPathSkip;
        if (isSkip) {
            comment = t.comment;
        }
        return isSkip;
    });
    return { skip, comment };
}

function getNewFileName(source, i) {
    const p = path.parse(source);
    fse.ensureDirSync(p.dir.replace("ethereum-tests", "static"));
    return `${p.dir.replace("ethereum-tests", "static")}/${i}-${p.name}.txt`;
}

async function saveMulEnvJson(source, index, data) {
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
    const { index, source, account, all, skipIndex } = opt;
    SENDER_ACCOUNT = SENDER_ACCOUNTS[account];
    const summary_file = getNewFileName(source, index);
    await unlink(summary_file).catch(() => {});
    await appendFile(summary_file, source + "\n");
    const testCase = JSON.parse((await readFile(source, "utf8")).toString());
    const testEnvs = Object.values(testCase);
    const testNames = Object.keys(testCase);
    for (let i = 0; i < testNames.length; i++) {
        const name = `${index}/${all},${i} ` + testNames[i];
        const skipCheckName = testNames[i];
        const json = testEnvs[i];
        const pre = json["pre"];
        const post = json["post"][TEST_FORK];
        if (!post || post.length === 0) {
            const msg = "No " + TEST_FORK + " post state found";
            const output = `${new Date().toISOString()} ${RUN_STATUS.SKIP} ${name} ${msg}`;
            appendFileSync(summary_file, output + "\n");
            continue;
        }
        const tx = json["transaction"];
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
        await saveMulEnvJson(source, i, json);
        for (let [k, v] of Object.entries(pre)) {
            addresses.push(toBuffer(k));
            codes.push(toBuffer(v["code"]));
            balances.push(toBuffer(v["balance"]));
            nonces.push(toBuffer(v["nonce"]));
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
            const gasPrice = [];
            const txType = tx.gasPrice ? 0 : 1;
            if (tx.gasPrice) {
                gasPrice.push(toBuffer(tx.gasPrice));
            } else {
                gasPrice.push(toBuffer(tx.maxFeePerGas), toBuffer(tx.maxPriorityFeePerGas));
            }
            const access_addresses = [];
            const access_storage_keys = [];
            const accessList = tx?.accessList ?? tx.accessLists?.[indexes["data"]] ?? [];

            for (const item of accessList) {
                access_addresses.push(toBuffer(item.address));
                access_storage_keys.push(item.storageKeys.map((k) => toBuffer(k)));
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
                    access_addresses,
                    access_storage_keys,
                    toBuffer(tx.sender),
                    toBuffer(tx.to),
                    toBuffer(tx.data[indexes["data"]]),
                    toBuffer(tx.gasLimit[indexes["gas"]]),
                    gasPrice,
                    toBuffer(tx.value[indexes["value"]]),
                    envs,
                    txType,
                ],
            };
            let label = info["labels"]?.[i] ?? "";
            if (i < skipIndex - 1) continue;
            let loc = `${name} ${i + 1}/${post.length} data:${indexes.data},gas:${indexes.gas},value:${
                indexes.value
            } ${label}`;
            const { skip, comment } = isSkip(source, skipCheckName, i + 1);

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
                            status += RUN_STATUS.PASSED;
                        } else {
                            status += RUN_STATUS.FAILED;
                            msg += JSON.stringify({
                                ...root_data.data,
                                expected: post[i].hash,
                                hash: res.hash,
                            });
                        }
                    } else {
                        if (res.vm_status === MOVE_VM_SKIP_BLOB_KEY) {
                            status = RUN_STATUS.SKIP;
                            msg = MSG_NOT_SUPPORT_BLOB_TX;
                            t.ok(1, MSG_NOT_SUPPORT_BLOB_TX);
                        } else if (res.vm_status === MOVE_VM_SKIP_SELFDESTRUCT_KEY) {
                            status = RUN_STATUS.SKIP;
                            msg = MSG_NOT_IMPLEMENTED_SELFDESTRUCT;
                            t.ok(1, MSG_NOT_IMPLEMENTED_SELFDESTRUCT);
                        } else if (res.vm_status === MOVE_VM_SKIP_BLOB_HASH_KEY) {
                            status = RUN_STATUS.SKIP;
                            msg = MSG_NOT_SUPPORT_BLOB_HASH;
                            t.ok(1, MSG_NOT_IMPLEMENTED_SELFDESTRUCT);
                        } else if (res.vm_status === MOVE_VM_SKIP_BLOB_BASEFEE_KEY) {
                            status = RUN_STATUS.SKIP;
                            msg = MSG_NOT_SUPPORT_BLOB_BASEFEE;
                            t.ok(1, MSG_NOT_IMPLEMENTED_SELFDESTRUCT);
                        } else {
                            t.fail(res.vm_status);
                            status += RUN_STATUS.FAILED;
                            msg += JSON.stringify({
                                error: res.vm_status,
                                hash: res.hash,
                                expected: post[i].hash,
                            });
                        }
                    }
                } catch (error) {
                    t.fail(` ${error.message}`);
                    status += RUN_STATUS.EXCEPTION;
                    msg += `${JSON.stringify({
                        error: error.message,
                    })}`;
                } finally {
                    const output = `${new Date().toISOString()} ${status} ${loc} ${msg}`;
                    await appendFile(summary_file, output + "\n");
                    t.end();
                }
            });
        }
    }
}
