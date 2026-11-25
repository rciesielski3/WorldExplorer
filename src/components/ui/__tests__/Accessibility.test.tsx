import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { SearchBar } from '../SearchBar';
import { Card } from '../Card';
import { RetryErrorBanner } from '../RetryErrorBanner';
import { DailyChallengeCard } from '../DailyChallengeCard';
import { getCountryByCode } from '../../../../utils/countries';
// Side effect: initializes the shared i18next instance (default "en").
import '../../../../i18n';

describe('Accessibility labels', () => {
  it('SearchBar labels the input and the clear button', async () => {
    const onSearch = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <ThemeProvider>
        <SearchBar onSearch={onSearch} placeholder="Find a country" />
      </ThemeProvider>
    );
    await act(async () => {});

    fireEvent.changeText(getByLabelText('Find a country'), 'Pol');
    fireEvent.press(getByLabelText('Clear search'));

    expect(onSearch).toHaveBeenLastCalledWith('');
    expect(getByTestId('search-input').props.value).toBe('');
  });

  it('Card exposes a button role and label only when pressable', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <Card onPress={onPress} accessibilityLabel="Open card">
          <Text>Body</Text>
        </Card>
      </ThemeProvider>
    );
    await act(async () => {});

    const card = getByLabelText('Open card');
    expect(card.props.accessibilityRole).toBe('button');
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('RetryErrorBanner labels retry and dismiss actions', async () => {
    const onRetry = jest.fn();
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <RetryErrorBanner visible error="Oops" onRetry={onRetry} onDismiss={onDismiss} />
      </ThemeProvider>
    );
    await act(async () => {});

    fireEvent.press(getByLabelText('Retry'));
    fireEvent.press(getByLabelText('Dismiss'));
    expect(onRetry).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('DailyChallengeCard button label includes the country name', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={getCountryByCode('JP')!} onPress={onPress} />
      </ThemeProvider>
    );
    await act(async () => {});

    fireEvent.press(getByLabelText('Start daily challenge: Japan'));
    expect(onPress).toHaveBeenCalled();
  });
});
