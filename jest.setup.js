// Global setup
global.__DEV__ = false;

// Mock PixelRatio FIRST (before anything that might use it)
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  roundToNearestPixel: jest.fn((num) => Math.round(num)),
  getPixelSizeForLayoutSize: jest.fn((num) => Math.round(num * 2)),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setUseNativeDriver: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: 14,
  select: jest.fn((obj) => obj.ios),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native useColorScheme
// NOTE: We intentionally avoid `{ ...actual }` here. Spreading forces every
// lazy getter on the react-native module object (e.g. ActivityIndicator) to
// evaluate eagerly, which pulls in StyleSheet.js before PixelRatio's mock is
// fully wired up and crashes every RN component test. Mutating the actual
// module in place preserves its lazy getters.
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  actual.useColorScheme = jest.fn(() => 'light');
  return actual;
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((value) => ({ value })),
  withSpring: jest.fn((value) => value),
  withTiming: jest.fn((value) => value),
  View: 'View',
  ZoomIn: {
    springify: jest.fn(() => ({})),
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

// Suppress console warnings
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((...args) => {
    const message = String(args[0] || '');
    if (message.includes('Cannot update a component') ||
        message.includes('TurboModule') ||
        message.includes('Invariant') ||
        message.includes('Non-serializable')) {
      return;
    }
    originalWarn.call(console, ...args);
  });

  console.error = jest.fn((...args) => {
    const message = String(args[0] || '');
    if (message.includes('Warning:') ||
        message.includes('TurboModule') ||
        message.includes('Invariant') ||
        message.includes('Error: ')) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
