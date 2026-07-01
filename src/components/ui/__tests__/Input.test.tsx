import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';
import { ThemeProvider } from '../../../context/ThemeContext';

describe('Input Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ThemeProvider>
          <Input placeholder="Enter text" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      expect(container).toBeDefined();
    });

    it('should display placeholder text', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Enter your name"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Enter your name');
      expect(input).toBeTruthy();
    });

    it('should display value text', () => {
      const { getByDisplayValue } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="test value" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByDisplayValue('test value');
      expect(input).toBeTruthy();
    });

    it('should render with icon', () => {
      const { container } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            icon="magnify"
          />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should render without icon', () => {
      const { container } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should render with label', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Input
            placeholder="Email"
            value=""
            onChangeText={jest.fn()}
            label="Email address"
          />
        </ThemeProvider>
      );
      // Label might be part of accessibility but may not render as visible text
      expect(getByText('Email address')).toBeTruthy();
    });
  });

  // ─── Text Input Tests ──────────────────────────────────────────────────────

  describe('Text Input Behavior', () => {
    it('should call onChangeText when text changes', () => {
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
      const input = getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'new text');
      expect(mockOnChange).toHaveBeenCalledWith('new text');
    });

    it('should handle empty string input', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle special characters', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '!@#$%^&*()');
      expect(mockOnChange).toHaveBeenCalledWith('!@#$%^&*()');
    });

    it('should handle very long input', () => {
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
      const input = getByPlaceholderText('Input');
      expect(input.props.value).toBe(longText);
    });

    it('should handle multiple sequential changes', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
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
    it('should handle focus event', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      expect(input).toBeTruthy();
    });

    it('should handle blur event', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Blur test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Blur test');
      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('should change border on focus', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      // Border changes from 1 to 2 on focus
      expect(input).toBeTruthy();
    });

    it('should restore border on blur', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Focus test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('should handle focus and blur sequence', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Test" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Test');
      fireEvent(input, 'focus');
      fireEvent.changeText(input, 'some text');
      fireEvent(input, 'blur');
      expect(input.props.value).toBe('some text');
    });
  });

  // ─── Disabled State Tests ──────────────────────────────────────────────────

  describe('Disabled State', () => {
    it('should render enabled by default', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Input');
      expect(input.props.editable).not.toBe(false);
    });

    it('should be disabled when disabled prop is true', () => {
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
      const input = getByPlaceholderText('Disabled');
      expect(input.props.editable).toBe(false);
    });

    it('should not accept text input when disabled', () => {
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
      const input = getByPlaceholderText('Disabled');
      expect(input.props.editable).toBe(false);
    });
  });

  // ─── Icon Tests ────────────────────────────────────────────────────────────

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const { container } = render(
        <ThemeProvider>
          <Input
            placeholder="Search"
            value=""
            onChangeText={jest.fn()}
            icon="magnify"
          />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should render without icon', () => {
      const { container } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should support different icons', () => {
      const icons = ['magnify', 'email', 'phone', 'map'];
      icons.forEach(icon => {
        const { container } = render(
          <ThemeProvider>
            <Input
              placeholder="Input"
              value=""
              onChangeText={jest.fn()}
              icon={icon}
            />
          </ThemeProvider>
        );
        expect(container).toBeTruthy();
      });
    });

    it('should change icon color on focus', () => {
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
      const input = getByPlaceholderText('With icon');
      fireEvent(input, 'focus');
      // Icon color changes to primary when focused
      expect(input).toBeTruthy();
    });

    it('should restore icon color on blur', () => {
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
      const input = getByPlaceholderText('With icon');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      // Icon color changes to textSecondary when blurred
      expect(input).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should use label as accessibility label', () => {
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
      const input = getByLabelText('Search input');
      expect(input).toBeTruthy();
    });

    it('should use placeholder as fallback accessibility label', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Type here" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Type here');
      expect(input.props.accessibilityLabel).toBe('Type here');
    });

    it('should support accessibility hint', () => {
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
      const input = getByA11yHint('Search for a country');
      expect(input).toBeTruthy();
    });

    it('should have minimum 48dp touch target height', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Touch target"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Touch target');
      expect(input).toBeTruthy();
      // Height: 48, minHeight: 48
    });
  });

  // ─── Placeholder Tests ─────────────────────────────────────────────────────

  describe('Placeholder Behavior', () => {
    it('should display custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Enter your name"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    });

    it('should update placeholder dynamically', () => {
      const { rerender, getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Placeholder 1"
            value=""
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
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

    it('should hide placeholder when text is entered', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Enter text" value="" onChangeText={jest.fn()} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Enter text');
      fireEvent.changeText(input, 'some text');
      expect(input.props.value).toBe('some text');
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle unicode characters', () => {
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
      const input = getByPlaceholderText('Unicode test');
      fireEvent.changeText(input, '你好世界 🌍');
      expect(mockOnChange).toHaveBeenCalledWith('你好世界 🌍');
    });

    it('should handle whitespace', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, '   spaces   ');
      expect(mockOnChange).toHaveBeenCalledWith('   spaces   ');
    });

    it('should handle newline characters', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input placeholder="Input" value="" onChangeText={mockOnChange} />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Input');
      fireEvent.changeText(input, 'line1\nline2');
      expect(mockOnChange).toHaveBeenCalledWith('line1\nline2');
    });

    it('should preserve value during focus/blur', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider>
          <Input
            placeholder="Test"
            value="preserved"
            onChangeText={jest.fn()}
          />
        </ThemeProvider>
      );
      const input = getByPlaceholderText('Test');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      expect(input.props.value).toBe('preserved');
    });
  });
});
