import { useState } from 'react';
import {
  Difficulty,
  Question,
  generateQuestionsByDifficulty,
} from '../../utils/quizDifficulty';
import { countries } from '../../utils/countries';

export interface UseQuizDifficultyReturn {
  selectedDifficulty: Difficulty;
  questions: Question[];
  startQuiz: (difficulty: Difficulty, count?: number) => void;
}

/**
 * Custom hook for managing quiz difficulty and question generation
 * @returns Object with selectedDifficulty, questions, and startQuiz function
 */
export const useQuizDifficulty = (): UseQuizDifficultyReturn => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    'medium'
  );
  const [questions, setQuestions] = useState<Question[]>([]);

  const startQuiz = (difficulty: Difficulty, count: number = 10) => {
    setSelectedDifficulty(difficulty);
    const generated = generateQuestionsByDifficulty(countries, difficulty, count);
    setQuestions(generated);
  };

  return { selectedDifficulty, questions, startQuiz };
};
