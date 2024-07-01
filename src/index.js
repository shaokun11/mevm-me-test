import fg from "fast-glob";
import { DIR } from "./comm.js";
import { runTask } from "./task.js";

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

for (let i = 60; i < files.length; i++) {
    await runTask({
        index: i,
        source: files[i],
        account: 0,
    });
    // break
}

// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
// ```
//
// ```

