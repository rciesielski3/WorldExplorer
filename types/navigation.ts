import type { Country } from "../utils/countries";

export type RootStackParamList = {
  Home: undefined;
  Explore: undefined;
  Map:
    | {
        latitude: number;
        longitude: number;
        countryName: string;
        country: Country;
      }
    | undefined;
  Quiz: { country: Country } | undefined;
  CountryDetails: { country: Country };
  Settings: undefined;
  QuizResults: { score: number };
  Comparison: { initialCountries?: Country[] } | undefined;
  Favorites: undefined;
};
