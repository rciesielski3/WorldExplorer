export const COUNTRY_LIST_FIELDS = [
  "name",
  "flags",
  "capital",
  "cca3",
  "population",
  "region",
  "subregion",
  "languages",
  "currencies",
  "latlng",
  "area",
  "borders",
  "timezones",
  "tld",
].join(",");

export const QUIZ_COUNTRY_FIELDS = ["name", "flags", "capital"].join(",");

export const API_URL = `https://restcountries.com/v3.1/all?fields=${COUNTRY_LIST_FIELDS}`;
export const QUIZ_API_URL = `https://restcountries.com/v3.1/all?fields=${QUIZ_COUNTRY_FIELDS}`;
