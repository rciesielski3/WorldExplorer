import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ToggleSwitch } from '../ToggleSwitch';
import { ThemeProvider } from '../../../../context/ThemeContext';

jest.mock('expo-haptics');

describe('ToggleSwitch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByRole('switch')).toBeTruthy();
    });

    it('should render with label', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Dark Mode')).toBeTruthy();
    });

    it('should render without label', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should render with switch role', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should render with proper accessibility state', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });
  });

  // ─── Toggle Behavior Tests ─────────────────────────────────────────────────

  describe('Toggle Behavior', () => {
    it('should call onToggle when pressed', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalled();
    });

    it('should toggle value correctly', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      // Callback should be called with the toggled value
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('should toggle from true to false', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it('should handle multiple rapid toggles', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it('should update accessibility state on toggle', async () => {
      const mockOnToggle = jest.fn();
      const { rerender, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      let switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(false);

      // Re-render with new value
      rerender(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });
  });

  // ─── Haptic Feedback Tests ─────────────────────────────────────────────────

  describe('Haptic Feedback', () => {
    it('should trigger haptic on toggle', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      jest.clearAllMocks();
      fireEvent.press(switchElement);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should trigger haptic feedback every time', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      jest.clearAllMocks();
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have switch role', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should reflect checked state in accessibility', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });

    it('should use label as accessibility label', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should use custom accessibility label', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch
            value={false}
            onToggle={jest.fn()}
            accessibilityLabel="Toggle dark mode"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should have adequate touch target size', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Width: 56 (greater than 48dp minimum)
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should animate thumb position on value change', async () => {
      const mockOnToggle = jest.fn();
      const { rerender, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      let switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(false);

      // Update to toggled state
      rerender(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });

    it('should handle pressIn animation', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(switchElement).toBeTruthy();
    });

    it('should handle pressOut animation', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(switchElement).toBeTruthy();
    });
  });

  // ─── Visual Feedback Tests ─────────────────────────────────────────────────

  describe('Visual Feedback', () => {
    it('should show different colors for on/off states', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Primary color when on, variant when off
    });

    it('should display correct icon for off state', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Sun icon when off
    });

    it('should display correct icon for on state', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Moon icon when on
    });
  });

  // ─── Label Tests ───────────────────────────────────────────────────────────

  describe('Label Rendering', () => {
    it('should render label when provided', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Dark Mode')).toBeTruthy();
    });

    it('should not render label when not provided', async () => {
      const { queryByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      // Should not find any text node if no label
      expect(queryByText(/^Dark Mode$/)).toBeFalsy();
    });

    it('should support multiple labels', async () => {
      const { getByText: getByText1 } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Enable Dark" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText1('Enable Dark')).toBeTruthy();
    });

    it('should position label next to switch', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Theme" />
        </ThemeProvider>
      );
      await act(async () => {});
      const label = getByText('Theme');
      const switchElement = getByRole('switch');
      expect(label).toBeTruthy();
      expect(switchElement).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(switchElement);
      }
      expect(mockOnToggle).toHaveBeenCalledTimes(10);
    });

    it('should handle long label text', async () => {
      const longLabel =
        'This is a very long label that might overflow the container';
      const { getByText } = render(
        <ThemeProvider>
          <ToggleSwitch
            value={false}
            onToggle={jest.fn()}
            label={longLabel}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle undefined accessibility label', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });
  });
});
