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
    errors: [],
};

const CHILD_DIR_SUMMARY = {};

const addSummary = (name, key) => {
    if (!CHILD_DIR_SUMMARY[name]) {
        CHILD_DIR_SUMMARY[name] = {
            passed: 0,
            failed: 0,
            ignore: 0,
            total: 0,
        };
    }
    CHILD_DIR_SUMMARY[name][key] += 1;
    CHILD_DIR_SUMMARY[name].total += 1;
    SUMMARY.total += 1;
    SUMMARY[key] += 1;
};

for (let i = 0; i < files.length; i++) {
    let isErr = false;
    const content = await readFile(files[i], "utf8");
    const txtArr = content.split("\n").filter((it) => it.length > 0);
    // the first line is test file path
    const loc = txtArr.shift();
    const dir = loc.slice(33, loc.slice(33).indexOf("/") + 33);
    txtArr.forEach((line) => {
        if (line.includes("[PASSED]")) {
            addSummary(dir, "passed");
        } else if (line.includes("[SKIP]")) {
            addSummary(dir, "ignore");
        } else {
            isErr = true;
            addSummary(dir, "failed");
        }
    });
    if (isErr) {
        SUMMARY.errors.push(files[i] + " | " + loc);
    }
}
console.log({
    date: new Date().toISOString(),
    ...SUMMARY,
    ...CHILD_DIR_SUMMARY,

});
