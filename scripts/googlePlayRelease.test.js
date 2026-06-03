const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const requireFromRoot = (filePath) => require(path.join(rootDir, filePath));

test("Google Play release uses one version across Expo and native Android", () => {
  const appConfig = requireFromRoot("app.config.js");
  const appBuildGradle = read("android/app/build.gradle");
  const { version } = appConfig.expo;
  const { versionCode } = appConfig.expo.android;
  const escapedVersion = version.replaceAll(".", "\\.");

  assert.match(appBuildGradle, new RegExp(`versionCode\\s+${versionCode}`));
  assert.match(appBuildGradle, new RegExp(`versionName\\s+"${escapedVersion}"`));
});

test("Google Play release has native AdMob app id metadata", () => {
  const appConfig = requireFromRoot("app.config.js");
  const androidManifest = read("android/app/src/main/AndroidManifest.xml");
  const strings = read("android/app/src/main/res/values/strings.xml");
  const admobAppId = appConfig.expo.extra.ADMOB_APP_ID;

  assert.match(androidManifest, /com\.google\.android\.gms\.ads\.APPLICATION_ID/);
  assert.match(androidManifest, /@string\/admob_app_id/);
  assert.match(
    strings,
    new RegExp(
      `<string name="admob_app_id" translatable="false">${admobAppId}</string>`
    )
  );
});

test("Premium purchase flow is available without hiding ads yet", () => {
  const app = read("App.tsx");
  const adBanner = read("components/AdBanner.js");
  const settings = read("screens/SettingsScreen.js");
  const premiumContext = read("context/PremiumContext.js");
  const androidManifest = read("android/app/src/main/AndroidManifest.xml");
  const packageJson = requireFromRoot("package.json");

  assert.match(app, /PremiumProvider/);
  assert.match(premiumContext, /EXPO_PUBLIC_PREMIUM_ENABLED/);
  assert.match(premiumContext, /Purchases\.getOfferings/);
  assert.match(premiumContext, /Purchases\.purchasePackage/);
  assert.match(premiumContext, /Purchases\.restorePurchases/);
  assert.match(premiumContext, /storeProduct\?\.identifier/);
  assert.doesNotMatch(premiumContext, /offeringPackage\?\.product\?\.identifier/);
  assert.match(premiumContext, /worldexplorer_premium_lifetime/);
  assert.doesNotMatch(adBanner, /usePremium|PremiumContext/);
  assert.match(settings, /usePremium/);
  assert.match(settings, /purchasePremium/);
  assert.match(settings, /restorePurchases/);
  assert.match(androidManifest, /com\.android\.vending\.BILLING/);
  assert.equal(packageJson.dependencies["react-native-purchases"], "^10.2.0");
});
