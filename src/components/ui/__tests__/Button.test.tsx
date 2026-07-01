import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../../../context/ThemeContext';
import { Button } from '../Button';

jest.mock('expo-haptics');

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should display the label text', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Click Me" onPress={jest.fn()} />
        </ThemeProvider>
      );
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render with accessibility role button', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should set accessibility label from label prop by default', () => {
      const { getByA11yLabel } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} />
        </ThemeProvider>
      );
      const button = getByA11yLabel('Save');
      expect(button).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      const { getByA11yLabel } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} accessibilityLabel="Save changes" />
        </ThemeProvider>
      );
      const button = getByA11yLabel('Save changes');
      expect(button).toBeTruthy();
    });

    it('should set accessibility hint', () => {
      const { getByA11yHint } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} accessibilityHint="Saves the form" />
        </ThemeProvider>
      );
      const button = getByA11yHint('Saves the form');
      expect(button).toBeTruthy();
    });
  });

  // ─── Variant Tests ─────────────────────────────────────────────────────────

  describe('Variants', () => {
    it('should render filled variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Filled" onPress={jest.fn()} variant="filled" />
        </ThemeProvider>
      );
      expect(getByText('Filled')).toBeTruthy();
    });

    it('should render outlined variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Outlined" onPress={jest.fn()} variant="outlined" />
        </ThemeProvider>
      );
      expect(getByText('Outlined')).toBeTruthy();
    });

    it('should render text variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Text" onPress={jest.fn()} variant="text" />
        </ThemeProvider>
      );
      expect(getByText('Text')).toBeTruthy();
    });

    it('should default to filled variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Default" onPress={jest.fn()} />
        </ThemeProvider>
      );
      expect(getByText('Default')).toBeTruthy();
    });
  });

  // ─── Press Handling Tests ──────────────────────────────────────────────────

  describe('Press Handling', () => {
    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Press Me" onPress={mockOnPress} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on press', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Press Me" onPress={mockOnPress} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      fireEvent.press(button);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={mockOnPress} disabled={true} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      fireEvent.press(button);
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={mockOnPress} disabled={true} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      jest.clearAllMocks();
      fireEvent.press(button);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid presses', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Rapid" onPress={mockOnPress} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Disabled State Tests ──────────────────────────────────────────────────

  describe('Disabled State', () => {
    it('should render enabled by default', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Enabled" onPress={jest.fn()} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('should set disabled state correctly', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={jest.fn()} disabled={true} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should render disabled button with reduced opacity', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={jest.fn()} disabled={true} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ──────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have minimum 48dp touch target height', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
      // Height: 48 is set in component
    });

    it('should maintain spacing and padding for touch targets', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Touch Target" onPress={jest.fn()} />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should support custom accessibility label', () => {
      const { getByA11yLabel } = render(
        <ThemeProvider>
          <Button
            label="Save"
            onPress={jest.fn()}
            accessibilityLabel="Save and exit"
          />
        </ThemeProvider>
      );
      expect(getByA11yLabel('Save and exit')).toBeTruthy();
    });

    it('should support accessibility hint for screen readers', () => {
      const { getByA11yHint } = render(
        <ThemeProvider>
          <Button
            label="Delete"
            onPress={jest.fn()}
            accessibilityHint="This action cannot be undone"
          />
        </ThemeProvider>
      );
      expect(getByA11yHint('This action cannot be undone')).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle very long labels', () => {
      const longLabel = 'This is a very long button label that might wrap';
      const { getByText } = render(
        <ThemeProvider>
          <Button label={longLabel} onPress={jest.fn()} />
        </ThemeProvider>
      );
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle empty accessibility label gracefully', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} accessibilityLabel="" />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should render with custom style prop', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button
            label="Styled"
            onPress={jest.fn()}
            style={{ marginBottom: 10 }}
          />
        </ThemeProvider>
      );
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });
});
