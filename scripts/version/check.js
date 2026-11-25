#!/usr/bin/env node
// Version consistency guard.
//
//   node scripts/version/check.js [--root <dir>] [--base <ref>] [--require-bump]
//
// 1. All version sources must agree (name across 6 places, code across 2).
// 2. With --base <ref>, the versionCode is compared with the merge-base of <ref>
//    and HEAD (so a branch that is merely behind a bumped main is not flagged):
//      - if any version field changed, versionCode must be strictly greater;
//      - with --require-bump, any release-relevant file change also needs a
//        strictly greater versionCode (used by release tooling, not by PR CI).
// Exit codes: 0 ok, 1 check failed, 2 usage/parse error.
"use strict";

const path = require("path");
const { execFileSync } = require("child_process");
const { readVersions, SOURCES } = require("./read.js");

const RELEASE_RELEVANT =
  /^(android\/|src\/|screens\/|components\/|package(-lock)?\.json$|app\.config\.js$)/;
const NAME_KEYS = [
  "packageJson",
  "lockVersion",
  "lockRoot",
  "gradleName",
  "readme",
  "releaseNotes",
];
const CODE_KEYS = ["gradleCode", "appConfigCode"];

class UsageError extends Error {}

function parseArgs(argv) {
  const opts = { root: process.cwd(), base: null, requireBump: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root" || a === "--base") {
      const v = argv[++i];
      if (!v) throw new UsageError(`${a} needs a value`);
      if (a === "--root") opts.root = path.resolve(v);
      else opts.base = v;
    } else if (a === "--require-bump") opts.requireBump = true;
    else throw new UsageError(`Unknown argument: ${a}`);
  }
  if (opts.requireBump && !opts.base) throw new UsageError("--require-bump needs --base <ref>");
  return opts;
}

function git(root, args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    throw new UsageError(
      `git ${args.join(" ")} failed: ${(e.stderr || e.message).toString().trim()}`,
    );
  }
}

function checkConsistency(v) {
  const problems = [];
  const names = new Set(NAME_KEYS.map((k) => v[k]));
  const codes = new Set(CODE_KEYS.map((k) => v[k]));
  if (names.size > 1) problems.push("MISMATCH: version differs between sources");
  if (codes.size > 1) problems.push("MISMATCH: versionCode differs between sources");
  return problems;
}

function table(v) {
  const rows = Object.entries(SOURCES).map(([key, { file }]) => [key, file, String(v[key])]);
  const w = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length)));
  return rows.map((r) => r.map((c, i) => c.padEnd(w[i])).join("  ")).join("\n");
}

function readBase(root, ref) {
  const sha = git(root, ["merge-base", ref, "HEAD"]).trim();
  const base = {};
  for (const [key, { file, parse }] of Object.entries(SOURCES)) {
    const text = git(root, ["show", `${sha}:${file}`]);
    try {
      base[key] = parse(text);
    } catch (e) {
      throw new UsageError(`Cannot parse ${file} at base ${sha.slice(0, 8)}: ${e.message}`);
    }
  }
  return {
    sha,
    base,
    changed: git(root, ["diff", "--name-only", sha, "HEAD"]).split("\n").filter(Boolean),
  };
}

function checkAgainstBase(cur, { sha, base, changed }, requireBump) {
  const problems = [];
  const touched = Object.keys(SOURCES).filter(
    (k) =>
      ["packageJson", "gradleName", "gradleCode", "appConfigCode"].includes(k) &&
      cur[k] !== base[k],
  );
  const increased = cur.gradleCode > base.gradleCode;
  const at = `base ${sha.slice(0, 8)}`;
  if (touched.length > 0 && !increased) {
    problems.push(
      `versionCode ${cur.gradleCode} is not greater than ${base.gradleCode} (${at}) but version fields changed: ${touched.join(", ")}`,
    );
  }
  if (requireBump && !increased) {
    const relevant = changed.filter((f) => RELEASE_RELEVANT.test(f));
    if (relevant.length > 0) {
      problems.push(
        `versionCode ${cur.gradleCode} is not greater than ${base.gradleCode} (${at}) but release-relevant files changed: ${relevant.slice(0, 5).join(", ")}${relevant.length > 5 ? ", ..." : ""}`,
      );
    }
  }
  return problems;
}

function main(argv) {
  const lines = [];
  try {
    const opts = parseArgs(argv);
    const cur = readVersions(opts.root);
    const problems = checkConsistency(cur);
    if (opts.base)
      problems.push(...checkAgainstBase(cur, readBase(opts.root, opts.base), opts.requireBump));
    if (problems.length === 0) {
      lines.push(`Version check passed: ${cur.packageJson} (versionCode ${cur.gradleCode})`);
      return { code: 0, out: lines.join("\n") };
    }
    lines.push(table(cur), "", ...problems.map((p) => `FAIL ${p}`));
    return { code: 1, out: lines.join("\n") };
  } catch (e) {
    return { code: 2, out: `Version check error: ${e.message}` };
  }
}

if (require.main === module) {
  const { code, out } = main(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { main };
