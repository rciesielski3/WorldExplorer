Countries Dataset Migration Implementation

Goal

Replace all runtime usage of REST Countries and countries.dev with a local dataset generated from mledoze/countries.

Requirements:

- No external country API calls
- No country-related API keys
- Local JSON dataset only
- Monthly automated updates
- Preserve custom descriptions during updates
- Support EN / PL / ES / DE

⸻

Step 1 - Repository Structure

Create:

data/
└── countries.json
scripts/
└── countries/
├── types.ts
├── transform.ts
├── generate.ts
└── update.ts

⸻

Step 2 - Types

File:

scripts/countries/types.ts
export interface CountryTranslation {
name: string;
officialName: string;
description: string;
}
export interface Country {
code: string;
code3: string;
capital: string;
region: string;
subregion: string;
population: number;
area: number;
currencies: string[];
languages: string[];
lat: number;
lng: number;
borders: string[];
flag: string;
translations: {
en: CountryTranslation;
pl: CountryTranslation;
es: CountryTranslation;
de: CountryTranslation;
};
}
export interface CountriesDataset {
generatedAt: string;
source: string;
version: number;
countries: Country[];
}

⸻

Step 3 - Shared Transformer

File:

scripts/countries/transform.ts

Requirements:

- Transform raw mledoze/countries data
- Sort by ISO code
- Preserve descriptions from previous dataset
- Do not overwrite descriptions during updates

Pseudo:

transformCountries(
rawCountries,
existingCountriesMap
)

Description merge:

description:
existingCountry?.translations?.pl?.description ?? ""

Same for:

- en
- pl
- es
- de

⸻

Step 4 - Generate Script

File:

scripts/countries/generate.ts

Responsibilities:

1. Download source dataset
2. Transform countries
3. Sort by code
4. Create dataset metadata
5. Save data/countries.json

Output structure:

{
"generatedAt": "...",
"source": "mledoze/countries",
"version": 1,
"countries": [...]
}

Package.json:

{
"scripts": {
"countries:generate": "tsx scripts/countries/generate.ts"
}
}

⸻

Step 5 - Update Script

File:

scripts/countries/update.ts

Responsibilities:

1. Read existing countries.json
2. Download latest source
3. Transform countries
4. Preserve descriptions
5. Compare datasets
6. Generate update report
7. Save only when changes exist

Package.json:

{
"scripts": {
"countries:update": "tsx scripts/countries/update.ts"
}
}

⸻

Step 6 - Update Report

Track:

population
capital
region
subregion
currencies
languages

Console output:

Countries update report
Population changes: X
Capital changes: X
Region changes: X
Language changes: X
Currency changes: X
New countries: X
Removed countries: X

If no changes:

No changes detected

Exit successfully.

⸻

Step 7 - Flag Migration

Current:

flagSvg
flagPng

Replace with:

flag

Example:

{
"flag": "pl.svg"
}

Store flags locally:

assets/flags/
├── pl.svg
├── de.svg
├── es.svg
...

Application should never load flag assets from external URLs.

⸻

Step 8 - Remove REST Countries

Delete:

services/restCountries*
hooks/useCountries*
api/restcountries\*

Search:

grep -R "restcountries" .
grep -R "countries.dev" .

Remove every occurrence.

⸻

Step 9 - Remove Environment Variables

Delete from:

.env
.env.example
eas.json
app.config.ts

Examples:

REST_COUNTRIES_API_KEY
REST_COUNTRIES_BASE_URL
COUNTRIES_DEV_API_KEY
COUNTRIES_DEV_BASE_URL

No country API secrets should remain.

⸻

Step 10 - Application Migration

Replace:

await fetch(...)

with:

import countries from "@/data/countries.json";

Create:

getCountryByCode(code)
getCountries()

using local dataset only.

⸻

Step 11 - Monthly Automation

Schedule:

0 3 1 \* \*

Execution:

npm run countries:update

Requirements:

- Preserve descriptions
- Generate report
- Update generatedAt
- Skip write when unchanged

⸻

Step 12 - Acceptance Criteria

- No REST Countries usage.
- No countries.dev usage.
- No country API keys.
- Countries loaded from local JSON.
- Flags loaded locally.
- EN/PL/ES/DE supported.
- Descriptions preserved during updates.
- Monthly update automation ready.
- Application works without country API connectivity.

Update – Countries Data Strategy (2026-06-27)

Final Architecture

World Explorer no longer depends on RestCountries API at runtime.

Data Sources

Primary Source

countries.dev

Used for:

- country metadata
- population
- population density
- capital
- region
- subregion
- area
- borders
- currencies
- languages
- coordinates
- timezones
- flag emoji
- flag SVG
- flag PNG

Translation Source

mledoze/countries

Used only for:

- English names
- Polish names
- Spanish names
- German names
- Official country names

Runtime Strategy

Application uses only local static data:

countries.dev +
mledoze/countries
↓
countries.json
↓
Expo App

No external country API calls are performed by the mobile application.

Countries Dataset

Location:

data/countries.json

Structure:

generatedAt
source
version
countries[]

Each country contains:

- code
- code3
- capital
- region
- subregion
- population
- populationDensity
- area
- currencies
- languages
- timezones
- coordinates
- borders
- flag
- flagSvg
- flagPng
- translations

Country Descriptions

Descriptions are maintained manually.

Generator must preserve existing:

translations.en.description
translations.pl.description
translations.es.description
translations.de.description

during every update.

Monthly Refresh

Countries dataset is refreshed monthly.

Process:

1. Download latest countries.dev dataset.
2. Download latest mledoze translations.
3. Merge datasets.
4. Preserve existing descriptions.
5. Generate new countries.json.
6. Commit updated dataset.

Removal of Legacy Implementation

Remove:

- RestCountries API integration
- RestCountries configuration
- RestCountries environment variables
- RestCountries services
- Runtime country fetch logic

Application must operate entirely from local country data.

Benefits

- No API limits
- No dependency on third-party uptime
- Faster application startup
- Offline-friendly architecture
- Deterministic data model
- Easier localization management
- Easier future AI-generated descriptions
