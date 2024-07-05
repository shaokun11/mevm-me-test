import fg from "fast-glob";
import { SUPPORT_DIR } from "./comm.js";
import { runTask } from "./task.js";
import parse from "minimist"
const args = parse(process.argv.slice(2))
let testDir
if (args.index === -1) {
    testDir = "ethereum-tests/GeneralStateTests/"
} else {
    const dir = SUPPORT_DIR[args.index || 0]
    if (!dir) {
        throw new Error("index must be range from 0 to " + SUPPORT_DIR.length + " or -1 for all tests")
    }
    testDir = "ethereum-tests/GeneralStateTests/" + SUPPORT_DIR[args.index || 0] + "/";
}

async function listFiles() {
    const pattern = `${testDir}**/*.json`;
    try {
        const files = await fg(pattern);
        return files;
    } catch (err) {
        console.error("Error reading directory:", err);
    }
}
const files = await listFiles();
files.sort();

for (let i = 44; i < files.length; i++) {
    await runTask({
        index: i,
        source: files[i],
        account: 0,
        all: files.length,
    });
    break;
}

// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
