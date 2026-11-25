#!/usr/bin/env node
// Bumps the app version in every place it is recorded, all or nothing.
//
//   node scripts/version/bump.js <patch|minor|major> [--to X.Y.Z] [--dry-run] [--root <dir>]
//   npm run bump -- patch --dry-run
//
// - Refuses to run unless check.js passes first (sources must already agree).
// - versionCode is always current + 1; `--to <current version>` is a no-op (idempotent).
// - All new file contents are computed before anything is written; if a write or the
//   final check.js run fails, every file is restored to its original content.
// - No git operations. Commit the result yourself.
// Exit codes: 0 ok / already at target / dry run, 1 refused or failed, 2 usage error.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
"use strict";

const fs = require("fs");
const path = require("path");
const { readVersions, SOURCES } = require("./read.js");
const { main: check } = require("./check.js");

const KINDS = ["patch", "minor", "major"];
const USAGE = "Usage: npm run bump -- <patch|minor|major> [--to X.Y.Z] [--dry-run]";
const SEMVER = /^\d+\.\d+\.\d+$/;
const LATEST_HEADING = /^## 🚀 Latest Release: v(\d+\.\d+\.\d+)[^\n]*$/m;

class UsageError extends Error {}

function parseArgs(argv) {
  const opts = { kind: null, to: null, dryRun: false, root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--to" || a === "--root") {
      const v = argv[++i];
      if (!v) throw new UsageError(`${a} needs a value\n${USAGE}`);
      if (a === "--to") opts.to = v;
      else opts.root = path.resolve(v);
    } else if (KINDS.includes(a)) opts.kind = a;
    else throw new UsageError(`Unknown argument: ${a}\n${USAGE}`);
  }
  if (!opts.kind && !opts.to) throw new UsageError(`Nothing to do.\n${USAGE}`);
  if (opts.to && !SEMVER.test(opts.to)) {
    throw new UsageError(`--to must look like X.Y.Z (got "${opts.to}")`);
  }
  return opts;
}

const parts = (v) => v.split(".").map(Number);

function compare(a, b) {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function nextVersion(current, kind) {
  const [major, minor, patch] = parts(current);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function releaseNotesStub(version, code, now) {
  const date = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return [
    `## 🚀 Latest Release: v${version}`,
    "",
    `**Release Date:** ${date}`,
    `**Version:** ${version} (versionCode ${code})`,
    "**Platform:** Android (Google Play Store)",
    "",
    "**What's New:**",
    "- TODO: describe the user-facing changes in this release",
    "",
    "---",
    "",
    "",
  ].join("\n");
}

function updateReleaseNotes(text, version, code, now) {
  // Demote the previous "Latest Release" heading, then insert the stub above the first entry.
  const demoted = text.replace(LATEST_HEADING, (_m, v) => `## v${v}`);
  const first = demoted.search(/^## /m);
  if (first === -1) throw new Error("RELEASE_NOTES.md has no '## ' entry to insert before");
  return demoted.slice(0, first) + releaseNotesStub(version, code, now) + demoted.slice(first);
}

// Returns the new text per file plus a change list for display. Nothing is written.
function plan(root, current, target, newCode, now) {
  const texts = new Map();
  const changes = [];
  const rows = {
    packageJson: ["package.json", "version", current.packageJson, target],
    lockVersion: ["package-lock.json", "version (top level)", current.lockVersion, target],
    lockRoot: ["package-lock.json", 'packages[""].version', current.lockRoot, target],
    gradleName: ["android/app/build.gradle", "versionName", current.gradleName, target],
    gradleCode: ["android/app/build.gradle", "versionCode", current.gradleCode, newCode],
    appConfigCode: ["app.config.js", "android.versionCode", current.appConfigCode, newCode],
    readme: ["README.md", "current version in this repo", current.readme, target],
    releaseNotes: ["RELEASE_NOTES.md", "new top entry", `v${current.releaseNotes}`, `v${target}`],
  };
  for (const [key, source] of Object.entries(SOURCES)) {
    const file = source.file;
    if (!texts.has(file)) texts.set(file, fs.readFileSync(path.join(root, file), "utf8"));
    const value = key === "gradleCode" || key === "appConfigCode" ? newCode : target;
    const updated =
      key === "releaseNotes"
        ? updateReleaseNotes(texts.get(file), target, newCode, now)
        : source.replace(texts.get(file), value);
    if (source.parse(updated) !== value) {
      throw new Error(`Internal error: ${file} (${key}) did not read back as ${value}`);
    }
    texts.set(file, updated);
    changes.push(rows[key]);
  }
  return { texts, changes };
}

function table(changes) {
  const header = ["file", "field", "from", "to"];
  const rows = [header, ...changes.map((r) => r.map(String))];
  const w = header.map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  return rows
    .map((r) =>
      r
        .map((c, i) => c.padEnd(w[i]))
        .join("  ")
        .trimEnd(),
    )
    .join("\n");
}

// Restoring always uses the real fs, never the injectable writer.
function restore(originals, root) {
  const failed = [];
  for (const [file, text] of originals) {
    try {
      fs.writeFileSync(path.join(root, file), text);
    } catch (e) {
      failed.push(`${file}: ${e.message}`);
    }
  }
  return failed;
}

function main(argv, io = {}) {
  const writeFile = io.writeFile || fs.writeFileSync;
  const now = io.now || new Date();
  try {
    const opts = parseArgs(argv);
    const { root } = opts;

    const pre = check(["--root", root]);
    if (pre.code !== 0) {
      return {
        code: 1,
        out: `Refusing to bump: version sources are not consistent.\n\n${pre.out}\n\nFix them first (git diff / git log), then rerun.`,
      };
    }

    const current = readVersions(root);
    const from = current.packageJson;
    const target = opts.to || nextVersion(from, opts.kind);
    if (target === from) {
      return {
        code: 0,
        out: `Version is already at ${from} (versionCode ${current.gradleCode}); nothing to do.`,
      };
    }
    if (compare(target, from) < 0) {
      return {
        code: 1,
        out: `Target ${target} must be greater than the current version ${from}.`,
      };
    }

    const newCode = current.gradleCode + 1;
    const { texts, changes } = plan(root, current, target, newCode, now);
    const summary = `${from} (${current.gradleCode}) -> ${target} (${newCode})`;

    if (opts.dryRun) {
      return { code: 0, out: `Dry run: ${summary}\n\n${table(changes)}\n\nNothing was written.` };
    }

    const originals = new Map(
      [...texts.keys()].map((f) => [f, fs.readFileSync(path.join(root, f), "utf8")]),
    );
    try {
      for (const [file, text] of texts) writeFile(path.join(root, file), text);
      const post = check(["--root", root]);
      if (post.code !== 0) throw new Error(`post-write check failed:\n${post.out}`);
    } catch (e) {
      const failed = restore(originals, root);
      const tail = failed.length
        ? `\nWARNING: could not restore: ${failed.join("; ")}. Run git checkout on the version files.`
        : "\nAll files restored; nothing was changed.";
      return { code: 1, out: `Bump failed: ${e.message}${tail}` };
    }
    return {
      code: 0,
      out: `Bumped ${summary}\n\n${table(changes)}\n\nNext: fill in the RELEASE_NOTES.md stub, run npm run version:check, commit.`,
    };
  } catch (e) {
    return { code: e instanceof UsageError ? 2 : 1, out: e.message };
  }
}

if (require.main === module) {
  const { code, out } = main(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { main };
