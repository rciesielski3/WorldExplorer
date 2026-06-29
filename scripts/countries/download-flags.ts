// scripts/countries/download-flags.ts
import fs from "fs";
import path from "path";
import https from "https";

const FLAGCDN_URL = "https://flagcdn.com/w320";
const FLAGS_DIR = path.join(__dirname, "..", "..", "assets", "flags");

// Ensure directory exists
if (!fs.existsSync(FLAGS_DIR)) {
  fs.mkdirSync(FLAGS_DIR, { recursive: true });
}

const downloadFlag = (code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const url = `${FLAGCDN_URL}/${code.toLowerCase()}.png`;
    const filepath = path.join(FLAGS_DIR, `${code.toLowerCase()}.png`);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${code}: already exists`);
      resolve();
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${code}: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`✓ ${code}: downloaded`);
        resolve();
      });
      file.on("error", reject);
    });
  });
};

const main = async () => {
  // List of all country codes (we'll get these from the dataset)
  const datasetPath = path.join(__dirname, "..", "..", "data", "countries.json");
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

  const codes = dataset.countries.map((c: any) => c.code);

  console.log(`\nDownloading ${codes.length} flags...`);

  // Download with rate limiting (2 concurrent)
  let completed = 0;
  const batchSize = 2;

  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    await Promise.all(batch.map((code) => downloadFlag(code)));
    completed += batch.length;
    console.log(`Progress: ${completed}/${codes.length}`);
  }

  console.log(`\n✅ Downloaded ${completed} flags to ${FLAGS_DIR}`);
};

main().catch((error) => {
  console.error("Error downloading flags:", error);
  process.exit(1);
});
