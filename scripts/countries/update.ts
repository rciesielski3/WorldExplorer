import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CountriesDataset } from "./types";

const dataPath = path.join(__dirname, "..", "..", "data", "countries.json");

interface UpdateReport {
  populationChanges: number;
  capitalChanges: number;
  regionChanges: number;
  languageChanges: number;
  currencyChanges: number;
  newCountries: number;
  removedCountries: number;
}

const generateDataset = () => {
  execSync("npm run countries:generate", { stdio: "inherit" });
};

const generateUpdateReport = (
  oldDataset: CountriesDataset | null,
  newDataset: CountriesDataset
): UpdateReport => {
  const report: UpdateReport = {
    populationChanges: 0,
    capitalChanges: 0,
    regionChanges: 0,
    languageChanges: 0,
    currencyChanges: 0,
    newCountries: 0,
    removedCountries: 0,
  };

  if (!oldDataset) {
    report.newCountries = newDataset.countries.length;
    return report;
  }

  const oldMap = new Map(oldDataset.countries.map((c) => [c.code, c]));
  const newMap = new Map(newDataset.countries.map((c) => [c.code, c]));

  for (const [code, newCountry] of newMap) {
    const oldCountry = oldMap.get(code);
    if (!oldCountry) {
      report.newCountries++;
      continue;
    }

    if (oldCountry.population !== newCountry.population)
      report.populationChanges++;
    if (oldCountry.capital !== newCountry.capital) report.capitalChanges++;
    if (oldCountry.region !== newCountry.region) report.regionChanges++;
    if (
      JSON.stringify(oldCountry.languages) !==
      JSON.stringify(newCountry.languages)
    )
      report.languageChanges++;
    if (
      JSON.stringify(oldCountry.currencies) !==
      JSON.stringify(newCountry.currencies)
    )
      report.currencyChanges++;
  }

  report.removedCountries = oldDataset.countries.length - newMap.size;

  return report;
};

const main = () => {
  console.log("Updating countries dataset...");

  let oldDataset: CountriesDataset | null = null;
  if (fs.existsSync(dataPath)) {
    const content = fs.readFileSync(dataPath, "utf8");
    oldDataset = JSON.parse(content);
  }

  generateDataset();

  const newDataset = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const report = generateUpdateReport(oldDataset, newDataset);

  const hasChanges =
    report.populationChanges > 0 ||
    report.capitalChanges > 0 ||
    report.regionChanges > 0 ||
    report.languageChanges > 0 ||
    report.currencyChanges > 0 ||
    report.newCountries > 0 ||
    report.removedCountries > 0;

  if (!hasChanges) {
    console.log("✓ No changes detected in countries dataset");
    return;
  }

  console.log("\n📊 Countries Dataset Update Report");
  console.log("━".repeat(40));
  console.log(`Population changes:  ${report.populationChanges}`);
  console.log(`Capital changes:     ${report.capitalChanges}`);
  console.log(`Region changes:      ${report.regionChanges}`);
  console.log(`Language changes:    ${report.languageChanges}`);
  console.log(`Currency changes:    ${report.currencyChanges}`);
  console.log(`New countries:       ${report.newCountries}`);
  console.log(`Removed countries:   ${report.removedCountries}`);
  console.log("━".repeat(40));
  console.log(`✓ Dataset updated successfully`);
};

main();
