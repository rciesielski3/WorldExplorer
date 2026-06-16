const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");
const readJson = (filePath) => JSON.parse(read(filePath));

test("map screen follows the prototype map shell, tooltip, controls, and legend", () => {
  const screen = read("screens/MapScreen.js");
  const countryDetails = read("screens/CountryDetailsScreen.js");
  const styles = read("styles.js");

  assert.match(screen, /DARK_MAP_STYLE/);
  assert.match(screen, /customMapStyle=\{theme\.isDarkMode \? DARK_MAP_STYLE : \[\]\}/);
  assert.match(screen, /Callout tooltip/);
  assert.match(screen, /MapTooltip/);
  assert.match(screen, /mapRef/);
  assert.match(screen, /animateToRegion/);
  assert.match(screen, /handleZoom/);
  assert.match(screen, /handleResetMap/);
  assert.match(screen, /crosshairs-gps/);
  assert.match(screen, /selectedCountry/);
  assert.match(countryDetails, /country,\s*\n\s*\}\);/);

  for (const styleName of [
    "mapContent",
    "mapHeaderRow",
    "mapShell",
    "mapView",
    "mapControls",
    "mapControlButton",
    "mapTooltip",
    "mapLegend",
    "mapLegendDotOutline",
  ]) {
    assert.match(styles, new RegExp(`${styleName}:`), styleName);
  }
});

test("map prototype copy is translated in every supported locale", () => {
  const requiredKeys = [
    "selectedCountry",
    "visitedCountry",
    "unvisitedCountry",
    "zoomIn",
    "zoomOut",
    "resetMap",
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
