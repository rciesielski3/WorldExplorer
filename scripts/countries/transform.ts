import { Country } from "./types";

type ExistingCountryMap = Map<string, Partial<Country>>;

type TranslationCountry = {
  cca2: string;
  name: {
    common: string;
    official: string;
  };
  translations?: {
    pol?: {
      common: string;
      official: string;
    };
    spa?: {
      common: string;
      official: string;
    };
    deu?: {
      common: string;
      official: string;
    };
  };
};

export const transformCountries = (
  countriesDevData: any[],
  translationData: TranslationCountry[],
  existingCountries: ExistingCountryMap = new Map(),
): Country[] => {
  const translationsMap = new Map(
    translationData.map((country) => [country.cca2, country]),
  );

  return countriesDevData
    .map((country) => {
      const translationCountry = translationsMap.get(country.alpha2Code);
      const existing =
        existingCountries.get(country.alpha2Code) ??
        existingCountries.get(country.cca2);

      return {
        code: country.alpha2Code,
        code3: country.alpha3Code,

        capital: country.capital ?? "",

        region: country.region ?? "",
        subregion: country.subregion ?? "",

        population: country.population ?? 0,
        populationDensity: country.populationDensity ?? undefined,

        area: country.area ?? 0,

        currencies:
          country.currencies?.map((currency: any) => currency.code) ?? [],

        languages:
          country.languages?.map((language: any) => language.name) ?? [],

        timezones: country.timezones ?? [],

        lat: country.latlng?.[0] ?? 0,
        lng: country.latlng?.[1] ?? 0,

        borders: country.borders ?? [],

        flag: country.flag ?? "",

        flagSvg: country.flags?.svg,
        flagPng: country.flags?.png,

        translations: {
          en: {
            name: translationCountry?.name?.common ?? country.name,
            officialName: translationCountry?.name?.official ?? country.name,
            description: existing?.translations?.en?.description ?? "",
          },

          pl: {
            name: translationCountry?.translations?.pol?.common ?? country.name,
            officialName:
              translationCountry?.translations?.pol?.official ?? country.name,
            description: existing?.translations?.pl?.description ?? "",
          },

          es: {
            name: translationCountry?.translations?.spa?.common ?? country.name,
            officialName:
              translationCountry?.translations?.spa?.official ?? country.name,
            description: existing?.translations?.es?.description ?? "",
          },

          de: {
            name: translationCountry?.translations?.deu?.common ?? country.name,
            officialName:
              translationCountry?.translations?.deu?.official ?? country.name,
            description: existing?.translations?.de?.description ?? "",
          },
        },
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
};
