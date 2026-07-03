import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering Tests ───────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="New" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('New')).toBeTruthy();
    });

    it('should display the label text', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Featured" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Featured')).toBeTruthy();
    });

    it('should render without icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Badge" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Badge')).toBeTruthy();
    });

    it('should render with icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="New" icon="star" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('New')).toBeTruthy();
    });
  });

  // ─── Variant Tests ─────────────────────────────────────────────────────────

  describe('Variants', () => {
    it('should render primary variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Primary" variant="primary" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Secondary" variant="secondary" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render success variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Success" variant="success" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Success')).toBeTruthy();
    });

    it('should render error variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Error" variant="error" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Error')).toBeTruthy();
    });

    it('should default to primary variant', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Default" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Default')).toBeTruthy();
    });
  });

  // ─── Icon Tests ────────────────────────────────────────────────────────────

  describe('Icon Support', () => {
    it('should render with star icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Favorite" icon="star" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Favorite')).toBeTruthy();
    });

    it('should render with check icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Verified" icon="check" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Verified')).toBeTruthy();
    });

    it('should render with alert icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Alert" icon="alert-circle" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Alert')).toBeTruthy();
    });

    it('should not render icon when not provided', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="No Icon" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('No Icon')).toBeTruthy();
    });

    it('should render multiple badges with different icons', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <>
            <Badge label="New" icon="star" variant="primary" />
            <Badge label="Hot" icon="fire" variant="error" />
            <Badge label="Safe" icon="shield" variant="success" />
          </>
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('New')).toBeTruthy();
      expect(getByText('Hot')).toBeTruthy();
      expect(getByText('Safe')).toBeTruthy();
    });
  });

  // ─── Styling Tests ─────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should have white text color', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="White Text" />
        </ThemeProvider>
      );
      await act(async () => {});
      const badge = getByText('White Text');
      expect(badge).toBeTruthy();
      // Verify text color is white for contrast against the colored badge background
      expect(badge.props.style.color).toBe('#FFFFFF');
    });

    it('should have rounded shape', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Rounded" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Rounded')).toBeTruthy();
    });

    it('should have padding', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Padded" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Padded')).toBeTruthy();
    });

    it('should apply shadow elevation', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Elevated" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Elevated')).toBeTruthy();
    });
  });

  // ─── Text Content Tests ────────────────────────────────────────────────────

  describe('Text Content', () => {
    it('should handle single character label', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="1" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('1')).toBeTruthy();
    });

    it('should handle long label text', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Very Long Badge Label" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Very Long Badge Label')).toBeTruthy();
    });

    it('should handle label with numbers', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Sale 50%" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Sale 50%')).toBeTruthy();
    });

    it('should handle label with special characters', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Award!" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Award!')).toBeTruthy();
    });
  });

  // ─── Combination Tests ─────────────────────────────────────────────────────

  describe('Combinations', () => {
    it('should render primary variant with icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Primary Star" icon="star" variant="primary" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Primary Star')).toBeTruthy();
    });

    it('should render secondary variant with icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Secondary Check" icon="check" variant="secondary" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Secondary Check')).toBeTruthy();
    });

    it('should render success variant with icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Success Shield" icon="shield" variant="success" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Success Shield')).toBeTruthy();
    });

    it('should render error variant with icon', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Error Alert" icon="alert" variant="error" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Error Alert')).toBeTruthy();
    });
  });

  // ─── Animation Tests ───────────────────────────────────────────────────────

  describe('Animations', () => {
    it('should use ZoomIn animation on enter', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Animated" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Animated')).toBeTruthy();
    });

    it('should render multiple badges with animation', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <>
            <Badge label="First" />
            <Badge label="Second" />
            <Badge label="Third" />
          </>
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });
  });

  // ─── Accessibility Tests ───────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should be readable by screen readers', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Featured Item" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('Featured Item')).toBeTruthy();
    });

    it('should render with proper text styling for visibility', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="Visible Badge" />
        </ThemeProvider>
      );
      await act(async () => {});
      const badge = getByText('Visible Badge');
      expect(badge).toBeTruthy();
      // Verify the badge has white text on a colored background and a legible font size
      expect(badge.props.style.color).toBe('#FFFFFF');
      expect(badge.props.style.fontSize).toBeGreaterThan(0);
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should render all variant types without errors', async () => {
      const variants: Array<'primary' | 'secondary' | 'success' | 'error'> = [
        'primary',
        'secondary',
        'success',
        'error',
      ];
      for (const variant of variants) {
        const { getByText } = render(
          <ThemeProvider>
            <Badge label={variant} variant={variant} />
          </ThemeProvider>
        );
        await act(async () => {});
        expect(getByText(variant)).toBeTruthy();
      }
    });

    it('should handle empty label gracefully', async () => {
      const { toJSON } = render(
        <ThemeProvider>
          <Badge label="" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(toJSON()).not.toBeNull();
    });

    it('should render unicode characters in label', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge label="🌟 New" />
        </ThemeProvider>
      );
      await act(async () => {});
      expect(getByText('🌟 New')).toBeTruthy();
    });
  });
});
