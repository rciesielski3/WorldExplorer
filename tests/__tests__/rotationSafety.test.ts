import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
// App source lives in src/ plus the legacy top-level dirs.
const SOURCE_DIRS = ["src", "screens", "components", "context", "utils"];

function collect(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      collect(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("rotation safety", () => {
  it("has no module-level Dimensions.get (use useWindowDimensions)", () => {
    const offenders: string[] = [];
    for (const dir of SOURCE_DIRS) {
      for (const file of collect(path.join(ROOT, dir))) {
        const lines = fs.readFileSync(file, "utf8").split("\n");
        lines.forEach((line, i) => {
          // Module level means no leading indentation.
          if (/^(const|let|var|export)\b.*Dimensions\.get\(/.test(line)) {
            offenders.push(`${path.relative(ROOT, file)}:${i + 1}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("manifest has no orientation or resizability restrictions", () => {
    const manifest = fs.readFileSync(
      path.join(ROOT, "android/app/src/main/AndroidManifest.xml"),
      "utf8",
    );
    expect(manifest).not.toMatch(/screenOrientation/);
    expect(manifest).not.toMatch(/resizeableActivity="false"/);
    const match = manifest.match(/android:configChanges="([^"]*)"/);
    expect(match).not.toBeNull();
    const flags = (match?.[1] ?? "").split("|");
    // Foldable and multi-window resizes must not recreate MainActivity
    // (quiz and map state is plain useState).
    for (const flag of [
      "keyboard",
      "keyboardHidden",
      "orientation",
      "screenSize",
      "screenLayout",
      "uiMode",
      "smallestScreenSize",
      "density",
    ]) {
      expect(flags).toContain(flag);
    }
  });
});
