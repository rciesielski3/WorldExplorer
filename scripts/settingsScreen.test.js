const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("settings screen presents a professional about section", () => {
  const settingsScreen = read("screens/SettingsScreen.js");

  assert.match(settingsScreen, /t\("aboutApp"\)/);
  assert.match(settingsScreen, /t\("aboutAppDescription"\)/);
  assert.match(settingsScreen, /t\("createdBy"\)/);
  assert.match(settingsScreen, /https:\/\/rciesielski\.dev\/contact/);
  assert.doesNotMatch(
    settingsScreen,
    /https:\/\/rciesielski3\.github\.io\/portfolio\/#\/contact/
  );
});

test("about section translations are available in every supported locale", () => {
  const localeFiles = ["de", "en", "es", "fr", "pl"].map(
    (locale) => `locales/${locale}.json`
  );

  for (const localeFile of localeFiles) {
    const translations = readJson(localeFile);

    assert.equal(typeof translations.aboutApp, "string", localeFile);
    assert.equal(typeof translations.aboutAppDescription, "string", localeFile);
    assert.equal(typeof translations.createdBy, "string", localeFile);
  }
});
