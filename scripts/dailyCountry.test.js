const test = require("node:test");
const assert = require("node:assert/strict");

const { getDailyCountry, hasCountryDetails } = require("../utils/dailyCountry");

const makeCountry = (code3, name) => ({
  code: code3.toLowerCase(),
  code3,
  region: "Test",
  subregion: "Test Region",
  population: 1000000,
  area: 100000,
  capital: `Capital ${name}`,
  lat: 10,
  lng: 20,
  flag: "🚩",
  flagPath: `${code3.toLowerCase()}.png`,
  languages: ["English"],
  currencies: ["USD"],
  timezones: ["UTC"],
  borders: [],
  translations: {
    en: { name, officialName: `The ${name}`, description: "" },
    pl: { name, officialName: `The ${name}`, description: "" },
    de: { name, officialName: `The ${name}`, description: "" },
    es: { name, officialName: `The ${name}`, description: "" },
  },
});

test("daily country is stable for the same UTC day", () => {
  const countries = [
    makeCountry("POL", "Poland"),
    makeCountry("JPN", "Japan"),
    makeCountry("BRA", "Brazil"),
  ];

  const morning = new Date("2026-06-06T08:00:00.000Z");
  const evening = new Date("2026-06-06T22:00:00.000Z");

  assert.equal(getDailyCountry(countries, morning), getDailyCountry(countries, evening));
});

test("daily country rotates between UTC days", () => {
  const countries = [
    makeCountry("POL", "Poland"),
    makeCountry("JPN", "Japan"),
    makeCountry("BRA", "Brazil"),
  ];

  const today = new Date("2026-06-06T12:00:00.000Z");
  const tomorrow = new Date("2026-06-07T12:00:00.000Z");

  assert.notEqual(getDailyCountry(countries, today), getDailyCountry(countries, tomorrow));
});

test("daily country skips incomplete records", () => {
  const incompleteCountry = {
    cca3: "BAD",
    name: { common: "Incomplete" },
  };
  const completeCountry = makeCountry("POL", "Poland");

  assert.equal(hasCountryDetails(incompleteCountry), false);
  assert.equal(getDailyCountry([incompleteCountry, completeCountry]), completeCountry);
});
