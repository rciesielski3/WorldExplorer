// Reads the app version and versionCode from every place they are recorded.
// Parsers take file text so they can be reused for content read from git.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
"use strict";

const fs = require("fs");
const path = require("path");

const SEMVER = /^\d+\.\d+\.\d+$/;

// Every regex has three groups: prefix, value, suffix. Reading returns the value
// group; writing swaps only that group, so both share one definition.
function matchOnce(text, regex, label, { unique = true } = {}) {
  const matches = [...text.matchAll(new RegExp(regex.source, `${regex.flags.replace("g", "")}gm`))];
  if (matches.length === 0) throw new Error(`Could not find ${label}`);
  if (unique && matches.length > 1) {
    throw new Error(`Found ${matches.length} matches for ${label}, expected exactly 1`);
  }
  return matches[0];
}

function parseJson(text, file) {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${file} is not valid JSON: ${e.message}`);
  }
}

function semver(value, label) {
  if (typeof value !== "string" || !SEMVER.test(value)) {
    throw new Error(`${label} is missing or not x.y.z (got ${JSON.stringify(value)})`);
  }
  return value;
}

function replaceGroup(text, regex, label, newValue, opts) {
  const m = matchOnce(text, regex, label, opts);
  const prefix = m[1];
  const start = m.index + prefix.length;
  return text.slice(0, start) + String(newValue) + text.slice(start + m[2].length);
}

// Regex-backed source: parse() and replace() share the same pattern.
function regexSource(file, regex, label, convert = String, opts) {
  return {
    file,
    parse: (t) => convert(matchOnce(t, regex, label, opts)[2]),
    replace: (t, v) => replaceGroup(t, regex, label, v, opts),
  };
}

// package.json / package-lock.json are npm-formatted (2-space indent); parse() uses
// JSON, replace() edits only the value so the rest of the file stays byte-identical.
const PKG_VERSION = /^(  "version":\s*")(\d+\.\d+\.\d+)(")/;
const LOCK_ROOT_VERSION = /^(    "": \{[\s\S]*?^      "version":\s*")(\d+\.\d+\.\d+)(")/;

// key -> { file, parse(text), replace(text, newValue) }
const SOURCES = {
  packageJson: {
    file: "package.json",
    parse: (t) => semver(parseJson(t, "package.json").version, 'package.json "version"'),
    replace: (t, v) => replaceGroup(t, PKG_VERSION, 'package.json "version"', v),
  },
  lockVersion: {
    file: "package-lock.json",
    parse: (t) =>
      semver(parseJson(t, "package-lock.json").version, 'package-lock.json top-level "version"'),
    replace: (t, v) => replaceGroup(t, PKG_VERSION, 'package-lock.json top-level "version"', v),
  },
  lockRoot: {
    file: "package-lock.json",
    parse: (t) => {
      const root = (parseJson(t, "package-lock.json").packages || {})[""];
      return semver(root && root.version, 'package-lock.json packages[""].version');
    },
    replace: (t, v) =>
      replaceGroup(t, LOCK_ROOT_VERSION, 'package-lock.json packages[""].version', v),
  },
  gradleName: regexSource(
    "android/app/build.gradle",
    /^(\s*versionName\s+["'])(\d+\.\d+\.\d+)(["']\s*)$/,
    "versionName in build.gradle",
  ),
  gradleCode: regexSource(
    "android/app/build.gradle",
    /^(\s*versionCode\s+)(\d+)(\s*)$/,
    "versionCode in build.gradle",
    Number,
  ),
  appConfigCode: regexSource(
    "app.config.js",
    /^(\s*versionCode:\s*)(\d+)(\s*,)/,
    "android.versionCode in app.config.js",
    Number,
  ),
  // The literal phrase "current version in this repo" is REQUIRED in README.md:
  // it is the anchor both the version check and `npm run bump` rely on.
  readme: regexSource(
    "README.md",
    /(current version in this repo:\s*v?)(\d+\.\d+\.\d+)()/i,
    'the "current version in this repo" line in README.md',
    String,
    { unique: false },
  ),
  releaseNotes: {
    file: "RELEASE_NOTES.md",
    // First version heading only; older versions are listed below it.
    // bump.js inserts a new entry instead of replacing, so there is no replace().
    parse: (t) => {
      const m = t.match(/^## [^\n]*?\bv(\d+\.\d+\.\d+)/m);
      if (!m) throw new Error('Could not find a "## ... vX.Y.Z" heading in RELEASE_NOTES.md');
      return m[1];
    },
  },
};

function readVersions(rootDir) {
  const out = {};
  for (const [key, { file, parse }] of Object.entries(SOURCES)) {
    let text;
    try {
      text = fs.readFileSync(path.join(rootDir, file), "utf8");
    } catch (e) {
      throw new Error(`Cannot read ${file}: ${e.message}`);
    }
    out[key] = parse(text);
  }
  return out;
}

module.exports = { readVersions, SOURCES };
