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
  assert.match(screen, /translations\?\.en\?\.name|getLocalizedCountryName|flagPng/);
  assert.match(screen, /country\?\.lat|country\?\.lng/);

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

test("CountryDetailsScreen displays all info sections", () => {
  const screen = read("screens/CountryDetailsScreen.js");
  const styles = read("styles.js");

  // Check for info section with icon cards
  assert.match(screen, /renderInfoCard/, "renderInfoCard function");
  assert.match(screen, /countryInfoSection/, "countryInfoSection");
  assert.match(
    screen,
    /countryInfoCard/,
    "countryInfoCard styling"
  );

  // Check for header card with region badge
  assert.match(screen, /countryHeaderCard/, "countryHeaderCard");
  assert.match(screen, /countryRegionBadge/, "countryRegionBadge");

  // Check for fun fact card
  assert.match(screen, /countryFactCard/, "countryFactCard");

  // Check for quiz CTA button
  assert.match(
    screen,
    /handleNavigateToQuiz|"brain"/,
    "Quiz CTA button"
  );

  // Check for map button
  assert.match(screen, /handleShowOnMap/, "Map button");

  // Check for top bar with settings icon
  assert.match(screen, /countryTopBar/, "Top bar");
  assert.match(screen, /cog/, "Settings icon");

  // Check for mini map
  assert.match(screen, /countryMiniMapCard/, "Mini map card");

  // Verify styles exist
  for (const styleName of [
    "countryHeaderCard",
    "countryRegionBadge",
    "countryInfoSection",
    "countryInfoCard",
    "countryCtaSection",
    "countryTopBar",
  ]) {
    assert.match(styles, new RegExp(`${styleName}:`), styleName);
  }
});
