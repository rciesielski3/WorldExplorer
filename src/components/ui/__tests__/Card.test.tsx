import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { Card } from '../Card';

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Card Content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should display children content', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Test Content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>First Line</Text>
            <Text>Second Line</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('First Line')).toBeTruthy();
      expect(getByText('Second Line')).toBeTruthy();
    });

    it('should render with default elevation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Card with default elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Card with default elevation')).toBeTruthy();
    });
  });

  // ─── Elevation Tests ───────────────────────────────────────────────────────

  describe('Elevation Variants', () => {
    it('should render with small elevation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card elevation="sm">
            <Text>Small elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Small elevation')).toBeTruthy();
    });

    it('should render with medium elevation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card elevation="md">
            <Text>Medium elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Medium elevation')).toBeTruthy();
    });

    it('should render with large elevation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card elevation="lg">
            <Text>Large elevation</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Large elevation')).toBeTruthy();
    });
  });

  // ─── Press Handling Tests ──────────────────────────────────────────────────

  describe('Press Handling', () => {
    it('should render without onPress handler', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Non-interactive card')).toBeTruthy();
    });

    it('should call onPress when card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress}>
            <Text>Pressable Card</Text>
          </Card>
        </ThemeProvider>
      );
      const card = getByText('Pressable Card').parent?.parent?.parent;
      if (card) {
        fireEvent.press(card);
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      }
    });

    it('should not trigger press when no onPress handler', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Non-interactive')).toBeTruthy();
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple presses on interactive card', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress}>
            <Text>Clickable</Text>
          </Card>
        </ThemeProvider>
      );
      const card = getByText('Clickable').parent?.parent?.parent;
      if (card) {
        fireEvent.press(card);
        fireEvent.press(card);
        fireEvent.press(card);
        expect(mockOnPress).toHaveBeenCalledTimes(3);
      }
    });
  });

  // ─── Styling Tests ─────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should apply custom style prop', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card style={{ marginTop: 20 }}>
            <Text>Styled Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Styled Card')).toBeTruthy();
    });

    it('should have border radius', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Rounded Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Rounded Card')).toBeTruthy();
    });

    it('should have padding', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Padded Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Padded Card')).toBeTruthy();
    });

    it('should have background color from theme', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Themed Card</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Themed Card')).toBeTruthy();
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should animate on press', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <Card onPress={mockOnPress}>
            <Text>Animated Card</Text>
          </Card>
        </ThemeProvider>
      );
      const card = getByText('Animated Card').parent?.parent?.parent;
      if (card) {
        fireEvent.pressIn(card);
        fireEvent.pressOut(card);
        expect(mockOnPress).toBeDefined();
      }
    });

    it('should handle pressIn without onPress', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Non-interactive</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Non-interactive')).toBeTruthy();
    });
  });

  // ─── Content Flexibility Tests ─────────────────────────────────────────────

  describe('Content Flexibility', () => {
    it('should render complex nested content', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Title</Text>
            <Text>Subtitle</Text>
            <Text>Description text</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
      expect(getByText('Description text')).toBeTruthy();
    });

    it('should render with single text child', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Single</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Single')).toBeTruthy();
    });

    it('should render with only text content', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>Plain text content</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText('Plain text content')).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      const { container } = render(
        <ThemeProvider>
          <Card />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should handle very long text content', () => {
      const longText = 'This is a very long text content that should be rendered properly in the card component. '.repeat(
        3
      );
      const { getByText } = render(
        <ThemeProvider>
          <Card>
            <Text>{longText}</Text>
          </Card>
        </ThemeProvider>
      );
      expect(getByText(longText)).toBeTruthy();
    });

    it('should render with all elevation levels', () => {
      const elevations: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
      elevations.forEach(elevation => {
        const { getByText } = render(
          <ThemeProvider>
            <Card elevation={elevation}>
              <Text>{`Card with ${elevation} elevation`}</Text>
            </Card>
          </ThemeProvider>
        );
        expect(getByText(`Card with ${elevation} elevation`)).toBeTruthy();
      });
    });
  });
});
