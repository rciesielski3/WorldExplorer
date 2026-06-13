const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("country details screen follows the prototype structure", () => {
  const screen = read("screens/CountryDetailsScreen.js");
  const styles = read("styles.js");

  assert.match(screen, /DETAIL_TABS/);
  assert.match(screen, /activeTab/);
  assert.match(screen, /MapView/);
  assert.match(screen, /Marker/);
  assert.match(screen, /navigation\.goBack\(\)/);
  assert.match(screen, /navigation\.navigate\("Map"/);
  assert.match(screen, /formatCurrencies/);
  assert.match(screen, /formatLanguages/);
  assert.match(screen, /country\.name\?\.common/);
  assert.match(screen, /country\?\.latlng\?\.\[0\]/);

  for (const styleName of [
    "countryBackRow",
    "countryHeroCard",
    "countryTabRow",
    "countryStatGrid",
    "countryFactCard",
    "countryMiniMap",
  ]) {
    assert.match(styles, new RegExp(`${styleName}:`), styleName);
  }
});

test("country details prototype copy is translated in every supported locale", () => {
  const requiredKeys = [
    "back",
    "countryInfo",
    "countryStats",
    "countryMap",
    "countryFact",
    "countryFactText",
    "area",
    "timezones",
    "borders",
    "topLevelDomain",
    "noData",
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
