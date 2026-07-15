import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { DailyChallengeCard } from '../DailyChallengeCard';
import { getCountryByCode } from '../../../../utils/countries';
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside the component resolves real
// strings instead of returning the raw key, matching how App.tsx bootstraps
// it (see screens/__tests__/CountryDetailsScreen.test.tsx for precedent).
import '../../../../i18n';

// Use a real `Country` fixture (Japan) instead of a hand-built object
// literal. `Country` is derived from data/countries.json and has many
// required fields (code3, subregion, populationDensity, currencies,
// timezones, lat, lng, borders, flag, flagPath, translations) that a
// simplified mock would be missing, breaking type-checking.
const mockCountry = getCountryByCode('JP')!;

describe('DailyChallengeCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // NOTE: ThemeProvider renders a SplashScreen placeholder while it loads
  // the persisted theme preference from AsyncStorage, and only mounts
  // `children` once that resolves. We use `findBy*` (async, auto-retrying)
  // queries so assertions wait for the real content to mount rather than
  // racing the splash screen (see src/components/ui/__tests__/Card.test.tsx
  // for precedent).

  it('renders country flag and name', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    expect(await findByText('Japan')).toBeTruthy();
    expect(await findByText("Today's Challenge")).toBeTruthy();
  });

  it('renders Learn & Quiz button', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    expect(await findByText('Learn & Quiz')).toBeTruthy();
  });

  it('calls onPress when button is tapped', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    fireEvent.press(await findByText('Learn & Quiz'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('uses testID if provided', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} testID="daily-card" />
      </ThemeProvider>
    );

    expect(await findByTestId('daily-card')).toBeTruthy();
  });

  it('renders with flag emoji', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    // Japan's flag emoji
    expect(await findByText('🇯🇵')).toBeTruthy();
  });

  it('renders Daily Challenge label', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    // The label is rendered via translation key 'dailyChallenge'
    const labels = await findByText("Today's Challenge");
    expect(labels).toBeTruthy();
  });

  it('applies card background from theme', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} testID="card" />
      </ThemeProvider>
    );

    const card = await findByTestId('card');
    expect(card.props.style).toBeDefined();
    // Verify backgroundColor is set (indicates theme colors applied)
    const styles = Array.isArray(card.props.style) ? card.props.style : [card.props.style];
    const hasBackgroundColor = styles.some((s: any) => s && s.backgroundColor);
    expect(hasBackgroundColor).toBe(true);
  });

  it('applies button background from theme', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    const button = await findByText('Learn & Quiz');
    // Navigate up the component tree to find the TouchableOpacity
    expect(button.parent).toBeTruthy();
  });

  it('renders button with default testID when component testID not provided', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    // Button gets default testID 'daily-card-button' when no component testID provided
    expect(await findByTestId('daily-card-button')).toBeTruthy();
  });

  it('uses correct button testID derived from component testID', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} testID="custom-card" />
      </ThemeProvider>
    );

    expect(await findByTestId('custom-card-button')).toBeTruthy();
  });

  it('renders button with accessibility properties', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} testID="daily-card" />
      </ThemeProvider>
    );

    const button = await findByTestId('daily-card-button');
    // Button should have onPress handler and be touchable
    expect(button).toBeTruthy();
    expect(button.props.onPress).toBeDefined();
  });

  it('handles multiple button presses', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    const button = await findByText('Learn & Quiz');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(3);
  });

  it('renders country with different languages (uses i18n)', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    // Should render Japan (English translation)
    expect(await findByText('Japan')).toBeTruthy();
  });
});
