import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
const { evaluate } = require("../../scripts/version/deploy-guard.js");
/* eslint-enable @typescript-eslint/no-require-imports */
const guardScript = path.resolve(__dirname, "../../scripts/version/deploy-guard.js");

const V = "2.1.1";
const MAIN = "refs/heads/main";

const files = (code = 155, appConfigCode = code) => ({
  "package.json": JSON.stringify({ name: "x", version: V }, null, 2) + "\n",
  "package-lock.json":
    JSON.stringify(
      { name: "x", version: V, lockfileVersion: 3, packages: { "": { name: "x", version: V } } },
      null,
      2,
    ) + "\n",
  "android/app/build.gradle": `android {\n    defaultConfig {\n        versionCode ${code}\n        versionName "${V}"\n    }\n}\n`,
  "app.config.js": `module.exports = { expo: { android: {\n  versionCode: ${appConfigCode},\n} } };\n`,
  "README.md": `# X\n\nPublished; current version in this repo: ${V}.\n`,
  "RELEASE_NOTES.md": `# Release Notes\n\n## Latest Release: v${V}\n`,
});

const tmpDirs: string[] = [];
const git = (dir: string, ...args: string[]) =>
  execFileSync(
    "git",
    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    { cwd: dir, stdio: "pipe" },
  );

const makeRepo = (code: number, tags: string[], appConfigCode = code): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "deployguard-"));
  tmpDirs.push(dir);
  for (const [rel, content] of Object.entries(files(code, appConfigCode))) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  git(dir, "init", "-q", "-b", "main");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "init");
  for (const t of tags) git(dir, "tag", "-a", t, "-m", t);
  return dir;
};

const runGuard = (dir: string, dryRun: string | undefined, ref: string) => {
  const env: NodeJS.ProcessEnv = { ...process.env, REF: ref };
  delete env.DRY_RUN;
  if (dryRun !== undefined) env.DRY_RUN = dryRun;
  const r = spawnSync("node", [guardScript, "--root", dir], { encoding: "utf8", env });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

describe("evaluate", () => {
  const base = {
    versionCode: 156,
    highestTagCode: 155 as number | null,
    sourcesConsistent: true,
    ref: MAIN,
    dryRun: false,
  };

  it("passes a higher code on a real run from main", () => {
    expect(evaluate(base)).toEqual({ failures: [], warnings: [] });
  });

  it("passes when no build tags exist", () => {
    expect(evaluate({ ...base, highestTagCode: null, versionCode: 1 }).failures).toEqual([]);
  });

  it("fails a real run when the code equals the highest tag", () => {
    const r = evaluate({ ...base, versionCode: 155 });
    expect(r.failures).toEqual([
      "versionCode 155 was already uploaded (tag build-155); bump all version sources (npm run bump when available) before publishing",
    ]);
  });

  it("fails a real run when the code is below the highest tag", () => {
    expect(evaluate({ ...base, versionCode: 150 }).failures).toHaveLength(1);
  });

  it("only warns on a dry run with a used code", () => {
    const r = evaluate({ ...base, versionCode: 155, dryRun: true });
    expect(r.failures).toEqual([]);
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toContain("already uploaded (tag build-155)");
  });

  it("fails when sources disagree, even on a dry run", () => {
    expect(evaluate({ ...base, sourcesConsistent: false, dryRun: true }).failures).toHaveLength(1);
  });

  it("fails a real run from a non-main ref", () => {
    const r = evaluate({ ...base, ref: "refs/heads/feature" });
    expect(r.failures).toHaveLength(1);
    expect(r.failures[0]).toContain("refs/heads/main");
  });

  it("allows a dry run from any ref", () => {
    expect(evaluate({ ...base, ref: "refs/heads/feature", dryRun: true }).failures).toEqual([]);
  });

  it("reports every failure at once", () => {
    const r = evaluate({
      versionCode: 155,
      highestTagCode: 155,
      sourcesConsistent: false,
      ref: "refs/heads/x",
      dryRun: false,
    });
    expect(r.failures).toHaveLength(3);
  });
});

describe("deploy-guard CLI", () => {
  it("fails a real run with an already used versionCode", () => {
    const dir = makeRepo(155, ["build-154", "build-155"]);
    const r = runGuard(dir, "false", MAIN);
    expect(r.status).toBe(1);
    expect(r.out).toContain(
      "FAIL: versionCode 155 was already uploaded (tag build-155); bump all version sources (npm run bump when available) before publishing",
    );
  });

  it("warns but passes a dry run with an already used versionCode", () => {
    const dir = makeRepo(155, ["build-155"]);
    const r = runGuard(dir, "true", "refs/heads/feature");
    expect(r.status).toBe(0);
    expect(r.out).toContain("WARNING: versionCode 155 was already uploaded (tag build-155)");
    expect(r.out).not.toContain("FAIL");
  });

  it.each([undefined, "", "true", "TRUE", "yes", "0"])(
    "treats DRY_RUN=%p as a dry run",
    (value) => {
      const dir = makeRepo(155, ["build-155"]);
      const r = runGuard(dir, value, "refs/heads/feature");
      expect(r.status).toBe(0);
      expect(r.out).toContain("WARNING");
    },
  );

  it.each(["false", "False", "FALSE", " false ", "false\n"])(
    "treats DRY_RUN=%p as a real publish",
    (value) => {
      const dir = makeRepo(155, ["build-155"]);
      const r = runGuard(dir, value, MAIN);
      expect(r.status).toBe(1);
      expect(r.out).toContain("FAIL: versionCode 155 was already uploaded");
    },
  );

  it("passes a higher versionCode on a real run from main", () => {
    const dir = makeRepo(156, ["build-154", "build-155"]);
    const r = runGuard(dir, "false", MAIN);
    expect(r.status).toBe(0);
    expect(r.out).toContain("Deploy guard passed: versionCode 156 (real publish)");
  });

  it("uses the numerically highest tag, not the lexical one", () => {
    const dir = makeRepo(100, ["build-99", "build-100"]);
    expect(runGuard(dir, "false", MAIN).status).toBe(1);
  });

  it("ignores tags that are not build-<N>", () => {
    const dir = makeRepo(156, ["build-999-rc", "v2.1.1"]);
    expect(runGuard(dir, "false", MAIN).status).toBe(0);
  });

  it("passes when there are no build tags", () => {
    const dir = makeRepo(155, []);
    expect(runGuard(dir, "false", MAIN).status).toBe(0);
  });

  it("fails when version sources disagree", () => {
    const dir = makeRepo(156, [], 157);
    const r = runGuard(dir, "true", MAIN);
    expect(r.status).toBe(1);
    expect(r.out).toContain("FAIL: version sources disagree");
  });

  it("fails a real run from a non-main ref", () => {
    const dir = makeRepo(156, ["build-155"]);
    const r = runGuard(dir, "false", "refs/heads/feature");
    expect(r.status).toBe(1);
    expect(r.out).toContain("FAIL: real publish is only allowed from refs/heads/main");
  });
});
