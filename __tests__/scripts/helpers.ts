import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export const V = "2.1.1";
export const CODE = 155;

// Minimal synthetic repo files at a given version/versionCode.
export const files = (version = V, code = CODE): Record<string, string> => ({
  "package.json": JSON.stringify({ name: "x", version }, null, 2) + "\n",
  "package-lock.json":
    JSON.stringify(
      { name: "x", version, lockfileVersion: 3, packages: { "": { name: "x", version } } },
      null,
      2,
    ) + "\n",
  "android/app/build.gradle": `android {\n    defaultConfig {\n        versionCode ${code}\n        versionName "${version}"\n    }\n}\n`,
  "app.config.js": `module.exports = { expo: { android: {\n  versionCode: ${code}, // keep in sync\n} } };\n`,
  "README.md": `# X\n\nPublished; current version in this repo: ${version}.\n`,
  "RELEASE_NOTES.md": `# Release Notes\n\n## Latest Release: v${version}\n\n## v2.1.0\n`,
});

const tmpDirs: string[] = [];

export const makeTempDir = (prefix = "versionscripts-"): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
};

export const cleanupTempDirs = (): void => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
};

export const write = (dir: string, map: Record<string, string>): void => {
  for (const [rel, content] of Object.entries(map)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
};

export const makeRepo = (overrides: Record<string, string> = {}): string => {
  const dir = makeTempDir("versioncheck-");
  write(dir, { ...files(), ...overrides });
  return dir;
};

export const git = (dir: string, ...args: string[]): Buffer =>
  execFileSync(
    "git",
    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    { cwd: dir, stdio: "pipe" },
  );

export const commitAll = (dir: string, msg: string): void => {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", msg);
};

export const SOURCE_FILES = [
  "package.json",
  "package-lock.json",
  "android/app/build.gradle",
  "app.config.js",
  "README.md",
  "RELEASE_NOTES.md",
];

export const REAL_ROOT = path.resolve(__dirname, "../..");

// Temp dir holding byte-for-byte copies of the repo's real version source files.
export const makeRealCopy = (): string => {
  const dir = makeTempDir("versionbump-");
  for (const rel of SOURCE_FILES) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(REAL_ROOT, rel), dest);
  }
  return dir;
};
