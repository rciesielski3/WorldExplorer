import { Country } from './countries';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  type: 'capital' | 'country' | 'flag';
  question: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get the number of options based on difficulty
 */
function getOptionCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 4;
    case 'hard':
      return 3;
    default:
      return 4;
  }
}

/**
 * Filter countries based on difficulty level
 */
function filterCountriesByDifficulty(
  countries: Country[],
  difficulty: Difficulty
): Country[] {
  switch (difficulty) {
    case 'easy':
      // Easy: All countries
      return countries;

    case 'medium':
      // Medium: Exclude countries with population <= 1,000,000
      return countries.filter((country) => country.population > 1000000);

    case 'hard':
      // Hard: Exclude top 20 most populous countries
      const sortedByPopulation = [...countries].sort(
        (a, b) => b.population - a.population
      );
      const topPopulous = new Set(sortedByPopulation.slice(0, 20).map((c) => c.code));
      return countries.filter((country) => !topPopulous.has(country.code));

    default:
      return countries;
  }
}

/**
 * Generate a single question for a country
 */
function generateQuestion(
  country: Country,
  allCapitals: string[],
  difficulty: Difficulty
): Question {
  const countryName = country.translations?.en?.name || country.code;
  const correctAnswer = country.capital;
  const optionCount = getOptionCount(difficulty);

  // Get wrong options (other capitals)
  const wrongOptions = allCapitals
    .filter((capital) => capital !== correctAnswer)
    .slice(0, optionCount - 1);

  // Combine correct answer with wrong options
  const options = shuffleArray([correctAnswer, ...wrongOptions]);

  return {
    type: 'capital',
    question: `What is the capital of ${countryName}?`,
    options,
    answer: correctAnswer,
    difficulty,
  };
}

/**
 * Generate questions based on difficulty level
 * @param countries - List of all countries
 * @param difficulty - Difficulty level (easy, medium, hard)
 * @param count - Number of questions to generate
 * @returns Array of questions
 */
export function generateQuestionsByDifficulty(
  countries: Country[],
  difficulty: Difficulty,
  count: number
): Question[] {
  if (count <= 0) {
    return [];
  }

  // Filter countries based on difficulty
  const filteredCountries = filterCountriesByDifficulty(countries, difficulty);

  // If we don't have enough countries, return what we can
  const questionsToGenerate = Math.min(count, filteredCountries.length);

  // Shuffle countries to get random selection
  const shuffledCountries = shuffleArray(filteredCountries);
  const selectedCountries = shuffledCountries.slice(0, questionsToGenerate);

  // Get all capitals for wrong options
  const allCapitals = filteredCountries.map((c) => c.capital);

  // Generate questions
  return selectedCountries.map((country) =>
    generateQuestion(country, allCapitals, difficulty)
  );
}
