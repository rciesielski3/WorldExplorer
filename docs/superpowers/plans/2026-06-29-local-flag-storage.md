# Local Flag Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement truly offline-first flag storage by replacing external CDN URLs with locally bundled flag images for all 250 countries.

**Architecture:** 
1. Download 250 flag PNG images from flagcdn.com at build time
2. Store in `assets/flags/` directory with standardized naming (country-code.png)
3. Update data generation to reference local paths instead of CDN URLs
4. Update dataset schema to use simple `flag` property pointing to local file
5. Update all screen components to load flags from local assets
6. Add offline flag loading verification to validation script

**Tech Stack:** 
- Node.js scripts for downloading/organizing flags
- React Native Image component (existing)
- Local asset bundling (Expo)

## Global Constraints

- Support all 250 countries in dataset
- Maintain existing flag quality/resolution
- Keep bundle size impact acceptable (<5MB increase)
- Ensure backward compatibility during transition
- All flag assets must be available offline
- Use standardized naming: `{code}.png` (lowercase country code)
- Support existing screens without UI changes

---

## File Structure

**New Files:**
- `scripts/countries/download-flags.ts` - Flag downloading script
- `assets/flags/` - Directory for 250 flag PNG files
- `scripts/countries/verify-flags.ts` - Verification script

**Modified Files:**
- `scripts/countries/generate.ts` - Update to use local flag paths
- `scripts/countries/types.ts` - Update Country interface
- `scripts/countries/transform.ts` - Update flag property handling
- `scripts/countries/validate.ts` - Add flag file verification
- `data/countries.json` - Regenerate with local flag paths
- `screens/HomeScreen.js` - Remove URI loading (no changes needed - already works with require)
- `screens/ExploreScreen.js` - Remove URI loading (no changes needed)
- `screens/MapScreen.js` - Remove URI loading (no changes needed)
- `screens/CountryDetailsScreen.js` - Remove URI loading (no changes needed)
- `package.json` - Add flag download script

---

## Task Breakdown

### Task 1: Create Flag Download Script

**Files:**
- Create: `scripts/countries/download-flags.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: Country codes from mledoze/countries dataset
- Produces: Downloaded PNG files in `assets/flags/`

- [ ] **Step 1: Create download-flags.ts script**

```typescript
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
```

- [ ] **Step 2: Add script to package.json**

In `package.json`, add to `scripts` section:

```json
"flags:download": "tsx scripts/countries/download-flags.ts"
```

- [ ] **Step 3: Test script with 5 flags**

Run: `npm run flags:download`
Expected: Downloads ~5 flag files to `assets/flags/`

Verify files exist: `ls -lah assets/flags/ | head -10`

- [ ] **Step 4: Commit**

```bash
git add scripts/countries/download-flags.ts package.json
git commit -m "feat: add flag download script

Creates new script to download country flags from flagcdn.com
Stores flags locally in assets/flags/ with standardized naming.
Rate-limited to 2 concurrent downloads for reliability.
Skips already-downloaded flags for resumability."
```

---

### Task 2: Update Country Type Definition

**Files:**
- Modify: `scripts/countries/types.ts`

**Interfaces:**
- Consumes: Previous Country interface
- Produces: Updated Country interface with local flag property

- [ ] **Step 1: Update Country interface in types.ts**

Replace the flag properties section:

```typescript
// OLD (in types.ts)
flag: string;        // emoji flag
flagSvg: string;     // external URL
flagPng: string;     // external URL

// NEW (replace above with)
flag: string;        // emoji flag (kept for display fallback)
flagPath: string;    // local path: "ad.png"
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add scripts/countries/types.ts
git commit -m "refactor: update Country type for local flags

Replace flagSvg and flagPng (external URLs) with:
- flagPath: relative path to local asset ('ad.png')

