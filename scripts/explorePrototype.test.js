const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("explore screen follows the prototype search, chips, cards, and skeleton structure", () => {
  const screen = read("screens/ExploreScreen.js");
  const styles = read("styles.js");

  assert.match(screen, /REGION_FILTERS/);
  assert.match(screen, /selectedRegion/);
  assert.match(screen, /setSelectedRegion/);
  assert.match(screen, /ScrollView/);
  assert.match(screen, /formatPopulation/);
  assert.match(screen, /country\.region === selectedRegion/);
  assert.match(screen, /metadata\.join\(" · "\)/);
  assert.match(screen, /MaterialCommunityIcons/);
  assert.match(screen, /chevron-right/);
  assert.match(screen, /renderSkeletonRows/);
  assert.doesNotMatch(screen, /ActivityIndicator/);

  for (const styleName of [
    "exploreHeaderRow",
    "exploreSearchContainer",
    "regionFilterRow",
    "regionFilterChip",
    "regionFilterChipActive",
    "countryCard",
    "countryCardFlag",
    "countryCardMeta",
    "skeletonRow",
  ]) {
    assert.match(styles, new RegExp(`${styleName}:`), styleName);
  }
});

test("explore prototype copy is translated in every supported locale", () => {
  const requiredKeys = [
    "allCountries",
    "regionEurope",
    "regionAsia",
    "regionAmericas",
    "regionAfrica",
    "regionOceania",
    "searchCountryCapital",
    "noCountriesFound",
  ];
  const localeFiles = ["de", "en", "es", "fr", "pl"].map(
    (locale) => `locales/${locale}.json`
  );

  for (const localeFile of localeFiles) {
    const translations = readJson(localeFile);

    for (const key of requiredKeys) {
      assert.equal(typeof translations[key], "string", `${localeFile}:${key}`);
      assert.notEqual(translations[key].trim(), "", `${localeFile}:${key}`);
    }
  }
});
