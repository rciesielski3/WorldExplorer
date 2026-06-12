const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const read = (filePath) => fs.readFileSync(path.join(rootDir, filePath), "utf8");

test("REST Countries all requests specify the fields required by each screen", () => {
  const constants = read("constants.js");
  const exploreScreen = read("screens/ExploreScreen.js");
  const quizScreen = read("screens/quiz/QuizScreen.js");

  assert.match(constants, /COUNTRY_LIST_FIELDS/);
  assert.match(constants, /QUIZ_COUNTRY_FIELDS/);
  assert.match(
    constants,
    /https:\/\/restcountries\.com\/v3\.1\/all\?fields=\$\{COUNTRY_LIST_FIELDS\}/
  );
  assert.match(
    constants,
    /https:\/\/restcountries\.com\/v3\.1\/all\?fields=\$\{QUIZ_COUNTRY_FIELDS\}/
  );
  assert.match(exploreScreen, /API_URL/);
  assert.match(exploreScreen, /country\.name\?\.common\?/);
  assert.doesNotMatch(exploreScreen, /restcountries\.com\/v3\.1\/all(?!\?fields=)/);
  assert.match(quizScreen, /QUIZ_API_URL/);
  assert.doesNotMatch(quizScreen, /restcountries\.com\/v3\.1\/all(?!\?fields=)/);
});
