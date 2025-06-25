// This script summarizes the most common ESLint errors from the JSON report.
const fs = require("fs"); // eslint-disable-next-line @typescript-eslint/no-require-imports

const report = JSON.parse(fs.readFileSync("eslint-report.json", "utf-8"));
const errorSummary = {};

for (const file of report) {
  for (const msg of file.messages) {
    const rule = msg.ruleId || "unknown";
    if (!errorSummary[rule]) errorSummary[rule] = 0;
    errorSummary[rule]++;
  }
}

const sorted = Object.entries(errorSummary).sort((a, b) => b[1] - a[1]);
console.log("Most common ESLint errors:");
for (const [rule, count] of sorted) {
  console.log(`${rule}: ${count}`);
}