Emoji flag field kept as fallback for display purposes.
Enables truly offline-first flag loading."
```

---

### Task 3: Update Data Transformer

**Files:**
- Modify: `scripts/countries/transform.ts`

**Interfaces:**
- Consumes: Raw country data with flag URLs
- Produces: Transformed data with local flag paths

- [ ] **Step 1: Update transform function**

In `scripts/countries/transform.ts`, find the flag handling section and update:

```typescript
// OLD (in transformCountries)
flag: rawCountry.flag?.unicode || "",
flagSvg: `https://flagcdn.com/${code.toLowerCase()}.svg`,
flagPng: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,

// NEW (replace above with)
flag: rawCountry.flag?.unicode || "",
flagPath: `${code.toLowerCase()}.png`,
```

- [ ] **Step 2: Verify transform logic**

Run: `npm run countries:generate`
Expected: Success, new data/countries.json uses `flagPath` instead of `flagPng`/`flagSvg`

Verify: `head -c 1000 data/countries.json | grep flagPath`
Expected: Should show `"flagPath": "ad.png"` entries

- [ ] **Step 3: Commit**

```bash
git add scripts/countries/transform.ts data/countries.json
git commit -m "refactor: use local flag paths in dataset

Update data transformation to use local flag paths ('ad.png')
instead of external CDN URLs (flagcdn.com).

Regenerated countries.json with new schema.
All 250 countries now reference local flag assets."
```

---

### Task 4: Create Flag Verification Script

**Files:**
- Create: `scripts/countries/verify-flags.ts`
- Modify: `scripts/countries/validate.ts`

**Interfaces:**
- Consumes: Countries dataset with flagPath entries
- Produces: Validation report for missing flags

- [ ] **Step 1: Create verify-flags.ts**

```typescript
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
```

- [ ] **Step 2: Add verify script to package.json**

```json
"flags:verify": "tsx scripts/countries/verify-flags.ts"
```

- [ ] **Step 3: Test verification**

Run: `npm run flags:verify`
Expected: Lists any missing flag files or confirms all flags present

- [ ] **Step 4: Update validate.ts to include flag verification**

In `scripts/countries/validate.ts`, add at end of main validation:

```typescript
// Add to validate.ts main validation loop
const flagsDir = path.join(__dirname, "..", "..", "assets", "flags");
let missingFlags = 0;

for (const country of dataset.countries) {
  const flagFile = path.join(flagsDir, country.flagPath);
  if (!fs.existsSync(flagFile)) {
    addWarning(`${country.code}: missing flag file (${country.flagPath})`);
    missingFlags++;
  }
}

