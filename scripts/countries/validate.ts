import fs from "fs";
import path from "path";

import { CountriesDataset } from "./types";

const DATASET_PATH = path.join(process.cwd(), "data", "countries.json");

const errors: string[] = [];
const warnings: string[] = [];

const fail = (message: string) => errors.push(message);
const warn = (message: string) => warnings.push(message);

const dataset: CountriesDataset = JSON.parse(
  fs.readFileSync(DATASET_PATH, "utf8"),
);

const OPTIONAL_CAPITAL = new Set(["BV", "HM", "UM", "MO"]);

if (!dataset.generatedAt) fail("Missing generatedAt");
if (!dataset.source) fail("Missing source");
if (!dataset.version) fail("Missing version");

if (!Array.isArray(dataset.countries)) {
  fail("countries is not an array");
}

const countries = dataset.countries;

if (countries.length !== 250) {
  warn(`Expected 250 countries, got ${countries.length}`);
}

const codeSet = new Set<string>();
const code3Set = new Set<string>();

for (const country of countries) {
  if (codeSet.has(country.code)) {
    fail(`Duplicate code: ${country.code}`);
  }

  codeSet.add(country.code);

  if (code3Set.has(country.code3)) {
    fail(`Duplicate code3: ${country.code3}`);
  }

  code3Set.add(country.code3);

  if (!country.capital && !OPTIONAL_CAPITAL.has(country.code)) {
    warn(`${country.code}: missing capital`);
  }

  if (!country.region) {
    fail(`${country.code}: missing region`);
  }

  if (!country.subregion) {
    warn(`${country.code}: missing subregion`);
  }

  if (country.population < 0) {
    fail(`${country.code}: invalid population`);
  }

  if (country.area === undefined) {
    fail(`${country.code}: invalid area`);
  }

  if (country.lat < -90 || country.lat > 90) {
    fail(`${country.code}: invalid latitude`);
  }

  if (country.lng < -180 || country.lng > 180) {
    fail(`${country.code}: invalid longitude`);
  }

  if (!country.languages.length) {
    warn(`${country.code}: no languages`);
  }

  if (!country.currencies.length) {
    warn(`${country.code}: no currencies`);
  }

  if (typeof country.flag !== "string" || country.flag.trim() === "") {
    fail(`${country.code}: missing emoji flag`);
  }

  if (!country.flagPath) {
    warn(`${country.code}: missing flagPath`);
  }

  for (const lang of ["en", "pl", "de", "es"] as const) {
    const translation = country.translations[lang];

    if (!translation) {
      fail(`${country.code}: missing ${lang} translation`);
      continue;
    }

    if (!translation.name) {
      fail(`${country.code}: missing ${lang}.name`);
    }

    if (!translation.officialName) {
      fail(`${country.code}: missing ${lang}.officialName`);
    }
    // Descriptions are optional until Milestone 2
    // if (!translation.description) {
    //   warn(`${country.code}: missing ${lang}.description`);
    // }
  }
}

console.log("");

console.log("Countries:", countries.length);
console.log("Errors:", errors.length);
console.log("Warnings:", warnings.length);

if (warnings.length) {
  console.log("\nWarnings:");

  warnings.forEach((warning) => console.log(`  • ${warning}`));
}

if (errors.length) {
  console.log("\nErrors:");

  errors.forEach((error) => console.log(`  • ${error}`));

  process.exit(1);
}

console.log("\n✅ Dataset VALID");
