import fg from "fast-glob";
import { DIR } from "./comm.js";
import { test } from "./task.js";


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

// sendTest("vmIOandFlowOperations/codecopy.json")

for (let i = 37; i < files.length; i++) {
    let has_error = await test({
        index: i,
        source: files[i],
        account: 0,
    })
    console.log("has_error", has_error)
    if (has_error) break;
    // break
}
// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
// ```
// retesteth -t GeneralStateTests -- --clients t8ntool --vmtrace --testfile /home/ubuntu/shaokun/geth-test/test/tests/GeneralStateTests/VMTests/vmIOandFlowOperations/loopsConditionals.json --testpath /home/ubuntu/shaokun/geth-test/test/tests

// ```