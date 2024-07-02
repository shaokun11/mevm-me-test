import fg from "fast-glob";
import { readFile } from "fs/promises";

async function listFiles() {
    const pattern = `static/**/*.txt`;
    try {
        const files = await fg(pattern);
        return files;
    } catch (err) {
        console.error("Error reading directory:", err);
    }
}
const files = await listFiles();
files.sort();

const SUMMARY = {
    passed: 0,
    failed: 0,
    ignore: 0,
    total: 0,
    errors: []
}


for (let i = 0; i < files.length; i++) {
    let isErr = false;
    const content = await readFile(files[i], "utf8");
    const txtArr = content.split("\n").filter(it => it.length > 0);
    txtArr.forEach(line => {
        if (line.includes("[PASSED]")) {
            SUMMARY.passed += 1;
        } else if (line.includes("[SKIP]")) {
            SUMMARY.ignore += 1
        } else {
            SUMMARY.failed += 1
            isErr = true;
        }
    });
    if (isErr) {
        SUMMARY.errors.push(files[i]);
    }
    SUMMARY.total += txtArr.length;
}
console.log(SUMMARY);