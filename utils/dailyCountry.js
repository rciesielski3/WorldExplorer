const DAY_IN_MS = 24 * 60 * 60 * 1000;

const hasCountryDetails = (country) =>
  Boolean(
    country?.cca3 &&
      country?.name?.common &&
      country?.flags?.png &&
      country?.capital?.length &&
      country?.latlng?.length >= 2 &&
      country?.languages &&
      country?.currencies
  );

const getDayIndex = (date = new Date()) =>
  Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      DAY_IN_MS
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
