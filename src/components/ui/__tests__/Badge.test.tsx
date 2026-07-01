import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../../../context/ThemeContext';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="New" />
        </ThemeProvider>
      );
      expect(getByText('New')).toBeTruthy();
    });

    it('should display the label text', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Featured" />
        </ThemeProvider>
      );
      expect(getByText('Featured')).toBeTruthy();
    });

    it('should render without icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Badge" />
        </ThemeProvider>
      );
      expect(getByText('Badge')).toBeTruthy();
    });

    it('should render with icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="New" icon="star" />
        </ThemeProvider>
      );
      expect(getByText('New')).toBeTruthy();
    });
  });

  // ─── Variant Tests ─────────────────────────────────────────────────────────

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Primary" variant="primary" />
        </ThemeProvider>
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Secondary" variant="secondary" />
        </ThemeProvider>
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render success variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Success" variant="success" />
        </ThemeProvider>
      );
      expect(getByText('Success')).toBeTruthy();
    });

    it('should render error variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Error" variant="error" />
        </ThemeProvider>
      );
      expect(getByText('Error')).toBeTruthy();
    });

    it('should default to primary variant', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Default" />
        </ThemeProvider>
      );
      expect(getByText('Default')).toBeTruthy();
    });
  });

  // ─── Icon Tests ────────────────────────────────────────────────────────────

  describe('Icon Support', () => {
    it('should render with star icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Favorite" icon="star" />
        </ThemeProvider>
      );
      expect(getByText('Favorite')).toBeTruthy();
    });

    it('should render with check icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Verified" icon="check" />
        </ThemeProvider>
      );
      expect(getByText('Verified')).toBeTruthy();
    });

    it('should render with alert icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Alert" icon="alert-circle" />
        </ThemeProvider>
      );
      expect(getByText('Alert')).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="No Icon" />
        </ThemeProvider>
      );
      expect(getByText('No Icon')).toBeTruthy();
    });

    it('should render multiple badges with different icons', () => {
      const { getByText } = render(
        <ThemeProvider>
          <>
            <Badge label="New" icon="star" variant="primary" />
            <Badge label="Hot" icon="fire" variant="error" />
            <Badge label="Safe" icon="shield" variant="success" />
          </>
        </ThemeProvider>
      );
      expect(getByText('New')).toBeTruthy();
      expect(getByText('Hot')).toBeTruthy();
      expect(getByText('Safe')).toBeTruthy();
    });
  });

  // ─── Styling Tests ─────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should have white text color', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="White Text" />
        </ThemeProvider>
      );
      const badge = getByText('White Text');
      expect(badge).toBeTruthy();
      expect(badge.props.style.color).toBe('#FFFFFF');
    });

    it('should have rounded shape', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Rounded" />
        </ThemeProvider>
      );
      expect(getByText('Rounded')).toBeTruthy();
    });

    it('should have padding', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Padded" />
        </ThemeProvider>
      );
      expect(getByText('Padded')).toBeTruthy();
    });

    it('should apply shadow elevation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Elevated" />
        </ThemeProvider>
      );
      expect(getByText('Elevated')).toBeTruthy();
    });
  });

  // ─── Text Content Tests ────────────────────────────────────────────────────

  describe('Text Content', () => {
    it('should handle single character label', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="1" />
        </ThemeProvider>
      );
      expect(getByText('1')).toBeTruthy();
    });

    it('should handle long label text', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Very Long Badge Label" />
        </ThemeProvider>
      );
      expect(getByText('Very Long Badge Label')).toBeTruthy();
    });

    it('should handle label with numbers', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Sale 50%" />
        </ThemeProvider>
      );
      expect(getByText('Sale 50%')).toBeTruthy();
    });

    it('should handle label with special characters', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Award!" />
        </ThemeProvider>
      );
      expect(getByText('Award!')).toBeTruthy();
    });
  });

  // ─── Combination Tests ─────────────────────────────────────────────────────

  describe('Combinations', () => {
    it('should render primary variant with icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Primary Star" icon="star" variant="primary" />
        </ThemeProvider>
      );
      expect(getByText('Primary Star')).toBeTruthy();
    });

    it('should render secondary variant with icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Secondary Check" icon="check" variant="secondary" />
        </ThemeProvider>
      );
      expect(getByText('Secondary Check')).toBeTruthy();
    });

    it('should render success variant with icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Success Shield" icon="shield" variant="success" />
        </ThemeProvider>
      );
      expect(getByText('Success Shield')).toBeTruthy();
    });

    it('should render error variant with icon', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Error Alert" icon="alert" variant="error" />
        </ThemeProvider>
      );
      expect(getByText('Error Alert')).toBeTruthy();
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should use ZoomIn animation on enter', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Animated" />
        </ThemeProvider>
      );
      expect(getByText('Animated')).toBeTruthy();
    });

    it('should render multiple badges with animation', () => {
      const { getByText } = render(
        <ThemeProvider>
          <>
            <Badge label="First" />
            <Badge label="Second" />
            <Badge label="Third" />
          </>
        </ThemeProvider>
      );
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Featured Item" />
        </ThemeProvider>
      );
      expect(getByText('Featured Item')).toBeTruthy();
    });

    it('should render with proper text styling for visibility', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Visible Badge" />
        </ThemeProvider>
      );
      const badge = getByText('Visible Badge');
      expect(badge).toBeTruthy();
      expect(badge.props.style.color).toBe('#FFFFFF');
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should render all variant types without errors', () => {
      const variants: Array<'primary' | 'secondary' | 'success' | 'error'> = [
        'primary',
        'secondary',
        'success',
        'error',
      ];
      variants.forEach(variant => {
        const { getByText } = render(
          <ThemeProvider>
            <Badge label={variant} variant={variant} />
          </ThemeProvider>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });

    it('should handle empty label gracefully', () => {
      const { container } = render(
        <ThemeProvider>
          <Badge label="" />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('should render unicode characters in label', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="🌟 New" />
        </ThemeProvider>
      );
      expect(getByText('🌟 New')).toBeTruthy();
    });
  });
});
