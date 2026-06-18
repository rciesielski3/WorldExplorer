import axios from "axios";

import {
  REST_COUNTRIES_API_CONFIG,
  getRestCountriesPageUrl,
  normalizeCountriesResponse,
} from "../constants";

let countriesPromise;

const fetchCountriesPage = async (offset = 0) => {
  const response = await axios.get(
    getRestCountriesPageUrl(offset),
    REST_COUNTRIES_API_CONFIG
  );

  return {
    countries: normalizeCountriesResponse(response.data),
    meta: response.data?.data?.meta,
  };
};

const fetchAllCountries = async () => {
  const firstPage = await fetchCountriesPage();
  const meta = firstPage.meta;

  if (!meta?.more) {
    return firstPage.countries;
  }

  const limit = meta.limit || 100;
  const total = meta.total || firstPage.countries.length;
  const pageRequests = [];

  for (
    let offset = (meta.offset || 0) + limit;
    offset < total;
    offset += limit
  ) {
    pageRequests.push(fetchCountriesPage(offset));
  }

  const remainingPages = await Promise.all(pageRequests);

  return [
    ...firstPage.countries,
    ...remainingPages.flatMap((page) => page.countries),
  ];
};

export const fetchCountries = () => {
  if (!countriesPromise) {
    countriesPromise = fetchAllCountries().catch((error) => {
      countriesPromise = undefined;
      throw error;
    });
  }

  return countriesPromise;
};
