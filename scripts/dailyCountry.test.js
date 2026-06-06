const test = require("node:test");
const assert = require("node:assert/strict");

const { getDailyCountry, hasCountryDetails } = require("../utils/dailyCountry");

const makeCountry = (cca3, name) => ({
  cca3,
  name: { common: name },
  flags: { png: `https://example.com/${cca3}.png` },
  capital: [`Capital ${name}`],
  latlng: [10, 20],
  languages: { eng: "English" },
  currencies: { USD: { name: "US dollar" } },
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
