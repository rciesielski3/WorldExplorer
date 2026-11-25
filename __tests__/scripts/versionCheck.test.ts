import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const checkScript = path.resolve(__dirname, "../../scripts/version/check.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { readVersions } = require("../../scripts/version/read.js");

const V = "2.1.1";
const CODE = 155;

const files = (version = V, code = CODE) => ({
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
const makeRepo = (overrides: Record<string, string> = {}): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "versioncheck-"));
  tmpDirs.push(dir);
  write(dir, { ...files(), ...overrides });
  return dir;
};
const write = (dir: string, map: Record<string, string>) => {
  for (const [rel, content] of Object.entries(map)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
};
const git = (dir: string, ...args: string[]) =>
  execFileSync(
    "git",
    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    {
      cwd: dir,
      stdio: "pipe",
    },
  );
const commitAll = (dir: string, msg: string) => {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", msg);
};
const run = (dir: string, ...args: string[]) => {
  const r = spawnSync("node", [checkScript, "--root", dir, ...args], { encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

describe("readVersions", () => {
  it("reads every source", () => {
    const dir = makeRepo();
    expect(readVersions(dir)).toEqual({
      packageJson: V,
      lockVersion: V,
      lockRoot: V,
      gradleName: V,
      gradleCode: CODE,
      appConfigCode: CODE,
      readme: V,
      releaseNotes: V,
    });
  });

  it("throws on malformed gradle (no versionCode)", () => {
    const dir = makeRepo({ "android/app/build.gradle": `versionName "${V}"\n` });
    expect(() => readVersions(dir)).toThrow(/versionCode/);
  });

  it("throws on duplicate gradle versionCode", () => {
    const dir = makeRepo({
      "android/app/build.gradle": `versionCode 1\nversionCode 2\nversionName "${V}"\n`,
    });
    expect(() => readVersions(dir)).toThrow(/versionCode/);
  });

  it("throws when README has no version line", () => {
    const dir = makeRepo({ "README.md": "# nothing\n" });
    expect(() => readVersions(dir)).toThrow(/README/);
  });
});

describe("check.js consistency", () => {
  it("passes when all sources agree", () => {
    const r = run(makeRepo());
    expect(r.status).toBe(0);
  });

  const cases: Array<[string, Record<string, string>, string]> = [
    ["package.json", { "package.json": files("2.1.2")["package.json"] }, "packageJson"],
    [
      "lockfile top-level",
      {
        "package-lock.json": JSON.stringify({ version: "9.9.9", packages: { "": { version: V } } }),
      },
      "lockVersion",
    ],
    [
      "lockfile root entry",
      {
        "package-lock.json": JSON.stringify({ version: V, packages: { "": { version: "9.9.9" } } }),
      },
      "lockRoot",
    ],
    [
      "build.gradle versionName",
      { "android/app/build.gradle": files("2.1.2")["android/app/build.gradle"] },
      "gradleName",
    ],
    [
      "build.gradle versionCode",
      { "android/app/build.gradle": files(V, 156)["android/app/build.gradle"] },
      "gradleCode",
    ],
    [
      "app.config.js versionCode",
      { "app.config.js": files(V, 156)["app.config.js"] },
      "appConfigCode",
    ],
    ["README", { "README.md": files("2.1.2")["README.md"] }, "readme"],
    ["RELEASE_NOTES", { "RELEASE_NOTES.md": files("2.1.2")["RELEASE_NOTES.md"] }, "releaseNotes"],
  ];
  it.each(cases)("fails when %s disagrees", (_n, override, label) => {
    const r = run(makeRepo(override));
    expect(r.status).toBe(1);
    expect(r.out).toContain(label);
    expect(r.out).toMatch(/MISMATCH/i);
  });

  it("exits 2 with a readable error on malformed gradle", () => {
    const r = run(makeRepo({ "android/app/build.gradle": `versionName "${V}"\n` }));
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/versionCode/);
  });
});

describe("check.js --base", () => {
  const setup = () => {
    const dir = makeRepo();
    git(dir, "init", "-q", "-b", "main");
    commitAll(dir, "base");
    git(dir, "checkout", "-q", "-b", "feature");
    return dir;
  };

  it("docs-only diff passes", () => {
    const dir = setup();
    write(dir, { "docs/a.md": "hi\n" });
    commitAll(dir, "docs");
    expect(run(dir, "--base", "main").status).toBe(0);
  });

  it("code change without bump passes by default (policy: not forced)", () => {
    const dir = setup();
    write(dir, { "src/a.ts": "export {};\n" });
    commitAll(dir, "code");
    expect(run(dir, "--base", "main").status).toBe(0);
  });

  it("code change without bump fails with --require-bump", () => {
    const dir = setup();
    write(dir, { "src/a.ts": "export {};\n" });
    commitAll(dir, "code");
    const r = run(dir, "--base", "main", "--require-bump");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/versionCode/);
  });

  it("docs-only diff passes with --require-bump", () => {
    const dir = setup();
    write(dir, { "docs/a.md": "hi\n" });
    commitAll(dir, "docs");
    expect(run(dir, "--base", "main", "--require-bump").status).toBe(0);
  });

  it("proper bump passes (even with --require-bump)", () => {
    const dir = setup();
    write(dir, { ...files("2.1.2", 156), "src/a.ts": "export {};\n" });
    commitAll(dir, "bump");
    expect(run(dir, "--base", "main", "--require-bump").status).toBe(0);
  });

  it("version changed but versionCode equal fails", () => {
    const dir = setup();
    write(dir, { ...files("2.1.2", CODE) });
    commitAll(dir, "bump name only");
    const r = run(dir, "--base", "main");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/versionCode/);
  });

  it("lower versionCode fails", () => {
    const dir = setup();
    write(dir, { ...files(V, 150) });
    commitAll(dir, "downgrade");
    const r = run(dir, "--base", "main");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/150/);
  });

  it("branch behind a bumped main is not flagged (merge-base comparison)", () => {
    const dir = setup();
    git(dir, "checkout", "-q", "main");
    write(dir, files("2.1.2", 156));
    commitAll(dir, "main bumped");
    git(dir, "checkout", "-q", "feature");
    write(dir, { "src/a.ts": "export {};\n" });
    commitAll(dir, "code");
    expect(run(dir, "--base", "main").status).toBe(0);
  });

  it("unknown base ref exits 2", () => {
    const dir = setup();
    expect(run(dir, "--base", "nope").status).toBe(2);
  });
});
