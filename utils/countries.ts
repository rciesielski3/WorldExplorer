import countriesData from "../data/countries.json";

export type Country = (typeof countriesData.countries)[number];

export const countries = countriesData.countries;

export const fetchCountries = async () => countries;

export const getCountryByCode = (code: string) =>
  countries.find((country) => country.code === code || country.code3 === code);

export const getLocalizedCountryName = (country: Country, language: string) => {
  const lang = language.startsWith("pl")
    ? "pl"
    : language.startsWith("de")
      ? "de"
      : language.startsWith("es")
        ? "es"
        : "en";

  return (
    country.translations?.[lang]?.name ??
    country.translations?.en?.name ??
    country.code
  );
};

export const getSearchableCountryText = (country: Country) =>
  [
    country.translations.en.name,
    country.translations.pl.name,
    country.translations.de.name,
    country.translations.es.name,
    country.capital,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
