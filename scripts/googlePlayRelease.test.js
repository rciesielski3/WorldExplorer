const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("Google Play release uses one version across Expo and native Android", () => {
  const appConfig = read("app.config.js");
  const appBuildGradle = read("android/app/build.gradle");

  assert.match(appConfig, /version:\s*"1\.2\.1"/);
  assert.match(appConfig, /versionCode:\s*91/);
  assert.match(appBuildGradle, /versionCode\s+91/);
  assert.match(appBuildGradle, /versionName\s+"1\.2\.1"/);
});

test("Google Play release has native AdMob app id metadata", () => {
  const androidManifest = read("android/app/src/main/AndroidManifest.xml");
  const strings = read("android/app/src/main/res/values/strings.xml");

  assert.match(androidManifest, /com\.google\.android\.gms\.ads\.APPLICATION_ID/);
  assert.match(androidManifest, /@string\/admob_app_id/);
  assert.match(
    strings,
    /<string name="admob_app_id" translatable="false">ca-app-pub-4185040274135926~2042240790<\/string>/
  );
});

test("Google Play ad release does not ship the incomplete premium billing flow", () => {
  const app = read("App.tsx");
  const adBanner = read("components/AdBanner.js");
  const settings = read("screens/SettingsScreen.js");
  const androidManifest = read("android/app/src/main/AndroidManifest.xml");
  const packageJson = readJson("package.json");

  assert.doesNotMatch(app, /PremiumProvider|PremiumContext/);
  assert.doesNotMatch(adBanner, /usePremium|PremiumContext/);
  assert.doesNotMatch(settings, /usePremium|purchasePremium|restorePurchases/);
  assert.doesNotMatch(androidManifest, /com\.android\.vending\.BILLING/);
  assert.equal(packageJson.dependencies["react-native-purchases"], undefined);
});
