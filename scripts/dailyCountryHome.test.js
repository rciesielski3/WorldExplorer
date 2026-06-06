const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("home screen surfaces the daily country entry point", () => {
  const homeScreen = read("screens/HomeScreen.js");

  assert.match(homeScreen, /getDailyCountry/);
  assert.match(homeScreen, /t\("dailyCountry"\)/);
  assert.match(homeScreen, /t\("dailyCountrySubtitle",/);
  assert.match(homeScreen, /t\("viewCountry"\)/);
  assert.match(homeScreen, /navigation\.navigate\("CountryDetails", \{/);
  assert.match(homeScreen, /country: dailyCountry/);
});

test("daily country translations are available in every supported locale", () => {
  const localeFiles = ["de", "en", "es", "fr", "pl"].map(
    (locale) => `locales/${locale}.json`
  );

  for (const localeFile of localeFiles) {
    const translations = readJson(localeFile);

    assert.equal(typeof translations.dailyCountry, "string", localeFile);
    assert.equal(typeof translations.dailyCountrySubtitle, "string", localeFile);
    assert.equal(typeof translations.viewCountry, "string", localeFile);
  }
});
