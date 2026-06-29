const DAY_IN_MS = 24 * 60 * 60 * 1000;

const hasCountryDetails = (country) =>
  Boolean(
    country?.code3 &&
    country?.translations?.en?.name &&
    country?.flagPath &&
    country?.capital &&
    typeof country?.lat === "number" &&
    typeof country?.lng === "number" &&
    country?.languages?.length &&
    country?.currencies?.length,
  );

const getDayIndex = (date = new Date()) =>
  Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      DAY_IN_MS,
  );

const getDailyCountry = (countries, date = new Date()) => {
  const eligibleCountries = Array.isArray(countries)
    ? countries.filter(hasCountryDetails)
    : [];

  if (!eligibleCountries.length) {
    return null;
  }

  return eligibleCountries[getDayIndex(date) % eligibleCountries.length];
};

module.exports = {
  getDailyCountry,
  getDayIndex,
  hasCountryDetails,
};
