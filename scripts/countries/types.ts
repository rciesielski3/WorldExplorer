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
  populationDensity?: number;

  area: number;

  currencies: string[];
  languages: string[];

  timezones: string[];

  lat: number;
  lng: number;

  borders: string[];

  flag: string;
  flagSvg?: string;
  flagPng?: string;

  translations: {
    en: CountryTranslation;
    pl: CountryTranslation;
    es: CountryTranslation;
    de: CountryTranslation;
  };
}

export interface CountriesDataset {
  generatedAt: string;
  lastUpdated: string;
  source: string;
  version: number;
  countries: Country[];
}
