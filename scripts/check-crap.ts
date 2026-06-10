import { readFileSync } from "fs";
import { resolve } from "path";

interface CoverageEntry {
  fnMap: Record<
    string,
    { name: string; loc: { start: { line: number }; end: { line: number } } }
  >;
  f: Record<string, number>;
  branchMap: Record<
    string,
    { loc: { start: { line: number }; end: { line: number } } }
  >;
  b: Record<string, number[]>;
  statementMap: Record<
    string,
    { start: { line: number }; end: { line: number } }
  >;
  s: Record<string, number>;
  path: string;
}

const CRAP_THRESHOLD = 15;

function estimateCyclomaticComplexity(
  entry: CoverageEntry,
  fnId: string,
): number {
  const fn = entry.fnMap[fnId];
  const fnStart = fn.loc.start.line;
  const fnEnd = fn.loc.end.line;

  let branchCount = 0;
  for (const branchId in entry.branchMap) {
    const branch = entry.branchMap[branchId];
    if (branch.loc.start.line >= fnStart && branch.loc.end.line <= fnEnd) {
      branchCount += entry.b[branchId]?.length ?? 1;
    }
  }

  return 1 + branchCount;
}

function computeFunctionCoverage(entry: CoverageEntry, fnId: string): number {
  const fn = entry.fnMap[fnId];
  const fnStart = fn.loc.start.line;
  const fnEnd = fn.loc.end.line;

  let totalStatements = 0;
  let coveredStatements = 0;

  for (const stmtId in entry.statementMap) {
    const stmt = entry.statementMap[stmtId];
    if (stmt.start.line >= fnStart && stmt.end.line <= fnEnd) {
      totalStatements++;
      if (entry.s[stmtId] > 0) {
        coveredStatements++;
      }
    }
  }

  if (totalStatements === 0) return 1;
  return coveredStatements / totalStatements;
}

function computeCrap(complexity: number, coverage: number): number {
  return Math.pow(complexity, 2) * Math.pow(1 - coverage, 3) + complexity;
}

function main() {
  const coveragePath = resolve(process.cwd(), "coverage/coverage-final.json");
  let coverageData: Record<string, CoverageEntry>;

  try {
    const raw = readFileSync(coveragePath, "utf-8");
    coverageData = JSON.parse(raw);
  } catch {
    console.error(
      "Could not read coverage-final.json. Run tests with coverage first.",
    );
    process.exit(1);
  }

  const violations: {
    file: string;
    fn: string;
    crap: number;
    complexity: number;
    coverage: number;
  }[] = [];

  for (const filePath in coverageData) {
    const entry = coverageData[filePath];
    const relativePath = filePath.replace(process.cwd() + "/", "");

    for (const fnId in entry.fnMap) {
      const fn = entry.fnMap[fnId];
      const complexity = estimateCyclomaticComplexity(entry, fnId);
      const coverage = computeFunctionCoverage(entry, fnId);
      const crap = computeCrap(complexity, coverage);

      if (crap > CRAP_THRESHOLD) {
        violations.push({
          file: relativePath,
          fn: fn.name || `anonymous@L${fn.loc.start.line}`,
          crap: Math.round(crap * 100) / 100,
          complexity,
          coverage: Math.round(coverage * 100),
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log(
      "CRAP check passed. All functions below threshold of",
      CRAP_THRESHOLD,
    );
    process.exit(0);
  }

  const strict = process.argv.includes("--strict");

  console.warn(
    `CRAP check: ${violations.length} function(s) exceed threshold of ${CRAP_THRESHOLD}:\n`,
  );
  for (const v of violations) {
    console.warn(`  ${v.file} → ${v.fn}`);
    console.warn(
      `    CRAP: ${v.crap} | Complexity: ${v.complexity} | Coverage: ${v.coverage}%\n`,
    );
  }

  if (strict) {
    process.exit(1);
  } else {
    console.warn("Run with --strict to fail the build on CRAP violations.");
    process.exit(0);
  }
}

main();
