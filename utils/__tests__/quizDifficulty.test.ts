import { generateQuestionsByDifficulty, Difficulty, Question } from '../quizDifficulty';
import { Country } from '../countries';

// Mock country data for testing - includes a range of populations
const mockCountries: Country[] = [
  // Large population countries (will be excluded for hard)
  {
    code: 'US',
    code3: 'USA',
    capital: 'Washington, D.C.',
    population: 331000000,
    flag: '🇺🇸',
    flagPath: 'us.png',
    region: 'North America',
    subregion: 'Northern America',
    populationDensity: 36.1,
    area: 9833517,
    currencies: ['USD'],
    languages: ['English'],
    timezones: ['UTC-05:00'],
    lat: 37.0902,
    lng: -95.7129,
    borders: ['CAN', 'MEX'],
    translations: {
      en: { name: 'United States', officialName: 'United States', description: '' },
      pl: { name: 'Stany Zjednoczone', officialName: 'Stany Zjednoczone', description: '' },
      es: { name: 'Estados Unidos', officialName: 'Estados Unidos', description: '' },
      de: { name: 'Vereinigte Staaten', officialName: 'Vereinigte Staaten', description: '' },
    },
  },
  {
    code: 'DE',
    code3: 'DEU',
    capital: 'Berlin',
    population: 83000000,
    flag: '🇩🇪',
    flagPath: 'de.png',
    region: 'Europe',
    subregion: 'Central Europe',
    populationDensity: 232.9,
    area: 357022,
    currencies: ['EUR'],
    languages: ['German'],
    timezones: ['UTC+01:00'],
    lat: 51.1657,
    lng: 10.4515,
    borders: ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'NLD', 'POL'],
    translations: {
      en: { name: 'Germany', officialName: 'Federal Republic of Germany', description: '' },
      pl: { name: 'Niemcy', officialName: 'Niemcy', description: '' },
      es: { name: 'Alemania', officialName: 'Alemania', description: '' },
      de: { name: 'Deutschland', officialName: 'Deutschland', description: '' },
    },
  },
  {
    code: 'FR',
    code3: 'FRA',
    capital: 'Paris',
    population: 67000000,
    flag: '🇫🇷',
    flagPath: 'fr.png',
    region: 'Europe',
    subregion: 'Western Europe',
    populationDensity: 119.2,
    area: 563445,
    currencies: ['EUR'],
    languages: ['French'],
    timezones: ['UTC+01:00'],
    lat: 46.2276,
    lng: 2.2137,
    borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE'],
    translations: {
      en: { name: 'France', officialName: 'French Republic', description: '' },
      pl: { name: 'Francja', officialName: 'Francja', description: '' },
      es: { name: 'Francia', officialName: 'Francia', description: '' },
      de: { name: 'Frankreich', officialName: 'Frankreich', description: '' },
    },
  },
  // Medium population countries (included for all difficulties)
  {
    code: 'LU',
    code3: 'LUX',
    capital: 'Luxembourg',
    population: 645000,
    flag: '🇱🇺',
    flagPath: 'lu.png',
    region: 'Europe',
    subregion: 'Western Europe',
    populationDensity: 231.5,
    area: 2586,
    currencies: ['EUR'],
    languages: ['Luxembourgish'],
    timezones: ['UTC+01:00'],
    lat: 49.8153,
    lng: 6.1296,
    borders: ['BEL', 'FRA', 'DEU'],
    translations: {
      en: { name: 'Luxembourg', officialName: 'Grand Duchy of Luxembourg', description: '' },
      pl: { name: 'Luksemburg', officialName: 'Luksemburg', description: '' },
      es: { name: 'Luxemburgo', officialName: 'Luxemburgo', description: '' },
      de: { name: 'Luxemburg', officialName: 'Luxemburg', description: '' },
    },
  },
  {
    code: 'MT',
    code3: 'MLT',
    capital: 'Valletta',
    population: 535000,
    flag: '🇲🇹',
    flagPath: 'mt.png',
    region: 'Europe',
    subregion: 'Southern Europe',
    populationDensity: 438.2,
    area: 316,
    currencies: ['EUR'],
    languages: ['Maltese'],
    timezones: ['UTC+01:00'],
    lat: 35.8989,
    lng: 14.3754,
    borders: [],
    translations: {
      en: { name: 'Malta', officialName: 'Republic of Malta', description: '' },
      pl: { name: 'Malta', officialName: 'Malta', description: '' },
      es: { name: 'Malta', officialName: 'Malta', description: '' },
      de: { name: 'Malta', officialName: 'Malta', description: '' },
    },
  },
  {
    code: 'CY',
    code3: 'CYP',
    capital: 'Nicosia',
    population: 1202000,
    flag: '🇨🇾',
    flagPath: 'cy.png',
    region: 'Europe',
    subregion: 'Southern Europe',
    populationDensity: 129.1,
    area: 9251,
    currencies: ['EUR'],
    languages: ['Greek'],
    timezones: ['UTC+02:00'],
    lat: 34.9249,
    lng: 33.4299,
    borders: [],
    translations: {
      en: { name: 'Cyprus', officialName: 'Republic of Cyprus', description: '' },
      pl: { name: 'Cypr', officialName: 'Cypr', description: '' },
      es: { name: 'Chipre', officialName: 'Chipre', description: '' },
      de: { name: 'Zypern', officialName: 'Zypern', description: '' },
    },
  },
  // Small population countries (excluded for medium and hard)
  {
    code: 'AD',
    code3: 'AND',
    capital: 'Andorra la Vella',
    population: 77000,
    flag: '🇦🇩',
    flagPath: 'ad.png',
    region: 'Europe',
    subregion: 'Southern Europe',
    populationDensity: 165.1,
    area: 468,
    currencies: ['EUR'],
    languages: ['Catalan'],
    timezones: ['UTC+01:00'],
    lat: 42.5,
    lng: 1.5,
    borders: ['FRA', 'ESP'],
    translations: {
      en: { name: 'Andorra', officialName: 'Principality of Andorra', description: '' },
      pl: { name: 'Andora', officialName: 'Andora', description: '' },
      es: { name: 'Andorra', officialName: 'Andorra', description: '' },
      de: { name: 'Andorra', officialName: 'Andorra', description: '' },
    },
  },
  {
    code: 'MC',
    code3: 'MCO',
    capital: 'Monaco',
    population: 36469,
    flag: '🇲🇨',
    flagPath: 'mc.png',
    region: 'Europe',
    subregion: 'Western Europe',
    populationDensity: 19341.4,
    area: 2.02,
    currencies: ['EUR'],
    languages: ['French'],
    timezones: ['UTC+01:00'],
    lat: 43.7384,
    lng: 7.4246,
    borders: ['FRA'],
    translations: {
      en: { name: 'Monaco', officialName: 'Principality of Monaco', description: '' },
      pl: { name: 'Monako', officialName: 'Monako', description: '' },
      es: { name: 'Mónaco', officialName: 'Mónaco', description: '' },
      de: { name: 'Monaco', officialName: 'Monaco', description: '' },
    },
  },
  {
    code: 'LI',
    code3: 'LIE',
    capital: 'Vaduz',
    population: 39327,
    flag: '🇱🇮',
    flagPath: 'li.png',
    region: 'Europe',
    subregion: 'Western Europe',
    populationDensity: 237.7,
    area: 160,
    currencies: ['CHF'],
    languages: ['German'],
    timezones: ['UTC+01:00'],
    lat: 47.1660,
    lng: 9.5554,
    borders: ['AUT', 'CHE'],
    translations: {
      en: { name: 'Liechtenstein', officialName: 'Principality of Liechtenstein', description: '' },
      pl: { name: 'Liechtenstein', officialName: 'Liechtenstein', description: '' },
      es: { name: 'Liechtenstein', officialName: 'Liechtenstein', description: '' },
      de: { name: 'Liechtenstein', officialName: 'Liechtenstein', description: '' },
    },
  },
  {
    code: 'SM',
    code3: 'SMR',
    capital: 'San Marino',
    population: 34660,
    flag: '🇸🇲',
    flagPath: 'sm.png',
    region: 'Europe',
    subregion: 'Southern Europe',
    populationDensity: 574.2,
    area: 61,
    currencies: ['EUR'],
    languages: ['Italian'],
    timezones: ['UTC+01:00'],
    lat: 43.9424,
    lng: 12.4578,
    borders: ['ITA'],
    translations: {
      en: { name: 'San Marino', officialName: 'Most Serene Republic of San Marino', description: '' },
      pl: { name: 'San Marino', officialName: 'San Marino', description: '' },
      es: { name: 'San Marino', officialName: 'San Marino', description: '' },
      de: { name: 'San Marino', officialName: 'San Marino', description: '' },
    },
  },
  // Add more countries to make top 20 exclusion meaningful
  // These have populations < 1M to not interfere with medium filter tests
  ...Array.from({ length: 15 }, (_, i) => ({
    code: `C${String(i).padStart(2, '0')}`,
    code3: `C${String(i).padStart(3, '0')}`,
    capital: `Capital${i}`,
    population: 900000 - i * 50000, // Descending from 900k to ~150k
    flag: '🌍',
    flagPath: `c${i}.png`,
    region: 'Test',
    subregion: 'Test',
    populationDensity: 100,
    area: 1000,
    currencies: ['USD'],
    languages: ['Test'],
    timezones: ['UTC+00:00'],
    lat: 0,
    lng: 0,
    borders: [],
    translations: {
      en: { name: `Country${i}`, officialName: `Country${i}`, description: '' },
      pl: { name: `Country${i}`, officialName: `Country${i}`, description: '' },
      es: { name: `Country${i}`, officialName: `Country${i}`, description: '' },
      de: { name: `Country${i}`, officialName: `Country${i}`, description: '' },
    },
  })),
];

