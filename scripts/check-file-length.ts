import { execSync } from "child_process";

const MAX_LINES = 160;

const EXCLUDE_PATTERNS = [
  "*.test.*",
  "*.d.ts",
  "*/test/*",
  "*/node_modules/*",
  "*/.git/*",
  "*/dist/*",
  "scripts/*",
  "e2e/*",
  "amplify/function/__mocks__/*",
];

const files = execSync(
  `find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) ${EXCLUDE_PATTERNS.map((p) => `-not -path "${p}"`).join(" ")}`,
  { encoding: "utf-8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

const violations: { file: string; lines: number }[] = [];

for (const file of files) {
  const content = execSync(`wc -l < "${file}"`, { encoding: "utf-8" }).trim();
  const lines = parseInt(content, 10);
  if (lines > MAX_LINES) {
    violations.push({ file, lines });
  }
}

if (violations.length === 0) {
  console.log(
    `File length check passed. All source files are under ${MAX_LINES} lines.`,
  );
  process.exit(0);
}

console.error(
  `File length check failed: ${violations.length} file(s) exceed ${MAX_LINES} lines:\n`,
);
for (const v of violations) {
  console.error(`  ${v.file} — ${v.lines} lines`);
}
process.exit(1);
