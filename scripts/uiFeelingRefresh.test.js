const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("home and explore screens align with the prototype quick-win UI", () => {
  const homeScreen = read("screens/HomeScreen.js");
  const exploreScreen = read("screens/ExploreScreen.js");
  const styles = read("styles.js");

  assert.match(homeScreen, /HOME_ACTIONS/);
  assert.match(homeScreen, /MaterialCommunityIcons/);
  assert.match(homeScreen, /homeQuickActions/);
  assert.match(homeScreen, /homeTitle/);
  assert.match(homeScreen, /homeStatsLine/);
  assert.match(homeScreen, /homeGlobeBadge/);
  assert.match(homeScreen, /dailyCountryActionRow/);

  assert.match(exploreScreen, /REGION_FILTERS/);
  assert.match(exploreScreen, /selectedRegion/);
  assert.match(exploreScreen, /formatPopulation/);
  assert.match(exploreScreen, /country\.name\?\.common/);
  assert.match(exploreScreen, /exploreEmptyState/);
  assert.match(exploreScreen, /countryMetaText/);
  assert.doesNotMatch(exploreScreen, /exploreHeaderCard/);

  assert.match(styles, /homeActionGrid/);
  assert.match(styles, /homeGlobeBadge/);
  assert.match(styles, /exploreBackRow/);
  assert.match(styles, /regionChips/);
  assert.match(styles, /regionChipActive/);
  assert.match(styles, /countryMetaText/);
});

test("refreshed UI copy is translated in every supported locale", () => {
  const localeFiles = ["en", "de", "es", "fr", "pl"];
  const requiredKeys = [
    "homeHeroSubtitle",
    "homeTitle",
    "homeStatsLine",
    "homeExploreSubtitle",
    "homeMapSubtitle",
    "homeQuizSubtitle",
    "homeSettingsSubtitle",
    "searchCountryCapital",
    "regionAll",
    "regionEurope",
    "regionAsia",
    "regionAmericas",
    "regionAfrica",
    "regionOceania",
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

  assert.match(appConfig, /version: "1\.2\.4"/);
  assert.match(appConfig, /versionCode: 126/);
  assert.match(appBuildGradle, /versionName "1\.2\.4"/);
  assert.match(appBuildGradle, /versionCode 126/);
});
