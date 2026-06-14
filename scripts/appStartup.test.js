const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");

test("app startup declares hooks before the font loading return", () => {
  const app = fs.readFileSync(path.join(repoRoot, "App.tsx"), "utf8");
  const fontsLoadingReturnIndex = app.indexOf("if (!fontsLoaded)");
  const mobileAdsEffectIndex = app.indexOf("React.useEffect(() =>");

  assert.notEqual(fontsLoadingReturnIndex, -1);
  assert.notEqual(mobileAdsEffectIndex, -1);
  assert.ok(
    mobileAdsEffectIndex < fontsLoadingReturnIndex,
    "React hooks must be declared before the conditional font-loading return"
  );
});
