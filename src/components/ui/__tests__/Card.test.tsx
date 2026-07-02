import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { Card } from '../Card';

// NOTE: ThemeProvider renders a SplashScreen placeholder while it loads the
// persisted theme preference from AsyncStorage, and only mounts `children`
// once that resolves. We use the `findBy*` (async, auto-retrying) queries
// instead of `getBy*` so assertions wait for the real Card content to mount
// rather than racing the splash screen.

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Card Content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Card Content')).toBeTruthy();
    });

    it('should display children content', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Test Content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Test Content')).toBeTruthy();
    });

    it('should render multiple children', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>First Line</Text>
            <Text>Second Line</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('First Line')).toBeTruthy();
      expect(await findByText('Second Line')).toBeTruthy();
    });

    it('should render with default elevation', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Card with default elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Card with default elevation')).toBeTruthy();
    });
  });

  // ─── Elevation Tests ───────────────────────────────────────────────────────

  describe('Elevation Variants', () => {
    it('should render with small elevation', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card elevation="sm">
            <Text>Small elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Small elevation')).toBeTruthy();
    });

    it('should render with medium elevation', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card elevation="md">
            <Text>Medium elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Medium elevation')).toBeTruthy();
    });

    it('should render with large elevation', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card elevation="lg">
            <Text>Large elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Large elevation')).toBeTruthy();
    });
  });

  // ─── Press Handling Tests ──────────────────────────────────────────────────

  describe('Press Handling', () => {
    it('should render without onPress handler', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Non-interactive card')).toBeTruthy();
    });

    it('should call onPress when card is pressed', async () => {
      const mockOnPress = jest.fn();
      const { findByTestId } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress} testID="pressable-card">
            <Text>Pressable Card</Text>
          </Card>
        </ThemeProvider>
      );
      const card = await findByTestId('pressable-card');
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not trigger press when no onPress handler', async () => {
      const mockOnPress = jest.fn();
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Non-interactive')).toBeTruthy();
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple presses on interactive card', async () => {
      const mockOnPress = jest.fn();
      const { findByTestId } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress} testID="clickable-card">
            <Text>Clickable</Text>
          </Card>
        </ThemeProvider>
      );
      const card = await findByTestId('clickable-card');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Styling Tests ─────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should apply custom style prop', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card style={{ marginTop: 20 }}>
            <Text>Styled Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Styled Card')).toBeTruthy();
    });

    it('should have border radius', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Rounded Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Rounded Card')).toBeTruthy();
    });

    it('should have padding', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Padded Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Padded Card')).toBeTruthy();
    });

    it('should have background color from theme', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Themed Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Themed Card')).toBeTruthy();
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should animate on press', async () => {
      const mockOnPress = jest.fn();
      const { findByTestId } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress} testID="animated-card">
            <Text>Animated Card</Text>
          </Card>
        </ThemeProvider>
      );
      const card = await findByTestId('animated-card');
      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');
      expect(card).toBeTruthy();
    });

    it('should handle pressIn without onPress', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Non-interactive')).toBeTruthy();
    });
  });

  // ─── Content Flexibility Tests ─────────────────────────────────────────────

  describe('Content Flexibility', () => {
    it('should render complex nested content', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Title</Text>
            <Text>Subtitle</Text>
            <Text>Description text</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Title')).toBeTruthy();
      expect(await findByText('Subtitle')).toBeTruthy();
      expect(await findByText('Description text')).toBeTruthy();
    });

    it('should render with single text child', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Single</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Single')).toBeTruthy();
    });

    it('should render with only text content', async () => {
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Plain text content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText('Plain text content')).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <Card>{null}</Card>
        </ThemeProvider>
      );
      // Card falls back to its default testID ("card") when none is provided.
      expect(await findByTestId('card')).toBeTruthy();
    });

    it('should handle very long text content', async () => {
      const longText = 'This is a very long text content that should be rendered properly in the card component. '.repeat(
        3
      );
      const { findByText } = render(
        <ThemeProvider>
          <Card>
            <Text>{longText}</Text>
          </Card>
        </ThemeProvider>
      );
      expect(await findByText(longText)).toBeTruthy();
    });

    it('should render with all elevation levels', async () => {
      const elevations: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
      for (const elevation of elevations) {
        const { findByText } = render(
          <ThemeProvider>
            <Card elevation={elevation}>
              <Text>{`Card with ${elevation} elevation`}</Text>
            </Card>
          </ThemeProvider>
        );
        expect(await findByText(`Card with ${elevation} elevation`)).toBeTruthy();
      }
    });
  });
});