describe('generateQuestionsByDifficulty', () => {
  it('generates questions for easy difficulty', () => {
    const questions = generateQuestionsByDifficulty(mockCountries, 'easy', 3);

    expect(questions).toHaveLength(3);
    questions.forEach((question) => {
      expect(question.type).toBe('capital');
      expect(question.question).toMatch(/^What is the capital of /);
      expect(question.options).toHaveLength(5);
      expect(question.answer).toBeTruthy();
      expect(question.difficulty).toBe('easy');
      expect(question.options).toContain(question.answer);
    });
  });

  it('generates questions for medium difficulty', () => {
    const questions = generateQuestionsByDifficulty(mockCountries, 'medium', 2);

    expect(questions).toHaveLength(2);
    questions.forEach((question) => {
      expect(question.type).toBe('capital');
      expect(question.options).toHaveLength(4);
      expect(question.difficulty).toBe('medium');
    });
  });

  it('generates questions for hard difficulty', () => {
    const questions = generateQuestionsByDifficulty(mockCountries, 'hard', 2);

    expect(questions).toHaveLength(2);
    questions.forEach((question) => {
      expect(question.type).toBe('capital');
      expect(question.options).toHaveLength(3);
      expect(question.difficulty).toBe('hard');
    });
  });

  it('filters countries by population for medium difficulty (> 1M)', () => {
    // Medium should exclude countries <= 1M population
    // mockCountries with > 1M: US, DE, FR, CY
    const questions = generateQuestionsByDifficulty(mockCountries, 'medium', 10);

    const capitals = questions.map((q) => q.answer);
    // Small countries should be excluded
    expect(capitals).not.toContain('Andorra la Vella'); // 77k
    expect(capitals).not.toContain('Valletta'); // 535k
    expect(capitals).not.toContain('Luxembourg'); // 645k
    expect(capitals).not.toContain('Monaco'); // 36k
    // Large countries should be included
    expect(capitals).toContain('Washington, D.C.'); // 331M
    expect(capitals).toContain('Berlin'); // 83M
    expect(capitals).toContain('Paris'); // 67M
    expect(capitals).toContain('Nicosia'); // 1.202M
  });

  it('excludes top 20 most populous countries for hard difficulty', () => {
    // For hard, top 20 most populous (US, DE, FR) should be excluded
    // Only smaller countries like Andorra should appear
    const questions = generateQuestionsByDifficulty(mockCountries, 'hard', 10);

    const capitals = questions.map((q) => q.answer);
    // US (331M), DE (83M), FR (67M) should be excluded
    expect(capitals).not.toContain('Washington, D.C.');
    expect(capitals).not.toContain('Berlin');
    expect(capitals).not.toContain('Paris');
  });

  it('shuffles options so answer is not always at same position', () => {
    // Run multiple times to check randomness
    const positions = new Set<number>();

    for (let i = 0; i < 20; i++) {
      const questions = generateQuestionsByDifficulty(mockCountries, 'easy', 1);
      const question = questions[0];
      const answerIndex = question.options.indexOf(question.answer);
      positions.add(answerIndex);
    }

    // With enough iterations, answer should appear in different positions
    expect(positions.size).toBeGreaterThan(1);
  });

  it('returns empty array when count is 0', () => {
    const questions = generateQuestionsByDifficulty(mockCountries, 'easy', 0);
    expect(questions).toEqual([]);
  });

  it('does not mutate input countries array', () => {
    const countryCount = mockCountries.length;
    generateQuestionsByDifficulty(mockCountries, 'medium', 5);
    expect(mockCountries).toHaveLength(countryCount);
  });
});
