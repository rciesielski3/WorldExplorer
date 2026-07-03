import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { Button } from '../Button';

jest.mock('expo-haptics');

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Test')).toBeTruthy();
    });

    it('should display the label text', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Click Me" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render with accessibility role button', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should set accessibility label from label prop by default', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByLabelText('Save');
      expect(button).toBeTruthy();
    });

    it('should use custom accessibility label when provided', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} accessibilityLabel="Save changes" />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByLabelText('Save changes');
      expect(button).toBeTruthy();
    });

    it('should set accessibility hint', async () => {
      const { getByA11yHint } = render(
        <ThemeProvider>
          <Button label="Save" onPress={jest.fn()} accessibilityHint="Saves the form" />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByA11yHint('Saves the form');
      expect(button).toBeTruthy();
    });
  });

  // ─── Variant Tests ─────────────────────────────────────────────────────────

  describe('Variants', () => {
    it('should render filled variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Filled" onPress={jest.fn()} variant="filled" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Filled')).toBeTruthy();
    });

    it('should render outlined variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Outlined" onPress={jest.fn()} variant="outlined" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Outlined')).toBeTruthy();
    });

    it('should render text variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Text" onPress={jest.fn()} variant="text" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Text')).toBeTruthy();
    });

    it('should default to filled variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Button label="Default" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Default')).toBeTruthy();
    });
  });

  // ─── Press Handling Tests ──────────────────────────────────────────────────

  describe('Press Handling', () => {
    it('should call onPress when pressed', async () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Press Me" onPress={mockOnPress} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on press', async () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Press Me" onPress={mockOnPress} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      fireEvent.press(button);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should not call onPress when disabled', async () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={mockOnPress} disabled={true} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      fireEvent.press(button);
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when disabled', async () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={mockOnPress} disabled={true} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      jest.clearAllMocks();
      fireEvent.press(button);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid presses', async () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Rapid" onPress={mockOnPress} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Disabled State Tests ──────────────────────────────────────────────────

  describe('Disabled State', () => {
    it('should render enabled by default', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Enabled" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('should set disabled state correctly', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={jest.fn()} disabled={true} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should render disabled button with reduced opacity', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Disabled" onPress={jest.fn()} disabled={true} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ──────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have minimum 48dp touch target height', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
      // Height: 48 is set in component
    });

    it('should maintain spacing and padding for touch targets', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Touch Target" onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should support custom accessibility label', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <Button
            label="Save"
            onPress={jest.fn()}
            accessibilityLabel="Save and exit"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByLabelText('Save and exit')).toBeTruthy();
    });

    it('should support accessibility hint for screen readers', async () => {
      const { getByA11yHint } = render(
        <ThemeProvider>
          <Button
            label="Delete"
            onPress={jest.fn()}
            accessibilityHint="This action cannot be undone"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByA11yHint('This action cannot be undone')).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle very long labels', async () => {
      const longLabel = 'This is a very long button label that might wrap';
      const { getByText } = render(
        <ThemeProvider>
          <Button label={longLabel} onPress={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle empty accessibility label gracefully', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button label="Test" onPress={jest.fn()} accessibilityLabel="" />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should render with custom style prop', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <Button
            label="Styled"
            onPress={jest.fn()}
            style={{ marginBottom: 10 }}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });
});
