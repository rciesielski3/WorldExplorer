const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("home and explore screens expose the refreshed quick-win UI", () => {
  const homeScreen = read("screens/HomeScreen.js");
  const exploreScreen = read("screens/ExploreScreen.js");
  const styles = read("styles.js");

  assert.match(homeScreen, /HOME_ACTIONS/);
  assert.match(homeScreen, /MaterialCommunityIcons/);
  assert.match(homeScreen, /homeQuickActions/);
  assert.match(homeScreen, /homeHeroSubtitle/);
  assert.match(homeScreen, /dailyCountryActionRow/);

  assert.match(exploreScreen, /formatPopulation/);
  assert.match(exploreScreen, /country\.name\?\.common\?/);
  assert.match(exploreScreen, /exploreEmptyState/);
  assert.match(exploreScreen, /countryMetaText/);

  assert.match(styles, /homeActionGrid/);
  assert.match(styles, /exploreHeaderCard/);
  assert.match(styles, /countryMetaText/);
});

test("refreshed UI copy is translated in every supported locale", () => {
  const localeFiles = ["en", "de", "es", "fr", "pl"];
  const requiredKeys = [
    "homeHeroSubtitle",
    "homeExploreSubtitle",
    "homeMapSubtitle",
    "homeQuizSubtitle",
    "homeSettingsSubtitle",
    "exploreEmptyState",
  ];

  for (const locale of localeFiles) {
    const messages = readJson(`locales/${locale}.json`);

    for (const key of requiredKeys) {
      assert.equal(typeof messages[key], "string", `${locale}.${key}`);
      assert.ok(messages[key].length > 0, `${locale}.${key}`);
    }
  }
});

test("UI refresh increments the Android store version", () => {
  const appConfig = read("app.config.js");
  const appBuildGradle = read("android/app/build.gradle");
  const configVersion = appConfig.match(/version: "([^"]+)"/)?.[1];
  const configVersionCode = Number(appConfig.match(/versionCode: (\d+)/)?.[1]);
  const gradleVersion = appBuildGradle.match(/versionName "([^"]+)"/)?.[1];
  const gradleVersionCode = Number(appBuildGradle.match(/versionCode (\d+)/)?.[1]);

  assert.equal(configVersion, gradleVersion);
  assert.equal(configVersionCode, gradleVersionCode);
  assert.equal(configVersion, "1.2.8");
  assert.equal(configVersionCode, 130);
});
