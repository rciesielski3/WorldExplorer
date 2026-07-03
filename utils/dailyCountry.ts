import type { Country } from "./countries";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const hasCountryDetails = (country: unknown): country is Country => {
  const c = country as Partial<Country> | null | undefined;
  return Boolean(
    c?.code3 &&
    c?.translations?.en?.name &&
    c?.flagPath &&
    c?.capital &&
    typeof c?.lat === "number" &&
    typeof c?.lng === "number" &&
    (c?.languages as unknown[])?.length &&
    (c?.currencies as unknown[])?.length,
  );
};

const getDayIndex = (date: Date = new Date()): number =>
  Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      DAY_IN_MS,
  );

const getDailyCountry = (countries: unknown[], date: Date = new Date()): Country | null => {
  const eligibleCountries = Array.isArray(countries)
    ? countries.filter(hasCountryDetails)
    : [];

  if (!eligibleCountries.length) {
    return null;
  }

  return eligibleCountries[getDayIndex(date) % eligibleCountries.length];
};

export {
  getDailyCountry,
  getDayIndex,
  hasCountryDetails,
  type Country,
};
