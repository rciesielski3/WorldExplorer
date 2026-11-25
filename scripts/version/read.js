// Reads the app version and versionCode from every place they are recorded.
// Parsers take file text so they can be reused for content read from git.
"use strict";

const fs = require("fs");
const path = require("path");

const SEMVER = /^\d+\.\d+\.\d+$/;

function matchOnce(text, regex, label) {
  const matches = [...text.matchAll(new RegExp(regex.source, "gm"))];
  if (matches.length === 0) throw new Error(`Could not find ${label}`);
  if (matches.length > 1) {
    throw new Error(`Found ${matches.length} matches for ${label}, expected exactly 1`);
  }
  return matches[0][1];
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

// key -> { file, parse(text) }
const SOURCES = {
  packageJson: {
    file: "package.json",
    parse: (t) => semver(parseJson(t, "package.json").version, 'package.json "version"'),
  },
  lockVersion: {
    file: "package-lock.json",
    parse: (t) =>
      semver(parseJson(t, "package-lock.json").version, 'package-lock.json top-level "version"'),
  },
  lockRoot: {
    file: "package-lock.json",
    parse: (t) => {
      const root = (parseJson(t, "package-lock.json").packages || {})[""];
      return semver(root && root.version, 'package-lock.json packages[""].version');
    },
  },
  gradleName: {
    file: "android/app/build.gradle",
    parse: (t) =>
      matchOnce(t, /^\s*versionName\s+["'](\d+\.\d+\.\d+)["']\s*$/, "versionName in build.gradle"),
  },
  gradleCode: {
    file: "android/app/build.gradle",
    parse: (t) =>
      Number(matchOnce(t, /^\s*versionCode\s+(\d+)\s*$/, "versionCode in build.gradle")),
  },
  appConfigCode: {
    file: "app.config.js",
    parse: (t) =>
      Number(matchOnce(t, /^\s*versionCode:\s*(\d+)\s*,/, "android.versionCode in app.config.js")),
  },
  readme: {
    file: "README.md",
    parse: (t) => {
      const m = t.match(/current version in this repo:\s*v?(\d+\.\d+\.\d+)/i);
      if (!m)
        throw new Error('Could not find the "current version in this repo" line in README.md');
      return m[1];
    },
  },
  releaseNotes: {
    file: "RELEASE_NOTES.md",
    // First version heading only; older versions are listed below it.
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
