import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const SOURCE_DIRS = ["screens", "src", "components"];
const SKIP_DIRS = new Set(["node_modules", "__tests__"]);

const collect = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : collect(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [full] : [];
  });

// React Native's SafeAreaView is a no-op on Android, which breaks edge-to-edge
// layouts; screens must use react-native-safe-area-context instead.
const importsRnSafeAreaView = (source: string): boolean => {
  const rnImports = source.match(/import\s*\{[^}]*\}\s*from\s*["']react-native["']/g) ?? [];
  return rnImports.some((statement) => /\bSafeAreaView\b/.test(statement));
};

describe("SafeAreaView import hygiene", () => {
  it("no source file imports SafeAreaView from 'react-native'", () => {
    const offenders = SOURCE_DIRS.map((dir) => path.join(ROOT, dir))
      .filter((dir) => fs.existsSync(dir))
      .flatMap(collect)
      .filter((file) => importsRnSafeAreaView(fs.readFileSync(file, "utf8")))
      .map((file) => path.relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it("detector flags a react-native SafeAreaView import", () => {
    expect(importsRnSafeAreaView(`import { View, SafeAreaView } from "react-native";`)).toBe(true);
    expect(
      importsRnSafeAreaView(`import { SafeAreaView } from "react-native-safe-area-context";`)
    ).toBe(false);
  });
});
