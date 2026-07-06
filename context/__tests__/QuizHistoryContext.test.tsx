import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { QuizHistoryProvider, useQuizHistory } from '../QuizHistoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

const TestComponent = () => {
  const { addQuizSession, getStats, isLoading } = useQuizHistory();
  const [sessionAdded, setSessionAdded] = React.useState(false);

  React.useEffect(() => {
    const addSession = async () => {
      await addQuizSession({
        timestamp: Date.now(),
        difficulty: 'easy',
        score: 85,
        timeTaken: 300,
      });
      setSessionAdded(true);
    };

    if (!isLoading) {
      addSession();
    }
  }, [addQuizSession, isLoading]);

  return (
    <>
      <Text testID="session-added">
        {sessionAdded ? 'Session Added' : 'Adding Session'}
      </Text>
      <Text testID="total-quizzes">{getStats().totalQuizzes}</Text>
    </>
  );
};

describe('QuizHistoryContext', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should add a quiz session and calculate stats', async () => {
    const { getByTestId } = render(
      <QuizHistoryProvider>
        <TestComponent />
      </QuizHistoryProvider>
    );

    await waitFor(() => {
      expect(getByTestId('session-added').props.children).toBe('Session Added');
    });

    await waitFor(() => {
      expect(getByTestId('total-quizzes').props.children).toBe(1);
    });
  });
});
