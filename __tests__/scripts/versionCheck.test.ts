import { spawnSync } from "child_process";
import path from "path";
import { CODE, V, cleanupTempDirs, commitAll, files, git, makeRepo, write } from "./helpers";

const checkScript = path.resolve(__dirname, "../../scripts/version/check.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { readVersions } = require("../../scripts/version/read.js");

const run = (dir: string, ...args: string[]) => {
  const r = spawnSync("node", [checkScript, "--root", dir, ...args], { encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

afterAll(cleanupTempDirs);

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
