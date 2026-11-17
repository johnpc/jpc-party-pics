import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

// Cross-checks docs/state-machines.md against the source tree:
//  1. every catalogue row has an owner file carrying `// @state-machine <id>`;
//  2. every marker in src/ has a row;
//  3. every test file a row cites exists;
//  4. every source file that declares a status-shaped type or boolean useState
//     is mentioned somewhere on the page (so new machines get catalogued).
const CATALOGUE = "docs/state-machines.md";
const MARKER = /@state-machine\s+([a-z0-9-]+)/g;
const STATUS_SHAPED = [
  /useState(?:<boolean>)?\((?:true|false)\)/,
  /useState<\s*"[^"]+"\s*\|/,
  /type\s+\w+\s*=\s*\n?\s*\|?\s*"[^"]+"\s*\|/,
  /\{\s*kind:\s*"/,
];

const doc = readFileSync(CATALOGUE, "utf-8");
const errors: string[] = [];

interface Row {
  id: string;
  owner: string;
  tests: string[];
}

const rows: Row[] = [];
for (const line of doc.split("\n")) {
  const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([^`]+)`\s*\|(.*)\|\s*$/);
  if (!m) continue;
  const cells = m[3].split("|");
  const testsCell = cells[cells.length - 1] ?? "";
  const tests = [...testsCell.matchAll(/`([^`]+)`/g)].map((t) => t[1]);
  rows.push({ id: m[1], owner: m[2], tests });
}

const sourceFiles = execSync(
  'find src -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -name "*.test.*" -not -path "src/test/*"',
  { encoding: "utf-8" },
)
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((f) => f.replace(/^\.\//, ""));

const markers = new Map<string, string[]>();
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf-8");
  for (const m of text.matchAll(MARKER)) {
    markers.set(m[1], [...(markers.get(m[1]) ?? []), file]);
  }
}

for (const row of rows) {
  if (!existsSync(row.owner)) {
    errors.push(`${row.id}: owner ${row.owner} does not exist`);
    continue;
  }
  const files = markers.get(row.id) ?? [];
  if (!files.includes(row.owner)) {
    errors.push(`${row.id}: ${row.owner} lacks "// @state-machine ${row.id}"`);
  }
  if (row.tests.length === 0) errors.push(`${row.id}: cites no tests`);
  for (const test of row.tests) {
    if (!existsSync(test))
      errors.push(`${row.id}: test ${test} does not exist`);
  }
}

const rowIds = new Set(rows.map((r) => r.id));
for (const [id, files] of markers) {
  if (!rowIds.has(id)) {
    errors.push(`marker "${id}" in ${files.join(", ")} has no catalogue row`);
  }
  if (files.length > 1) {
    errors.push(`marker "${id}" appears in several files: ${files.join(", ")}`);
  }
}

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf-8");
  if (!STATUS_SHAPED.some((re) => re.test(text))) continue;
  if (!doc.includes(file)) {
    errors.push(
      `${file} declares a status-shaped state but is not mentioned in ${CATALOGUE}`,
    );
  }
}

if (errors.length > 0) {
  console.error(`State-machine catalogue check failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `State-machine catalogue check passed: ${rows.length} rows, ${markers.size} markers, ${sourceFiles.length} source files swept.`,
);
