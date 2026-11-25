import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { SOURCE_FILES, cleanupTempDirs, makeRealCopy } from "./helpers";

/* eslint-disable @typescript-eslint/no-require-imports */
const bumpScript = path.resolve(__dirname, "../../scripts/version/bump.js");
const { main: bump } = require("../../scripts/version/bump.js");
const { main: check } = require("../../scripts/version/check.js");
const { readVersions } = require("../../scripts/version/read.js");
/* eslint-enable @typescript-eslint/no-require-imports */

afterAll(cleanupTempDirs);

const snapshot = (dir: string): Record<string, string> =>
  Object.fromEntries(SOURCE_FILES.map((f) => [f, fs.readFileSync(path.join(dir, f), "utf8")]));

const next = (v: string, kind: "patch" | "minor" | "major"): string => {
  const [a, b, c] = v.split(".").map(Number);
  return kind === "major"
    ? `${a + 1}.0.0`
    : kind === "minor"
      ? `${a}.${b + 1}.0`
      : `${a}.${b}.${c + 1}`;
};

describe("bump.js", () => {
  it.each(["patch", "minor", "major"] as const)("%s bumps every source", (kind) => {
    const dir = makeRealCopy();
    const before = readVersions(dir);
    const target = next(before.packageJson, kind);

    const r = bump([kind, "--root", dir]);
    expect(r.code).toBe(0);

    expect(readVersions(dir)).toEqual({
      packageJson: target,
      lockVersion: target,
      lockRoot: target,
      gradleName: target,
      gradleCode: before.gradleCode + 1,
      appConfigCode: before.gradleCode + 1,
      readme: target,
      releaseNotes: target,
    });
    expect(check(["--root", dir]).code).toBe(0);
  });

  it("only touches the version lines (diff is minimal, dependency entries untouched)", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    const v = readVersions(dir);
    expect(bump(["patch", "--root", dir]).code).toBe(0);
    const after = snapshot(dir);

    const lockBefore = JSON.parse(before["package-lock.json"]);
    const lockAfter = JSON.parse(after["package-lock.json"]);
    lockBefore.version = lockAfter.version;
    lockBefore.packages[""].version = lockAfter.packages[""].version;
    expect(lockAfter).toEqual(lockBefore);

    const changedLines = (a: string, b: string) => {
      const x = a.split("\n");
      const y = b.split("\n");
      return y.filter((line, i) => line !== x[i]).length;
    };
    expect(changedLines(before["package.json"], after["package.json"])).toBe(1);
    expect(changedLines(before["package-lock.json"], after["package-lock.json"])).toBe(2);
    expect(
      changedLines(before["android/app/build.gradle"], after["android/app/build.gradle"]),
    ).toBe(2);
    expect(changedLines(before["app.config.js"], after["app.config.js"])).toBe(1);
    expect(after["app.config.js"]).toContain(`versionCode: ${v.gradleCode + 1}, //`);
  });

  it("--to sets an explicit version", () => {
    const dir = makeRealCopy();
    const before = readVersions(dir);
    const r = bump(["--to", "3.4.5", "--root", dir]);
    expect(r.code).toBe(0);
    const after = readVersions(dir);
    expect(after.packageJson).toBe("3.4.5");
    expect(after.gradleCode).toBe(before.gradleCode + 1);
    expect(check(["--root", dir]).code).toBe(0);
  });

  it("--to wins over the bump kind", () => {
    const dir = makeRealCopy();
    expect(bump(["patch", "--to", "5.0.0", "--root", dir]).code).toBe(0);
    expect(readVersions(dir).packageJson).toBe("5.0.0");
  });

  it("--to rejects a version that is not greater than the current one", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    const r = bump(["--to", "0.0.1", "--root", dir]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/greater/);
    expect(snapshot(dir)).toEqual(before);
  });

  it("--to rejects a malformed version", () => {
    const dir = makeRealCopy();
    expect(bump(["--to", "1.2", "--root", dir]).code).toBe(2);
  });

  it("is idempotent: --to the current version exits 0 and changes nothing", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    const current = readVersions(dir).packageJson;
    const r = bump(["--to", current, "--root", dir]);
    expect(r.code).toBe(0);
    expect(r.out).toContain(`already at ${current}`);
    expect(snapshot(dir)).toEqual(before);
  });

  it("re-running --to X after a bump does not increment the versionCode twice", () => {
    const dir = makeRealCopy();
    const code = readVersions(dir).gradleCode;
    expect(bump(["--to", "9.0.0", "--root", dir]).code).toBe(0);
    expect(bump(["--to", "9.0.0", "--root", dir]).code).toBe(0);
    expect(readVersions(dir).gradleCode).toBe(code + 1);
  });

  it("--dry-run prints the plan and writes nothing", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    const v = readVersions(dir);
    const r = bump(["minor", "--dry-run", "--root", dir]);
    expect(r.code).toBe(0);
    expect(r.out).toContain(next(v.packageJson, "minor"));
    expect(r.out).toContain(String(v.gradleCode + 1));
    expect(r.out).toMatch(/dry run/i);
    for (const f of SOURCE_FILES) expect(r.out).toContain(f);
    expect(snapshot(dir)).toEqual(before);
  });

  it.each([
    ["package.json", (t: string) => t.replace(/"version": "[^"]+"/, '"version": "9.9.9"')],
    [
      "README.md",
      (t: string) =>
        t.replace(
          /current version in this repo:\s*v?[\d.]+/i,
          "current version in this repo: 9.9.9",
        ),
    ],
    ["android/app/build.gradle", (t: string) => t.replace(/versionCode\s+\d+/, "versionCode 999")],
  ])("refuses to write when %s is inconsistent", (file, mutate) => {
    const dir = makeRealCopy();
    fs.writeFileSync(path.join(dir, file), mutate(fs.readFileSync(path.join(dir, file), "utf8")));
    const before = snapshot(dir);
    const r = bump(["patch", "--root", dir]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/MISMATCH|refus/i);
    expect(snapshot(dir)).toEqual(before);
  });

  it("refuses on unparseable sources", () => {
    const dir = makeRealCopy();
    fs.writeFileSync(path.join(dir, "android/app/build.gradle"), "nothing here\n");
    const before = snapshot(dir);
    const r = bump(["patch", "--root", dir]);
    expect(r.code).not.toBe(0);
    expect(snapshot(dir)).toEqual(before);
  });

  it("is atomic: a write failure part-way restores every file", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    let calls = 0;
    const real = fs.writeFileSync;
    const io = {
      writeFile: (file: string, data: string) => {
        calls += 1;
        if (calls === 3) throw new Error("disk full");
        real(file, data);
      },
    };
    const r = bump(["patch", "--root", dir], io);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/disk full/);
    expect(calls).toBeGreaterThanOrEqual(3);
    expect(snapshot(dir)).toEqual(before);
  });

  it("restores everything if the post-write check fails", () => {
    const dir = makeRealCopy();
    const before = snapshot(dir);
    // Writer corrupts the README so the final check cannot pass.
    const real = fs.writeFileSync;
    const io = {
      writeFile: (file: string, data: string) =>
        real(file, file.endsWith("README.md") ? data.replace(/\d+\.\d+\.\d+\./, "0.0.0.") : data),
    };
    const r = bump(["patch", "--root", dir], io);
    expect(r.code).toBe(1);
    expect(snapshot(dir)).toEqual(before);
  });

  describe("RELEASE_NOTES.md", () => {
    it("inserts a stub on top and demotes the previous Latest Release heading", () => {
      const dir = makeRealCopy();
      const prev = readVersions(dir);
      const oldNotes = fs.readFileSync(path.join(dir, "RELEASE_NOTES.md"), "utf8");
      bump(["patch", "--root", dir]);
      const target = next(prev.packageJson, "patch");
      const notes = fs.readFileSync(path.join(dir, "RELEASE_NOTES.md"), "utf8");

      const headings = notes.split("\n").filter((l) => l.startsWith("## "));
      expect(headings[0]).toBe(`## 🚀 Latest Release: v${target}`);
      expect(headings[1]).toBe(`## v${prev.packageJson}`);
      expect(notes).toContain(`**Version:** ${target} (versionCode ${prev.gradleCode + 1})`);
      expect(notes).toContain("**Platform:** Android (Google Play Store)");
      expect(notes).toMatch(/\*\*Release Date:\*\* \w+ \d{4}/);
      expect(notes).toContain("**What's New:**");
      // The old body is preserved verbatim apart from the demoted heading.
      expect(notes).toContain(oldNotes.slice(oldNotes.indexOf("**Release Date:**")));
    });
  });

  describe("CLI", () => {
    const run = (...args: string[]) => {
      const r = spawnSync("node", [bumpScript, ...args], { encoding: "utf8" });
      return { status: r.status, out: `${r.stdout}${r.stderr}` };
    };

    it("exits 2 with usage when no target is given", () => {
      const r = run("--root", makeRealCopy());
      expect(r.status).toBe(2);
      expect(r.out).toMatch(/usage/i);
    });

    it("exits 2 on unknown arguments", () => {
      expect(run("patch", "--nope", "--root", makeRealCopy()).status).toBe(2);
    });

    it("bumps end to end and the result passes check.js", () => {
      const dir = makeRealCopy();
      expect(run("patch", "--root", dir).status).toBe(0);
      expect(check(["--root", dir]).code).toBe(0);
    });
  });
});
