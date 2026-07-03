/**
 * Common formatting utilities
 * Extracted to avoid duplication across screens
 */

/**
 * Format a number with locale support
 */
export const formatNumber = (value: number | undefined): string | null => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return value?.toLocaleString() ?? null;
};

/**
 * Format population with M/K abbreviations
 */
export const formatPopulation = (population: number | undefined): string | null => {
  if (!Number.isFinite(population)) {
    return null;
  }

  if (population! >= 1_000_000) {
    return `${Math.round(population! / 1_000_000)}M`;
  }

  if (population! >= 1_000) {
    return `${Math.round(population! / 1_000)}K`;
  }

  return population?.toLocaleString() ?? null;
};

/**
 * Format currencies array into a comma-separated string
 */
export const formatCurrencies = (currencies: string[] | undefined): string | null => {
  if (!currencies?.length) {
    return null;
  }

  return currencies.join(", ");
};

/**
 * Format languages array into a comma-separated string
 */
export const formatLanguages = (languages: string[] | undefined): string | null => {
  if (!languages?.length) {
    return null;
  }

  return languages.join(", ");
};
