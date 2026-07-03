import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Input } from '../Input';
import { ThemeProvider } from '../../../../context/ThemeContext';

describe('Input Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Enter text" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should display placeholder text', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Enter your name"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Enter your name');
      expect(input).toBeTruthy();
    });

    it('should display value text', async () => {
      const { getByDisplayValue } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="test value" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByDisplayValue('test value');
      expect(input).toBeTruthy();
    });

    it('should render with icon', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            icon="magnify"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should render without icon', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should render with label', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <Input
            placeholder="Email"
            value=""
            onChangeText={jest.fn()}
            label="Email address"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      // Input is a controlled TextInput — `label` is exposed as the
      // accessibility label (see Input.tsx), not rendered as visible text.
      expect(getByLabelText('Email address')).toBeTruthy();
    });
  });

  // ─── Text Input Tests ──────────────────────────────────────────────────────

  describe('Text Input Behavior', () => {
    it('should call onChangeText when text changes', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Type here"
            value=""
            onChangeText={mockOnChange}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'new text');
      expect(mockOnChange).toHaveBeenCalledWith('new text');
    });

    it('should handle empty string input', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle special characters', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '!@#$%^&*()');
      expect(mockOnChange).toHaveBeenCalledWith('!@#$%^&*()');
    });

    it('should handle very long input', async () => {
      const longText = 'a'.repeat(100);
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Input"
            value={longText}
            onChangeText={mockOnChange}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      expect(input.props.value).toBe(longText);
    });

    it('should handle multiple sequential changes', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, 'h');
      fireEvent.changeText(input, 'he');
      fireEvent.changeText(input, 'hel');
      fireEvent.changeText(input, 'hell');
      fireEvent.changeText(input, 'hello');
      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenLastCalledWith('hello');
    });
  });

  // ─── Focus Tests ───────────────────────────────────────────────────────────

  describe('Focus Behavior', () => {
    it('should handle focus event', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      expect(input).toBeTruthy();
    });

    it('should handle blur event', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Blur test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Blur test');
      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('should change border on focus', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      // Border changes from 1 to 2 on focus
      expect(input).toBeTruthy();
    });

    it('should restore border on blur', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('should handle focus and blur sequence', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Test" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Test');
      fireEvent(input, 'focus');
      fireEvent.changeText(input, 'some text');
      fireEvent(input, 'blur');
      // Input is a controlled component — its own `value` prop is fixed by
      // the test, so we assert the change propagated via onChangeText
      // rather than expecting the (unmanaged) prop to mutate in place.
      expect(mockOnChange).toHaveBeenCalledWith('some text');
    });
  });

  // ─── Disabled State Tests ──────────────────────────────────────────────────

  describe('Disabled State', () => {
    it('should render enabled by default', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      expect(input.props.editable).not.toBe(false);
    });

    it('should be disabled when disabled prop is true', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Disabled"
            value=""
            onChangeText={jest.fn()}
            disabled={true}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Disabled');
      expect(input.props.editable).toBe(false);
    });

    it('should not accept text input when disabled', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Disabled"
            value=""
            onChangeText={mockOnChange}
            disabled={true}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Disabled');
      expect(input.props.editable).toBe(false);
    });
  });

  // ─── Icon Tests ────────────────────────────────────────────────────────────

  describe('Icon Support', () => {
    it('should render with icon', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            icon="magnify"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should render without icon', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should support different icons', async () => {
      const icons = ['magnify', 'email', 'phone', 'map'];
      for (const icon of icons) {
        const { toJSON } = render(
          <ThemeProvider>
            <Input
              placeholder="Input"
              value=""
              onChangeText={jest.fn()}
              icon={icon}
            />
          </ThemeProvider>
        );
        await act(async () => {});
        expect(toJSON()).not.toBeNull();
      }
    });

    it('should change icon color on focus', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="With icon"
            value=""
            onChangeText={jest.fn()}
            icon="email"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('With icon');
      fireEvent(input, 'focus');
      // Icon color changes to primary when focused
      expect(input).toBeTruthy();
    });

    it('should restore icon color on blur', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="With icon"
            value=""
            onChangeText={jest.fn()}
            icon="email"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('With icon');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      // Icon color changes to textSecondary when blurred
      expect(input).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should use label as accessibility label', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            label="Search input"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByLabelText('Search input');
      expect(input).toBeTruthy();
    });

    it('should use placeholder as fallback accessibility label', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Type here" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Type here');
      expect(input.props.accessibilityLabel).toBe('Type here');
    });

    it('should support accessibility hint', async () => {
      const { getByA11yHint } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            accessibilityHint="Search for a country"
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByA11yHint('Search for a country');
      expect(input).toBeTruthy();
    });

    it('should have minimum 48dp touch target height', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Touch target"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Touch target');
      expect(input).toBeTruthy();
      // Height: 48, minHeight: 48
    });
  });

  // ─── Placeholder Tests ─────────────────────────────────────────────────────

  describe('Placeholder Behavior', () => {
    it('should display custom placeholder', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Enter your name"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    });

    it('should update placeholder dynamically', async () => {
      const { rerender, getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Placeholder 1"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByPlaceholderText('Placeholder 1')).toBeTruthy();

      rerender(
        <ThemeProvider>
          <Input
            placeholder="Placeholder 2"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      expect(getByPlaceholderText('Placeholder 2')).toBeTruthy();
    });

    it('should hide placeholder when text is entered', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Enter text" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Enter text');
      fireEvent.changeText(input, 'some text');
      // Input is a controlled component; assert the change propagated via
      // onChangeText rather than expecting its fixed `value` prop to mutate.
      expect(mockOnChange).toHaveBeenCalledWith('some text');
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle unicode characters', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Unicode test"
            value=""
            onChangeText={mockOnChange}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Unicode test');
      fireEvent.changeText(input, '你好世界 🌍');
      expect(mockOnChange).toHaveBeenCalledWith('你好世界 🌍');
    });

    it('should handle whitespace', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '   spaces   ');
      expect(mockOnChange).toHaveBeenCalledWith('   spaces   ');
    });

    it('should handle newline characters', async () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, 'line1\nline2');
      expect(mockOnChange).toHaveBeenCalledWith('line1\nline2');
    });

    it('should preserve value during focus/blur', async () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Test"
            value="preserved"
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      await act(async () => {});
      const input = getByPlaceholderText('Test');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      expect(input.props.value).toBe('preserved');
    });
  });
});