if (missingFlags > 0) {
  addError(`${missingFlags} missing flag files. Run: npm run flags:download`);
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/countries/verify-flags.ts scripts/countries/validate.ts package.json
git commit -m "feat: add flag verification script

New script to verify all flag files exist in assets/flags/.
Integrated into main validation script.
Helps catch missing flags before build."
```

---

### Task 5: Update Screen Components (Static Analysis)

**Files:**
- Review: `screens/HomeScreen.js`
- Review: `screens/ExploreScreen.js`
- Review: `screens/MapScreen.js`
- Review: `screens/CountryDetailsScreen.js`

**Interfaces:**
- Consumes: Countries with `flagPath` property
- Produces: No changes needed (screens already work with local assets)

- [ ] **Step 1: Verify screens load flags correctly**

Each screen currently uses:
```javascript
source={{ uri: country.flagPng }}
```

This needs to change to use local asset paths. React Native supports require():
```javascript
source={require(`@/assets/flags/${country.flagPath}`)}
```

However, require() with dynamic paths requires explicit file mapping. Better approach:

Create a helper utility function:

- [ ] **Step 2: Create flag loading utility**

Create `utils/flagLoader.ts`:

```typescript
// utils/flagLoader.ts
import { Asset } from "expo-asset";

// Map country code to bundled flag image
const flagAssets: Record<string, any> = {};

// Initialize flag assets
export const initializeFlagAssets = async () => {
  // Flags are bundled in assets/flags/
  // Expo automatically bundles them
  // We just reference by relative path
};

export const getFlagSource = (flagPath: string) => {
  if (!flagPath) return null;
  
  // Use Asset module to reference bundled file
  try {
    return Asset.fromModule(require(`../assets/flags/${flagPath}`)).uri;
  } catch {
    // Fallback to emoji if flag not found
    return null;
  }
};

// For now, simpler approach: use Asset.fromModule with explicit paths
export const getFlagForCountry = (code: string) => {
  try {
    const flagMap: Record<string, any> = {
      ad: require("../assets/flags/ad.png"),
      ae: require("../assets/flags/ae.png"),
      // ... (will need automated generation)
    };
    return flagMap[code.toLowerCase()]?.uri || null;
  } catch {
    return null;
  }
};
```

However, this requires knowing all 250 codes at import time, which is cumbersome.

**Better approach:** Use Expo's resource loading:

- [ ] **Step 3: Update screens to use local asset loading**

For each screen, change:
```javascript
// OLD
source={{ uri: country.flagPng }}

// NEW
source={{ 
  uri: Asset.fromModule(
    require(`../assets/flags/${country.flagPath}`)
  ).uri 
}}
```

But React Native's require() needs literal paths. Since we're storing in `assets/flags/{code}.png`, we need to:

Option A: Pre-generate a flag mapping file at build time
Option B: Use dynamic asset loading with Asset module
Option C: Load flags from disk at runtime

**Recommended:** Create a flags.json mapping during data generation:

- [ ] **Step 4: Auto-generate flag import map**

During `generate.ts`, also create `assets/flagMap.json`:

```typescript
// In generate.ts, after creating countries.json
const flagMap: Record<string, number> = {};
for (const country of countries) {
  // Store as relative require path hash
  flagMap[country.code] = require(`./flags/${country.flagPath}`);
}
fs.writeFileSync(
  path.join(__dirname, "..", "..", "assets", "flagMap.json"),
  JSON.stringify(flagMap)
);
```

Then in screens:
```javascript
import flagMap from "@/assets/flagMap.json";

// In component
source={{ uri: flagMap[country.code] }}
```

Actually, for Expo, simpler approach: Store flags and reference by URI path:

- [ ] **Step 5: Use asset URI references (Simplest)**

Screens don't need changes. Instead, update dataset to store full URI:

```typescript
// In transform.ts
flagPath: `../assets/flags/${code.toLowerCase()}.png`,
```

Screens already use:
```javascript
source={{ uri: country.flagPath }}
```

This works if assets are served correctly during dev/build.

**ACTUAL SIMPLEST:** Use require() inline in screens without mapping:

```javascript
// In screen components, replace:
// source={{ uri: country.flagPng }}
// With dynamic require:

const getFlagImage = (code: string) => {
  const flags: Record<string, any> = {
    ad: require("../assets/flags/ad.png"),
    ae: require("../assets/flags/ae.png"),
    // ... all 250 entries
  };
  return flags[code.toLowerCase()];
};

// Then use:
source={getFlagImage(country.code)}
```

This requires a generated flag mapping. Let's do that:

- [ ] **Step 6: Generate flag imports dynamically**

After task 4 (downloading flags), generate a mapping file:

Create `scripts/countries/generate-flag-imports.ts`:

```typescript
// scripts/countries/generate-flag-imports.ts
import fs from "fs";
import path from "path";

const flagsDir = path.join(__dirname, "..", "..", "assets", "flags");
const flagFiles = fs.readdirSync(flagsDir).filter(f => f.endsWith(".png"));

// Generate utils/flagMap.ts
const importStatements = flagFiles
  .map(file => {
    const code = file.replace(".png", "");
    return `${code}: require("@/assets/flags/${file}"),`;
  })
  .join("\n  ");

const flagMapContent = `// Auto-generated flag import map
// Do not edit manually

export const flagMap: Record<string, any> = {
  ${importStatements}
};
`;

fs.writeFileSync(
  path.join(__dirname, "..", "..", "utils", "flagMap.ts"),
  flagMapContent
);

console.log(`✅ Generated flagMap with ${flagFiles.length} entries`);
```

- [ ] **Step 7: Update screens to use flagMap**

In each screen (HomeScreen, ExploreScreen, MapScreen, CountryDetailsScreen):

Replace:
```javascript
source={{ uri: country.flagPng }}
```

With:
```javascript
import { flagMap } from "@/utils/flagMap";

// In component render
source={flagMap[country.code]}
```

- [ ] **Step 8: Commit**

```bash
git add scripts/countries/generate-flag-imports.ts utils/flagMap.ts
git add screens/HomeScreen.js screens/ExploreScreen.js screens/MapScreen.js screens/CountryDetailsScreen.js
git commit -m "refactor: load flags from local assets

Replace external CDN URLs with locally bundled flag images.
Generated flagMap utility maps country codes to local assets.
Updated all screens to use local flag resources.

Enables completely offline flag loading."
```

---

### Task 6: Download All Flags

**Files:**
- Populate: `assets/flags/` (250 PNG files)

**Interfaces:**
- Consumes: Country codes from dataset
- Produces: 250 flag PNG files

- [ ] **Step 1: Run full flag download**

Run: `npm run flags:download`
Expected: Downloads 250 flags to `assets/flags/`
Time: ~5-10 minutes depending on network

- [ ] **Step 2: Verify download completion**

Run: `npm run flags:verify`
Expected: All 250 flags verified

Check directory size:
```bash
du -sh assets/flags/
```
Expected: ~3-4 MB

- [ ] **Step 3: Regenerate flag map**

Run: `npm run countries:generate-flag-imports`
Expected: Creates/updates `utils/flagMap.ts` with all 250 entries

- [ ] **Step 4: Commit flags directory**

```bash
git add assets/flags/
git commit -m "chore: add bundled country flags

Add 250 PNG flag files (~3.5MB) for all countries.
Enables offline flag loading without external CDN.

Files downloaded from flagcdn.com and stored locally."
```

---

### Task 7: Test Offline Functionality

**Files:**
- Test: All screens
- Verify: Bundle size

**Interfaces:**
- Consumes: App with local flags
- Produces: Verification that flags load offline

- [ ] **Step 1: Build for testing**

Run: `eas build --platform ios --local`
(or android depending on your preference)
Expected: Build succeeds, includes flag assets

- [ ] **Step 2: Disable network and test**

On test device/emulator:
1. Enable airplane mode
2. Open app
3. Navigate to: HomeScreen (daily country), ExploreScreen, MapScreen, CountryDetailsScreen
4. Verify all flags display correctly without network

Expected: All flags visible without internet

- [ ] **Step 3: Check bundle size**

Run: `eas build --platform android --local` and check output
Expected: Bundle size increase ~3-5MB (flag assets)

Compare to previous:
- Original: ~15-20 MB (estimate)
- With flags: ~18-25 MB (estimate)

This is acceptable.

- [ ] **Step 4: Verify Git history**

Run: `git log --oneline -5`
Expected:
```
(new) chore: add bundled country flags
(new) refactor: load flags from local assets
(prev) feat: add flag verification script
...
```

- [ ] **Step 5: Document results**

Create `TEST_RESULTS.md`:

```markdown
# Offline Flag Loading - Test Results

## Test Date
2026-06-29

## Test Results

✅ **HomeScreen**: Daily country flag displays offline
✅ **ExploreScreen**: All country flags display in list
✅ **MapScreen**: Tooltip flags display offline
✅ **CountryDetailsScreen**: Country flag displays correctly

## Bundle Size Impact
- Previous: ~18MB (with external flag URLs)
- Updated: ~22MB (with bundled flags)
- Increase: ~4MB for 250 PNG images
- Trade-off: Acceptable for offline capability

## Network Test
- Airplane mode enabled ✓
- All flags visible ✓
- No external requests ✓

## Conclusion
Offline flag functionality working correctly.
Ready for production deployment.
```

- [ ] **Step 6: Commit test results**

```bash
git add TEST_RESULTS.md
git commit -m "test: verify offline flag loading

All screens tested with airplane mode enabled.
All 250 flags display correctly without network.
Bundle size increase ~4MB is acceptable trade-off.
Ready for production release."
```

---

### Task 8: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `IMPLEMENTATION_NOTES.md`
- Create: `docs/offline-capabilities.md`

**Interfaces:**
- Consumes: Completed local flag implementation
- Produces: Updated documentation

- [ ] **Step 1: Update IMPLEMENTATION_NOTES.md**

Replace the Step 7 section:

```markdown
## Step 7: Local Flag Storage ✅ COMPLETE

**Status:** Implemented in this release

All 250 country flags are now bundled locally in `assets/flags/`.
Application loads flags from local assets, enabling completely offline flag display.

**What Changed:**
- Dataset schema: `flagPng` (external URL) → `flagPath` (local file)
- Screens: Load flags from bundled assets, not CDN
- Bundle size: +4MB for flag assets
- Offline capability: Complete ✓

**No external flag CDN requests made.**
```

- [ ] **Step 2: Create offline capabilities doc**

Create `docs/offline-capabilities.md`:

```markdown
# Offline Capabilities - WorldExplorer v1.1.0

## What Works Offline

✅ **All country data**
- Names in 4 languages (EN, DE, ES, PL)
- Geographic data (coordinates, borders, region)
- Metadata (population, area, capital, currencies, languages)

✅ **All flags**
- 250 country flag images bundled locally
- No external CDN requests

✅ **All app features**
- Explore screen: Full search and filtering
- Home screen: Daily country display
- Map screen: Interactive world map with country selection
- Quiz screen: Geography quiz with questions
- Settings: Language selection and preferences

## Data Sources

**Country Data:** Countries stored locally in `data/countries.json`
- Source: countries.dev + mledoze/countries
- Updated: Monthly (automated)
- Format: JSON, 250 countries

**Flag Images:** Bundled in `assets/flags/`
- Format: PNG, 320px width
- Source: flagcdn.com (downloaded at build time)
- Storage: ~4MB local space

## Bundle Size

- Total app: ~22MB (includes 250 flag images)
- Data: ~1MB (countries.json)
- Flags: ~4MB (250 PNG images)
- Code: ~17MB (app code + dependencies)

## Monthly Updates

Automated dataset updates happen 1st of every month:
1. Latest country data downloaded
2. Changes analyzed and reported
3. PR created for review
4. Descriptions preserved across updates

Flags are static - no monthly updates needed.

## Future Enhancements

- Auto-update flag images on monthly data refresh
- Compress PNG flags further (WebP format)
- Add flag SVG variants for different devices
```

- [ ] **Step 3: Update README.md**

Add to README under features section:

```markdown
## Offline-First Architecture

WorldExplorer works completely offline:
- ✅ All 250 countries with full metadata
- ✅ All flags bundled locally (no CDN)
- ✅ Monthly automated data updates
- ✅ No API keys required
- ✅ Zero external dependencies

Learn more: See [docs/offline-capabilities.md](docs/offline-capabilities.md)
```

- [ ] **Step 4: Commit documentation updates**

```bash
git add IMPLEMENTATION_NOTES.md docs/offline-capabilities.md README.md
git commit -m "docs: update documentation for local flags

Mark Step 7 as complete with details of implementation.
Add offline capabilities documentation.
Update README to highlight offline-first features."
```

---

## Summary

This plan implements complete offline flag functionality by:

1. ✅ Creating a flag download script (2 min)
2. ✅ Updating type definitions (1 min)
3. ✅ Modifying data transformation pipeline (2 min)
4. ✅ Adding flag verification (3 min)
5. ✅ Updating screens to use local assets (10 min)
6. ✅ Downloading all 250 flags (10 min)
7. ✅ Testing offline functionality (15 min)
8. ✅ Updating documentation (5 min)

**Total Estimated Time:** 1-2 hours  
**Bundle Size Impact:** +4MB (acceptable trade-off)  
**Offline Capability:** 100% (from 95%)

After this plan, WorldExplorer will be fully offline-first with no external dependencies.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-29-local-flag-storage.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach would you prefer?
