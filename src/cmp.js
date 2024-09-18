import { createReadStream, readFileSync } from "fs";
import { writeFile } from "fs/promises";
import readline from "readline";

async function readLog(path) {
    const lines = [];
    const fileStream = createReadStream(path);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        const info = line.split(":");
        lines.push({
            key: info[0],
            value: info[1],
        });
    }
    return lines;
}

const movelogs = await readLog("move.log");
const evmLogs = await readLog("evm.log");
const info = [];
const info2 = [];
movelogs.forEach((move) => {
    const evm = evmLogs.find((evm) => evm.key === move.key);
    if (evm) {
        info.push({
            key: move.key,
            move: Math.floor(move.value / 1000),
            evm: +evm.value,
            diff: Math.floor(move.value / 1000) - evm.value,
        });
    } else {
        info2.push({
            key: move.key,
            value: move.value,
            evm: "N/A",
        });
    }
});
console.log("all count:", info.length);
writeFile("info.json", JSON.stringify(info, null, 2));
writeFile("info2.json", JSON.stringify(info2, null, 2));
