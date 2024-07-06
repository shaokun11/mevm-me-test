import fg from "fast-glob";
import { SUPPORT_DIR } from "./comm.js";
import { runTask } from "./task.js";
import parse from "minimist"
const args = parse(process.argv.slice(2))
let testDir = "ethereum-tests/GeneralStateTests/"

if (args.index === 0) {
    // default all tests
} else {
    // not set index, default to 1
    const dir = SUPPORT_DIR[args.index || 1]
    if (!dir) {
        throw new Error("index must be range from 1 to " + Object.keys(SUPPORT_DIR).length + " or 0 for all tests")
    }
    testDir = testDir + SUPPORT_DIR[args.index || 1] + "/";
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

for (let i = 58; i < files.length; i++) {
    await runTask({
        index: i,
        source: files[i],
        account: 0,
        all: files.length,
        skipIndex: 0
    });
    // break;
}

// https://evm-test-rpc.bbd.sh/v1/transactions/by_hash/0x03e1876285baa81157fc9cf8bf9b8bd1accebd5d9bb8acfcf5084c81132c7e2d
