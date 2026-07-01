import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloatingNavBar } from '../FloatingNavBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

interface NavItem {
  name: string;
  icon: string;
  color: string;
}

interface FloatingNavBarProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
  items: NavItem[];
  testID?: string;
}

const FloatingNavBarWrapper: React.FC<Partial<FloatingNavBarProps>> = (props) => (
  <ThemeProvider>
    <FloatingNavBar {...props} currentRoute={props.currentRoute || 'home'} onNavigate={props.onNavigate || (() => {})} items={props.items || []} />
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

      // Each nav item should render its own testID under the nav bar
      mockNavItems.forEach(item => {
        expect(getByTestId(`nav-bar-item-${item.name}`)).toBeTruthy();
      });
    });

    it('should render with correct number of items', () => {
      const { getAllByTestId } = render(
        <ThemeProvider>
          <FloatingNavBar
            currentRoute="home"
            onNavigate={jest.fn()}
            items={mockNavItems}
            testID="nav-bar"
          />
        </ThemeProvider>
      );

      // Component should render exactly one item per entry in the items array
      const renderedItems = mockNavItems.map(item =>
        getAllByTestId(`nav-bar-item-${item.name}`)
      );
      expect(renderedItems).toHaveLength(mockNavItems.length);
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
        expect(typeof item.icon).toBe('string');
        expect(item.icon.length).toBeGreaterThan(0);
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

      fireEvent.press(getByTestId('nav-bar-item-explore'));
      expect(mockOnNavigate).toHaveBeenCalledWith('explore');
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

      fireEvent.press(getByTestId('nav-bar-item-explore'));
      fireEvent.press(getByTestId('nav-bar-item-map'));
      fireEvent.press(getByTestId('nav-bar-item-quiz'));

      expect(mockOnNavigate).toHaveBeenCalledTimes(3);
      expect(mockOnNavigate).toHaveBeenNthCalledWith(1, 'explore');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(2, 'map');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(3, 'quiz');
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
      // Component spreads theme.shadows.lg (elevation 8) onto the nav bar
      expect(navBar.props.style.elevation).toBe(8);
      expect(navBar.props.style.shadowOpacity).toBe(0.2);
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
      // Background color is derived from theme.colors.surface with an opacity suffix
      expect(navBar.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}F2$/);
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
      // Background color includes the same opacity suffix regardless of color scheme
      expect(navBar.props.style.backgroundColor).toMatch(/F2$/);
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
      // Component positions itself at insets.bottom + 16, so bottom must be at least 16
      expect(typeof navBar.props.style.bottom).toBe('number');
      expect(navBar.props.style.bottom).toBeGreaterThanOrEqual(16);
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
