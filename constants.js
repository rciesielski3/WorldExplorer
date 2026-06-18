export const REST_COUNTRIES_API_KEY =
  process.env.EXPO_PUBLIC_REST_COUNTRIES_API_KEY || "";

export const REST_COUNTRIES_API_URL =
  "https://api.restcountries.com/countries/v5";
export const REST_COUNTRIES_PAGE_SIZE = 100;

export const REST_COUNTRIES_API_CONFIG = REST_COUNTRIES_API_KEY
  ? {
      headers: {
        Authorization: `Bearer ${REST_COUNTRIES_API_KEY}`,
      },
    }
  : {};

export const getRestCountriesPageUrl = (offset = 0) =>
  `${REST_COUNTRIES_API_URL}?limit=${REST_COUNTRIES_PAGE_SIZE}&offset=${offset}`;

export const API_URL = getRestCountriesPageUrl();
export const QUIZ_API_URL = API_URL;

const normalizeCurrencies = (currencies) => {
  if (!Array.isArray(currencies)) {
    return currencies;
  }

  return currencies.reduce((normalizedCurrencies, currency) => {
    if (currency?.code) {
      normalizedCurrencies[currency.code] = {
        name: currency.name,
        symbol: currency.symbol,
      };
    }

    return normalizedCurrencies;
  }, {});
};

const normalizeLanguages = (languages) => {
  if (!Array.isArray(languages)) {
    return languages;
  }

  return languages.reduce((normalizedLanguages, language) => {
    const code = language?.iso639_2t || language?.iso639_1 || language?.bcp47;

    if (code && language?.name) {
      normalizedLanguages[code] = language.name;
    }

    return normalizedLanguages;
  }, {});
};

export const normalizeCountry = (country) => {
  if (country?.name?.common) {
    return country;
  }

  return {
    name: {
      common: country?.names?.common,
      official: country?.names?.official,
      nativeName: country?.names?.native,
    },
    flags: {
      png: country?.flag?.url_png,
      svg: country?.flag?.url_svg,
      alt: country?.flag?.description,
    },
    capital: country?.capitals?.map((capital) => capital.name).filter(Boolean),
    cca2: country?.codes?.alpha_2,
    cca3: country?.codes?.alpha_3,
    population: country?.population,
    region: country?.region,
    subregion: country?.subregion,
    languages: normalizeLanguages(country?.languages),
    currencies: normalizeCurrencies(country?.currencies),
    latlng:
      Number.isFinite(country?.coordinates?.lat) &&
      Number.isFinite(country?.coordinates?.lng)
        ? [country.coordinates.lat, country.coordinates.lng]
        : undefined,
    area: country?.area?.kilometers,
    borders: country?.borders,
    timezones: country?.timezones,
    tld: country?.tlds,
  };
};

export const normalizeCountriesResponse = (responseData) => {
  const countries = responseData?.data?.objects ?? responseData;

  if (!Array.isArray(countries)) {
    return [];
  }

  return countries
    .map(normalizeCountry)
    .filter((country) => country.name?.common && country.cca3);
};
