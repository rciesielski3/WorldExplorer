import fs from "fs";
import path from "path";

import { transformCountries } from "./transform";
import { CountriesDataset, Country } from "./types";

const COUNTRIES_DEV_URL = "https://countries.dev/countries";

const TRANSLATIONS_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

const OUTPUT_PATH = path.join(process.cwd(), "data", "countries.json");

const loadExistingCountries = (): Map<string, Country> => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return new Map();
  }

  const file = fs.readFileSync(OUTPUT_PATH, "utf8");
  const dataset: CountriesDataset = JSON.parse(file);

  return new Map(dataset.countries.map((country) => [country.code, country]));
};

const generateCountries = async () => {
  console.log("Downloading countries.dev dataset...");

  const countriesResponse = await fetch(COUNTRIES_DEV_URL);

  if (!countriesResponse.ok) {
    throw new Error(
      `Failed to download countries.dev (${countriesResponse.status})`,
    );
  }

  console.log("Downloading translations dataset...");

  const translationsResponse = await fetch(TRANSLATIONS_URL);

  if (!translationsResponse.ok) {
    throw new Error(
      `Failed to download translations (${translationsResponse.status})`,
    );
  }

  const countriesDevData = await countriesResponse.json();
  const translationData = await translationsResponse.json();

  const existingCountries = loadExistingCountries();

  console.log(
    `Loaded ${existingCountries.size} existing countries for description preservation`,
  );

  const countries = transformCountries(
    countriesDevData,
    translationData,
    existingCountries,
  );

  const now = new Date().toISOString();

  const dataset: CountriesDataset = {
    generatedAt: now,
    lastUpdated: now,
    source: "countries.dev + mledoze/countries",
    version: 2,
    countries,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), {
    recursive: true,
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2), "utf8");

  console.log(`Generated ${countries.length} countries`);
  console.log(`Saved to ${OUTPUT_PATH}`);
};

generateCountries().catch((error) => {
  console.error(error);
  process.exit(1);
});
