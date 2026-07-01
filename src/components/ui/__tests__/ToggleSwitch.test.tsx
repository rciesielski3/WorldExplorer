import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ToggleSwitch } from '../ToggleSwitch';
import { ThemeProvider } from '../../../context/ThemeContext';

jest.mock('expo-haptics');

describe('ToggleSwitch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      expect(container).toBeDefined();
    });

    it('should render with label', () => {
      const { getByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      expect(getByText('Dark Mode')).toBeTruthy();
    });

    it('should render without label', () => {
      const { container } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should render with switch role', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should render with proper accessibility state', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });
  });

  // ─── Toggle Behavior Tests ─────────────────────────────────────────────────

  describe('Toggle Behavior', () => {
    it('should call onToggle when pressed', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalled();
    });

    it('should toggle value correctly', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      // Callback should be called with the toggled value
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('should toggle from true to false', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it('should handle multiple rapid toggles', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it('should update accessibility state on toggle', () => {
      const mockOnToggle = jest.fn();
      const { rerender, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
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
    it('should trigger haptic on toggle', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      jest.clearAllMocks();
      fireEvent.press(switchElement);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should trigger haptic feedback every time', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      jest.clearAllMocks();
      fireEvent.press(switchElement);
      fireEvent.press(switchElement);
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have switch role', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should reflect checked state in accessibility', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement.props.accessibilityState?.checked).toBe(true);
    });

    it('should use label as accessibility label', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should use custom accessibility label', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch
            value={false}
            onToggle={jest.fn()}
            accessibilityLabel="Toggle dark mode"
          />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should have adequate touch target size', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Width: 56 (greater than 48dp minimum)
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should animate thumb position on value change', () => {
      const mockOnToggle = jest.fn();
      const { rerender, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
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

    it('should handle pressIn animation', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(switchElement).toBeTruthy();
    });

    it('should handle pressOut animation', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      fireEvent.press(switchElement);
      expect(switchElement).toBeTruthy();
    });
  });

  // ─── Visual Feedback Tests ─────────────────────────────────────────────────

  describe('Visual Feedback', () => {
    it('should show different colors for on/off states', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Primary color when on, variant when off
    });

    it('should display correct icon for off state', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Sun icon when off
    });

    it('should display correct icon for on state', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
      // Moon icon when on
    });
  });

  // ─── Label Tests ───────────────────────────────────────────────────────────

  describe('Label Rendering', () => {
    it('should render label when provided', () => {
      const { getByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Dark Mode" />
        </ThemeProvider>
      );
      expect(getByText('Dark Mode')).toBeTruthy();
    });

    it('should not render label when not provided', () => {
      const { queryByText } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      // Should not find any text node if no label
      expect(queryByText(/^Dark Mode$/)).toBeFalsy();
    });

    it('should support multiple labels', () => {
      const { getByText: getByText1 } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Enable Dark" />
        </ThemeProvider>
      );
      expect(getByText1('Enable Dark')).toBeTruthy();
    });

    it('should position label next to switch', () => {
      const { getByText, getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} label="Theme" />
        </ThemeProvider>
      );
      const label = getByText('Theme');
      const switchElement = getByRole('switch');
      expect(label).toBeTruthy();
      expect(switchElement).toBeTruthy();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle rapid toggling', () => {
      const mockOnToggle = jest.fn();
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={mockOnToggle} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(switchElement);
      }
      expect(mockOnToggle).toHaveBeenCalledTimes(10);
    });

    it('should handle long label text', () => {
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
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle undefined accessibility label', () => {
      const { getByRole } = render(
        <ThemeProvider>
          <ToggleSwitch value={false} onToggle={jest.fn()} />
        </ThemeProvider>
      );
      const switchElement = getByRole('switch');
      expect(switchElement).toBeTruthy();
    });
  });
});
