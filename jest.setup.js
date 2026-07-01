// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  return {
    __esModule: true,
    default: 'MockedMaterialCommunityIcons',
    createIconSet: jest.fn(),
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  return {
    __esModule: true,
    default: 'MockedIonicons',
  };
});

// Mock react-native useColorScheme (without touching react-native itself)
const { useColorScheme: originalUseColorScheme } = jest.requireActual('react-native');
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useColorScheme: jest.fn(() => 'light'),
  };
});

// Mock react-native-reanimated - use actual RN components
jest.mock('react-native-reanimated', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: actualReactNative.View,
      Text: actualReactNative.Text,
      ScrollView: actualReactNative.ScrollView,
      useAnimatedStyle: jest.fn(() => ({})),
      useSharedValue: jest.fn((value) => ({ value })),
      withSpring: jest.fn((value) => value),
      withTiming: jest.fn((value) => value),
      ZoomIn: {
        springify: jest.fn(() => ({})),
      },
      FadeIn: {
        duration: jest.fn(() => ({})),
      },
      FadeOut: {
        duration: jest.fn(() => ({})),
      },
      runOnJS: jest.fn((fn) => fn),
      runOnUIImmediately: jest.fn((fn) => fn),
      createAnimatedComponent: jest.fn((Component) => Component),
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((value) => ({ value })),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    View: actualReactNative.View,
    Text: actualReactNative.Text,
    ZoomIn: {
      springify: jest.fn(() => ({})),
    },
    FadeIn: {
      duration: jest.fn(() => ({})),
    },
    FadeOut: {
      duration: jest.fn(() => ({})),
    },
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
    SafeAreaProvider: actualReactNative.View,
    SafeAreaView: actualReactNative.View,
    SafeAreaContext: {
      Provider: { create: () => ({}) },
    },
  };
});

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Cannot update a component')) {
      return;
    }
    originalWarn.call(console, ...args);
  });

  console.error = jest.fn((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
