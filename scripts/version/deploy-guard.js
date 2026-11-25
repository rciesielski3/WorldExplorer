#!/usr/bin/env node
// Deploy guard: runs first in the release workflow, before any expensive step.
//
//   DRY_RUN=<true|false> REF=<git ref> node scripts/version/deploy-guard.js [--root <dir>]
//
// Fails (exit 1, one "FAIL:" line per reason) when:
//   - version sources disagree (same check as `npm run version:check`);
//   - a REAL publish would reuse a versionCode <= the highest `build-<N>` tag
//     (every upload is tagged `build-<versionCode>` after Play accepts it);
//   - a REAL publish is requested from a ref other than refs/heads/main.
// A dry run never fails on "already uploaded" (re-running a dry run of current
// code is legitimate); it prints a WARNING line instead.
// Only the exact string DRY_RUN=false means a real publish; anything else is a dry run.
// Exit codes: 0 ok, 1 guard failed, 2 usage/parse error.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
"use strict";

const path = require("path");
const { execFileSync } = require("child_process");
const { readVersions } = require("./read.js");
const { main: checkMain } = require("./check.js");

const MAIN_REF = "refs/heads/main";
const TAG_RE = /^build-(\d+)$/;

/**
 * Pure decision function.
 * @param {{versionCode:number, highestTagCode:number|null, sourcesConsistent:boolean,
 *          ref:string, dryRun:boolean}} input
 * @returns {{failures:string[], warnings:string[]}}
 */
function evaluate({ versionCode, highestTagCode, sourcesConsistent, ref, dryRun }) {
  const failures = [];
  const warnings = [];
  if (!sourcesConsistent) {
    failures.push("version sources disagree; run npm run version:check");
  }
  if (highestTagCode != null && versionCode <= highestTagCode) {
    if (dryRun) {
      warnings.push(
        `versionCode ${versionCode} was already uploaded (tag build-${highestTagCode}); a real publish would be refused. Run npm run bump before publishing`,
      );
    } else {
      failures.push(
        `versionCode ${versionCode} was already uploaded (tag build-${highestTagCode}); run npm run bump`,
      );
    }
  }
  if (!dryRun && ref !== MAIN_REF) {
    failures.push(
      `real publish is only allowed from ${MAIN_REF} (got ${ref || "no ref"}); use dry_run=true on branches`,
    );
  }
  return { failures, warnings };
}

function highestBuildTag(root) {
  const out = execFileSync("git", ["tag", "--list", "build-*"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  let highest = null;
  for (const tag of out.split("\n")) {
    const m = TAG_RE.exec(tag.trim());
    if (m) highest = Math.max(highest ?? 0, Number(m[1]));
  }
  return highest;
}

function run(argv, env) {
  let root = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--root" && argv[i + 1]) root = path.resolve(argv[++i]);
    else return { code: 2, lines: [`Deploy guard error: unknown argument ${argv[i]}`] };
  }
  try {
    const check = checkMain(["--root", root]);
    if (check.code === 2) return { code: 2, lines: [check.out] };
    const sourcesConsistent = check.code === 0;
    const versionCode = readVersions(root).gradleCode;
    const dryRun = env.DRY_RUN !== "false";
    const { failures, warnings } = evaluate({
      versionCode,
      highestTagCode: highestBuildTag(root),
      sourcesConsistent,
      ref: env.REF || "",
      dryRun,
    });
    const lines = [
      ...warnings.map((w) => `WARNING: ${w}`),
      ...failures.map((f) => `FAIL: ${f}`),
    ];
    if (failures.length === 0) {
      lines.push(
        `Deploy guard passed: versionCode ${versionCode} (${dryRun ? "dry run" : "real publish"})`,
      );
      return { code: 0, lines };
    }
    return { code: 1, lines };
  } catch (e) {
    return { code: 2, lines: [`Deploy guard error: ${e.message}`] };
  }
}

if (require.main === module) {
  const { code, lines } = run(process.argv.slice(2), process.env);
  for (const l of lines) (code === 0 || l.startsWith("WARNING") ? console.log : console.error)(l);
  process.exit(code);
}

module.exports = { evaluate, highestBuildTag, run };
