import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const SOURCE_DIRS = ["screens", "src", "components", "context", "utils", "theme"];
const ROOT_FILES = ["App.tsx", "index.ts"];
const SKIP_DIRS = new Set(["node_modules", "__tests__"]);

const collect = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : collect(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [full] : [];
  });

// React Native's SafeAreaView is a no-op on Android, which breaks edge-to-edge
// layouts; code must use react-native-safe-area-context instead.
export const usesRnSafeAreaView = (source: string): boolean => {
  const fromRn = `from\\s*["']react-native["']`;
  // import { SafeAreaView } / import { SafeAreaView as X } (multi-line ok)
  const named = new RegExp(
    `import\\s*(?:type\\s*)?\\{[^}]*\\bSafeAreaView\\b[^}]*\\}\\s*${fromRn}`,
  );
  // import * as RN from "react-native"; then RN.SafeAreaView or destructuring
  const namespace = /import\s*\*\s*as\s+(\w+)\s*from\s*["']react-native["']/.exec(source);
  const namespaceUse = namespace
    ? new RegExp(
        `\\b${namespace[1]}\\.SafeAreaView\\b|\\{[^}]*\\bSafeAreaView\\b[^}]*\\}\\s*=\\s*${namespace[1]}\\b`,
      ).test(source)
    : false;
  // const { SafeAreaView } = require("react-native") / require("react-native").SafeAreaView
  const requireUse =
    /\{[^}]*\bSafeAreaView\b[^}]*\}\s*=\s*require\(\s*["']react-native["']\s*\)/.test(source) ||
    /require\(\s*["']react-native["']\s*\)\.SafeAreaView/.test(source);
  return named.test(source) || namespaceUse || requireUse;
};

describe("SafeAreaView import hygiene", () => {
  it("scans only directories and files that exist", () => {
    for (const rel of SOURCE_DIRS) {
      expect(fs.existsSync(path.join(ROOT, rel))).toBe(true);
    }
    for (const rel of ROOT_FILES) {
      expect(fs.existsSync(path.join(ROOT, rel))).toBe(true);
    }
  });

  it("no source file uses SafeAreaView from 'react-native'", () => {
    const files = [
      ...SOURCE_DIRS.flatMap((dir) => collect(path.join(ROOT, dir))),
      ...ROOT_FILES.map((file) => path.join(ROOT, file)),
    ];
    expect(files.length).toBeGreaterThan(0);

    const offenders = files
      .filter((file) => usesRnSafeAreaView(fs.readFileSync(file, "utf8")))
      .map((file) => path.relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it.each([
    [`import { View, SafeAreaView } from "react-native";`, true],
    [`import {\n  View,\n  SafeAreaView as SAV,\n} from 'react-native';`, true],
    [`import * as RN from "react-native";\nconst x = <RN.SafeAreaView />;`, true],
    [`import * as Native from "react-native";\nconst { SafeAreaView } = Native;`, true],
    [`const { SafeAreaView } = require("react-native");`, true],
    [`import { SafeAreaView } from "react-native-safe-area-context";`, false],
    [`import { View } from "react-native";`, false],
  ])("detector: %j -> %s", (source, expected) => {
    expect(usesRnSafeAreaView(source)).toBe(expected);
  });
});
