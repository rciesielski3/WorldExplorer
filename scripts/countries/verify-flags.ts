// scripts/countries/verify-flags.ts
import fs from "fs";
import path from "path";

const datasetPath = path.join(__dirname, "..", "..", "data", "countries.json");
const flagsDir = path.join(__dirname, "..", "..", "assets", "flags");

const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

let missingCount = 0;

console.log("\n🚩 Verifying flag files...");

for (const country of dataset.countries) {
  const flagFile = path.join(flagsDir, country.flagPath);

  if (!fs.existsSync(flagFile)) {
    console.log(`  ✗ Missing: ${country.code} (${country.flagPath})`);
    missingCount++;
  }
}

if (missingCount === 0) {
  console.log(`✅ All ${dataset.countries.length} flags verified`);
  process.exit(0);
} else {
  console.log(`\n❌ ${missingCount} missing flag files`);
  console.log(`Run: npm run flags:download`);
  process.exit(1);
}
