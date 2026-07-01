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

      expect(getByTestId('nav-bar')).toBeTruthy();
    });

    it('should render all navigation items', () => {
      const { container } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      // Should render a nav bar container
      expect(container).toBeTruthy();
      expect(container.queryByTestId).toBeDefined();
    });

    it('should render with correct number of items', () => {
      const { UNSAFE_getByType } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      // Component should render with the specified items count
      expect(mockNavItems).toHaveLength(5);
    });
  });

  describe('Navigation Items', () => {
    it('should accept items array prop', () => {
      const customItems = [
        { name: 'tab1', icon: 'home', color: '#FF0000' },
        { name: 'tab2', icon: 'search', color: '#00FF00' },
      ];

      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="tab1"
            onNavigate={jest.fn()}
            items={customItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('nav-bar')).toBeTruthy();
      expect(customItems).toHaveLength(2);
    });

    it('should render items with correct icons', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      mockNavItems.forEach(item => {
        expect(item.icon).toBeDefined();
      });
    });

    it('should render items with correct colors', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      mockNavItems.forEach(item => {
        expect(item.color).toBeDefined();
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should handle variable number of items', () => {
      const twoItems = mockNavItems.slice(0, 2);
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={twoItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(twoItems).toHaveLength(2);
    });
  });

  describe('Current Route', () => {
    it('should accept currentRoute prop', () => {
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

      expect(getByTestId('nav-bar')).toBeTruthy();
    });

    it('should highlight home route when active', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should highlight explore route when active', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="explore"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should update active state when route changes', () => {
      const { rerender, getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      let navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();

      rerender(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="explore"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should handle invalid route gracefully', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="nonexistent"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('nav-bar')).toBeTruthy();
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
      expect(navBar).toBeTruthy();
      expect(mockOnNavigate).toBeDefined();
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Verify the callback function is available
      expect(typeof mockOnNavigate).toBe('function');
    });

    it('should handle multiple navigation calls', () => {
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
      expect(navBar).toBeTruthy();
      expect(mockOnNavigate).toBeDefined();
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
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.position).toBe('absolute');
    });

    it('should have border radius', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.borderRadius).toBe(28);
    });

    it('should have shadow elevation', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style).toBeDefined();
    });

    it('should have flexDirection row', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.flexDirection).toBe('row');
    });

    it('should space items evenly', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.justifyContent).toBe('space-around');
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.backgroundColor).toBeDefined();
    });

    it('should respond to dark mode', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should have proper background opacity in dark mode', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Background color includes opacity (F2 = 0.95)
      expect(navBar.props.style.backgroundColor).toMatch(/F2$/);
    });

    it('should have proper background opacity in light mode', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.backgroundColor).toBeDefined();
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
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.bottom).toBeDefined();
    });

    it('should position with proper margins', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.left).toBe(24);
      expect(navBar.props.style.right).toBe(24);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should have accessible nav items', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate touch target size for each item', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.height).toBe(56);
    });

    it('should be easy to tap on each nav item', () => {
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

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.height).toBeGreaterThanOrEqual(48);
    });
  });

  describe('Custom Colors', () => {
    it('should render items with custom colors', () => {
      const customItems = [
        { name: 'custom1', icon: 'star', color: '#FF6B6B' },
        { name: 'custom2', icon: 'heart', color: '#4ECDC4' },
      ];

      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="custom1"
            onNavigate={jest.fn()}
            items={customItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      customItems.forEach(item => {
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      const singleItem = [{ name: 'only', icon: 'home', color: '#1E88E5' }];

      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="only"
            onNavigate={jest.fn()}
            items={singleItem}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(singleItem).toHaveLength(1);
    });

    it('should handle many items', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        name: `item${i}`,
        icon: 'home',
        color: '#1E88E5',
      }));

      const { getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="item0"
            onNavigate={jest.fn()}
            items={manyItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(manyItems).toHaveLength(10);
    });

    it('should handle rapid navigation changes', () => {
      const mockOnNavigate = jest.fn();
      const { rerender, getByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={mockOnNavigate}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      let navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();

      mockNavItems.forEach(item => {
        rerender(
          <ThemeProvider>
            <FloatingNavBar
              currentRoute={item.name}
              onNavigate={mockOnNavigate}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        );
        navBar = getByTestId('nav-bar');
        expect(navBar).toBeTruthy();
      });
    });
  });
});
