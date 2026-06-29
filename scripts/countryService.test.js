const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const datasetPath = path.join(__dirname, "..", "data", "countries.json");
const countriesPath = path.join(__dirname, "..", "utils", "countries.ts");

const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

// Import utility functions (require TS transpilation)
let getCountryByCode, getLocalizedCountryName, getSearchableCountryText;
try {
  const countriesModule = require(countriesPath);
  getCountryByCode = countriesModule.getCountryByCode;
  getLocalizedCountryName = countriesModule.getLocalizedCountryName;
  getSearchableCountryText = countriesModule.getSearchableCountryText;
} catch (e) {
  // Functions may not be directly importable from TS file
}

test("countries dataset metadata is valid", () => {
  assert.equal(dataset.version, 2);
  assert.equal(dataset.source, "countries.dev + mledoze/countries");

  assert.ok(dataset.generatedAt);

  assert.ok(Array.isArray(dataset.countries));
  assert.equal(dataset.countries.length, 250);
});

test("every country contains required fields", () => {
  for (const country of dataset.countries) {
    assert.ok(country.code);
    assert.ok(country.code3);

    assert.ok(country.region);
    assert.ok(country.subregion);

    assert.equal(typeof country.population, "number");
    assert.equal(typeof country.area, "number");

    assert.ok(Array.isArray(country.languages));
    assert.ok(Array.isArray(country.currencies));
    assert.ok(Array.isArray(country.timezones));
    assert.ok(Array.isArray(country.borders));

    assert.equal(typeof country.lat, "number");
    assert.equal(typeof country.lng, "number");

    assert.ok(country.flag);
    assert.ok(country.flagPath);
    assert.match(country.flagPath, /^[a-z]{2}\.png$/);

    assert.ok(country.translations.en.name);
    assert.ok(country.translations.pl.name);
    assert.ok(country.translations.de.name);
    assert.ok(country.translations.es.name);
  }
});

test("Poland dataset is normalized correctly", () => {
  const poland = dataset.countries.find((country) => country.code === "PL");

  assert.ok(poland);

  assert.equal(poland.code3, "POL");
  assert.equal(poland.capital, "Warsaw");

  assert.equal(poland.region, "Europe");
  assert.equal(poland.subregion, "Central Europe");

  assert.equal(poland.population, 37950802);

  assert.ok(poland.languages.includes("Polish"));
  assert.ok(poland.currencies.includes("PLN"));

  assert.equal(poland.translations.en.name, "Poland");
  assert.equal(poland.translations.pl.name, "Polska");

  assert.ok(poland.flag === "🇵🇱");
  assert.equal(poland.flagPath, "pl.png");
  assert.ok(!poland.flagPath.includes("flagcdn.com"));
  assert.ok(!poland.flagPath.includes("http"));
});

test("country codes are unique", () => {
  const codes = dataset.countries.map((country) => country.code);

  assert.equal(codes.length, new Set(codes).size);
});

test("country code3 values are unique", () => {
  const codes = dataset.countries.map((country) => country.code3);

  assert.equal(codes.length, new Set(codes).size);
});

test("descriptions are preserved for every language", () => {
  for (const country of dataset.countries) {
    assert.ok(country.translations.en.description !== undefined);
    assert.ok(country.translations.pl.description !== undefined);
    assert.ok(country.translations.de.description !== undefined);
    assert.ok(country.translations.es.description !== undefined);
  }
});
