const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");

const loadConstants = () => {
  const source = `${read("constants.js").replace(
    /^export const /gm,
    "const "
  )}

module.exports = { normalizeCountriesResponse };`;
  const context = {
    module: { exports: {} },
    process: { env: {} },
  };

  vm.runInNewContext(source, context);

  return context.module.exports;
};

test("REST Countries all requests specify the fields required by each screen", () => {
  const constants = read("constants.js");
  const restCountriesApi = read("utils/restCountriesApi.js");
  const exploreScreen = read("screens/ExploreScreen.js");
  const homeScreen = read("screens/HomeScreen.js");
  const quizScreen = read("screens/quiz/QuizScreen.js");

  assert.match(
    constants,
    /https:\/\/api\.restcountries\.com\/countries\/v5/
  );
  assert.match(
    constants,
    /EXPO_PUBLIC_REST_COUNTRIES_API_KEY/
  );
  assert.match(
    constants,
    /Authorization:\s*`Bearer \$\{REST_COUNTRIES_API_KEY\}`/
  );
  assert.match(constants, /responseData\?\.data\?\.objects/);
  assert.match(
    constants,
    /limit=\$\{REST_COUNTRIES_PAGE_SIZE\}&offset=\$\{offset\}/
  );
  assert.match(constants, /names\?\.common/);
  assert.match(constants, /flag\?\.url_png/);
  assert.match(constants, /capitals\?\.map/);

  assert.match(restCountriesApi, /fetchCountries/);
  assert.match(restCountriesApi, /countriesPromise/);
  assert.match(restCountriesApi, /meta\?\.more/);
  assert.match(restCountriesApi, /getRestCountriesPageUrl\(offset\)/);
  assert.match(restCountriesApi, /Promise\.all/);

  assert.doesNotMatch(constants, /restcountries\.com\/v3\.1/);
  assert.match(exploreScreen, /fetchCountries/);
  assert.match(homeScreen, /fetchCountries/);
  assert.match(quizScreen, /fetchCountries/);
  assert.doesNotMatch(
    `${exploreScreen}\n${homeScreen}\n${quizScreen}`,
    /axios\.get\((API_URL|QUIZ_API_URL)/
  );
});

test("REST Countries v5 responses are normalized to the app country model", () => {
  const { normalizeCountriesResponse } = loadConstants();

  const countries = normalizeCountriesResponse({
    data: {
      objects: [
        {
          names: {
            common: "Canada",
            official: "Canada",
          },
          codes: {
            alpha_2: "CA",
            alpha_3: "CAN",
          },
          capitals: [{ name: "Ottawa" }],
          flag: {
            url_png: "https://flags.restcountries.com/v5/w640/ca.png",
            url_svg: "https://flags.restcountries.com/v5/svg/ca.svg",
            description: "The flag of Canada.",
          },
          population: 41575585,
          region: "Americas",
          subregion: "North America",
          languages: [{ iso639_2t: "eng", name: "English" }],
          currencies: [{ code: "CAD", name: "Canadian dollar", symbol: "$" }],
          coordinates: { lat: 60, lng: -95 },
          area: { kilometers: 9984670 },
          borders: ["USA"],
          timezones: ["UTC-05:00"],
          tlds: [".ca"],
        },
      ],
    },
  });

  assert.deepEqual(JSON.parse(JSON.stringify(countries)), [
    {
      name: {
        common: "Canada",
        official: "Canada",
      },
      flags: {
        png: "https://flags.restcountries.com/v5/w640/ca.png",
        svg: "https://flags.restcountries.com/v5/svg/ca.svg",
        alt: "The flag of Canada.",
      },
      capital: ["Ottawa"],
      cca2: "CA",
      cca3: "CAN",
      population: 41575585,
      region: "Americas",
      subregion: "North America",
      languages: { eng: "English" },
      currencies: {
        CAD: {
          name: "Canadian dollar",
          symbol: "$",
        },
      },
      latlng: [60, -95],
      area: 9984670,
      borders: ["USA"],
      timezones: ["UTC-05:00"],
      tld: [".ca"],
    },
  ]);
});
