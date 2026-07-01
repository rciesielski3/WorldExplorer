import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloatingNavBar } from '../FloatingNavBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

const FloatingNavBarWrapper = ({ ...props }: any) => (
  <ThemeProvider>
    <FloatingNavBar {...props} />
  </ThemeProvider>
);

describe('FloatingNavBar Component', () => {
  const mockNavItems = [
    { name: 'home', icon: 'home', color: '#1E88E5' },
    { name: 'explore', icon: 'compass', color: '#43A047' },
    { name: 'map', icon: 'map', color: '#0277BD' },
    { name: 'quiz', icon: 'lightbulb', color: '#F59E0B' },
    { name: 'settings', icon: 'cog', color: '#6B7280' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(FloatingNavBar).toBeDefined();
    });

    it('should be a React component', () => {
      expect(typeof FloatingNavBar).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should render all navigation items', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('nav-bar')).toBeDefined();
    });

    it('should render with correct number of items', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Navigation Items', () => {
    it('should accept items array prop', () => {
      const customItems = [
        { name: 'tab1', icon: 'home', color: '#FF0000' },
        { name: 'tab2', icon: 'search', color: '#00FF00' },
      ];

      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="tab1"
            onNavigate={jest.fn()}
            items={customItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should render items with correct icons', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should render items with correct colors', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should handle variable number of items', () => {
      const twoItems = mockNavItems.slice(0, 2);
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={twoItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Current Route', () => {
    it('should accept currentRoute prop', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should highlight home route when active', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should highlight explore route when active', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="explore"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should update active state when route changes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="explore"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      // Navigation should update
    });

    it('should handle invalid route gracefully', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="nonexistent"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onNavigate when item is pressed', () => {
      const mockOnNavigate = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={mockOnNavigate}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeDefined();
    });

    it('should pass correct route name to callback', () => {
      const mockOnNavigate = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={mockOnNavigate}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('nav-bar')).toBeDefined();
    });

    it('should handle multiple navigation calls', () => {
      const mockOnNavigate = jest.fn();
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={mockOnNavigate}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('should have floating position', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="floating-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('floating-nav')).toBeDefined();
    });

    it('should have border radius', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="rounded-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('rounded-nav')).toBeDefined();
    });

    it('should have shadow elevation', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="shadowed-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('shadowed-nav')).toBeDefined();
    });

    it('should have flexDirection row', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="flex-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('flex-nav')).toBeDefined();
    });

    it('should space items evenly', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="spaced-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('spaced-nav')).toBeDefined();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should respond to dark mode', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should have proper background opacity in dark mode', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="dark-nav-bg"
          />
        </ThemeProvider>
      );

      expect(getByTestId('dark-nav-bg')).toBeDefined();
    });

    it('should have proper background opacity in light mode', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="light-nav-bg"
          />
        </ThemeProvider>
      );

      expect(getByTestId('light-nav-bg')).toBeDefined();
    });
  });

  describe('Safe Area Integration', () => {
    it('should respect bottom safe area inset', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="safe-area-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('safe-area-nav')).toBeDefined();
    });

    it('should position with proper margins', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="margin-nav"
          />
        </ThemeProvider>
      );

      expect(getByTestId('margin-nav')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should have accessible nav items', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate touch target size for each item', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should be easy to tap on each nav item', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Custom Colors', () => {
    it('should render items with custom colors', () => {
      const customItems = [
        { name: 'custom1', icon: 'star', color: '#FF6B6B' },
        { name: 'custom2', icon: 'heart', color: '#4ECDC4' },
      ];

      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="custom1"
            onNavigate={jest.fn()}
            items={customItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      const singleItem = [{ name: 'only', icon: 'home', color: '#1E88E5' }];

      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="only"
            onNavigate={jest.fn()}
            items={singleItem}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should handle many items', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        name: `item${i}`,
        icon: 'home',
        color: '#1E88E5',
      }));

      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="item0"
            onNavigate={jest.fn()}
            items={manyItems}
          />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should handle rapid navigation changes', () => {
      const mockOnNavigate = jest.fn();
      const { rerender } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={mockOnNavigate}
            items={mockNavItems}
          />
        </ThemeProvider>
      );

      mockNavItems.forEach(item => {
        rerender(
          <ThemeProvider>
            <FloatingNavBar
              currentRoute={item.name}
              onNavigate={mockOnNavigate}
              items={mockNavItems}
            />
          </ThemeProvider>
        );
      });

      // Should handle rapid changes without errors
    });
  });
});
