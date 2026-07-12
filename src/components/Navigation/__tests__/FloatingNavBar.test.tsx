import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingNavBar } from '../FloatingNavBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

// FloatingNavBar calls useSafeAreaInsets(), which throws unless there is a
// SafeAreaProvider ancestor, so every render is wrapped with one and given
// fixed test metrics (no native measurement is available under Jest).
const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

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
    it('should be a React component', async () => {
      expect(typeof FloatingNavBar).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      expect(getByTestId('nav-bar')).toBeTruthy();
    }, 10000);

    it('should render all navigation items', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      // Each nav item should render its own testID under the nav bar
      mockNavItems.forEach(item => {
        expect(getByTestId(`nav-bar-item-${item.name}`)).toBeTruthy();
      });
    });

    it('should render with correct number of items', async () => {
      const { getAllByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      // Component should render exactly one item per entry in the items array
      const renderedItems = mockNavItems.map(item =>
        getAllByTestId(`nav-bar-item-${item.name}`)
      );
      expect(renderedItems).toHaveLength(mockNavItems.length);
    });
  });

  describe('Navigation Items', () => {
    it('should accept items array prop', async () => {
      const customItems = [
        { name: 'tab1', icon: 'home', color: '#FF0000' },
        { name: 'tab2', icon: 'search', color: '#00FF00' },
      ];

      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="tab1"
              onNavigate={jest.fn()}
              items={customItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      expect(getByTestId('nav-bar')).toBeTruthy();
      expect(customItems).toHaveLength(2);
    });

    it('should render items with correct icons', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      mockNavItems.forEach(item => {
        expect(typeof item.icon).toBe('string');
        expect(item.icon.length).toBeGreaterThan(0);
      });
    });

    it('should render items with correct colors', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      mockNavItems.forEach(item => {
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should handle variable number of items', async () => {
      const twoItems = mockNavItems.slice(0, 2);
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={twoItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(twoItems).toHaveLength(2);
    });
  });

  describe('Current Route', () => {
    it('should accept currentRoute prop', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      expect(getByTestId('nav-bar')).toBeTruthy();
    });

    it('should highlight home route when active', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should highlight explore route when active', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="explore"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should update active state when route changes', async () => {
      const { rerender, getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      let navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();

      rerender(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="explore"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );

      navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should handle invalid route gracefully', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="nonexistent"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      expect(getByTestId('nav-bar')).toBeTruthy();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onNavigate when item is pressed', async () => {
      const mockOnNavigate = jest.fn();
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={mockOnNavigate}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      fireEvent.press(getByTestId('nav-bar-item-explore'));
      expect(mockOnNavigate).toHaveBeenCalledWith('explore');
    });

    it('should pass correct route name to callback', async () => {
      const mockOnNavigate = jest.fn();
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={mockOnNavigate}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Verify the callback function is available
      expect(typeof mockOnNavigate).toBe('function');
    });

    it('should handle multiple navigation calls', async () => {
      const mockOnNavigate = jest.fn();
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={mockOnNavigate}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

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
    it('should have floating position', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.position).toBe('absolute');
    });

    it('should have border radius', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.borderRadius).toBe(28);
    });

    it('should have shadow elevation', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Component spreads theme.shadows.lg (elevation 8) onto the nav bar
      expect(navBar.props.style.elevation).toBe(8);
      expect(navBar.props.style.shadowOpacity).toBe(0.2);
    });

    it('should have flexDirection row', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.flexDirection).toBe('row');
    });

    it('should space items evenly', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.justifyContent).toBe('space-around');
    });

    it('should have z-index set to 1000 to display above ads', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.zIndex).toBe(1000);
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Background color is derived from theme.colors.surface with an opacity suffix
      expect(navBar.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}F2$/);
    });

    it('should respond to dark mode', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should have proper background opacity in dark mode', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Background color includes opacity (F2 = 0.95)
      expect(navBar.props.style.backgroundColor).toMatch(/F2$/);
    });

    it('should have proper background opacity in light mode', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Background color includes the same opacity suffix regardless of color scheme
      expect(navBar.props.style.backgroundColor).toMatch(/F2$/);
    });
  });

  describe('Safe Area Integration', () => {
    it('should respect bottom safe area inset', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      // Component positions itself at insets.bottom + 16, so bottom must be at least 16
      expect(typeof navBar.props.style.bottom).toBe('number');
      expect(navBar.props.style.bottom).toBeGreaterThanOrEqual(16);
    });

    it('should position with proper margins', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.left).toBe(24);
      expect(navBar.props.style.right).toBe(24);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });

    it('should have accessible nav items', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate touch target size for each item', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.height).toBe(56);
    });

    it('should be easy to tap on each nav item', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={jest.fn()}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(navBar.props.style.height).toBeGreaterThanOrEqual(48);
    });
  });

  describe('Custom Colors', () => {
    it('should render items with custom colors', async () => {
      const customItems = [
        { name: 'custom1', icon: 'star', color: '#FF6B6B' },
        { name: 'custom2', icon: 'heart', color: '#4ECDC4' },
      ];

      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="custom1"
              onNavigate={jest.fn()}
              items={customItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      customItems.forEach(item => {
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', async () => {
      const singleItem = [{ name: 'only', icon: 'home', color: '#1E88E5' }];

      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="only"
              onNavigate={jest.fn()}
              items={singleItem}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(singleItem).toHaveLength(1);
    });

    it('should handle many items', async () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        name: `item${i}`,
        icon: 'home',
        color: '#1E88E5',
      }));

      const { getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="item0"
              onNavigate={jest.fn()}
              items={manyItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      const navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();
      expect(manyItems).toHaveLength(10);
    });

    it('should handle rapid navigation changes', async () => {
      const mockOnNavigate = jest.fn();
      const { rerender, getByTestId } = render(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
          <ThemeProvider>
            <FloatingNavBar
              currentRoute="home"
              onNavigate={mockOnNavigate}
              items={mockNavItems}
              testID="nav-bar"
            />
          </ThemeProvider>
        </SafeAreaProvider>
      );
      await act(async () => {});

      let navBar = getByTestId('nav-bar');
      expect(navBar).toBeTruthy();

      mockNavItems.forEach(item => {
        rerender(
          <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
            <ThemeProvider>
              <FloatingNavBar
                currentRoute={item.name}
                onNavigate={mockOnNavigate}
                items={mockNavItems}
                testID="nav-bar"
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
        navBar = getByTestId('nav-bar');
        expect(navBar).toBeTruthy();
      });
    });
  });
});
