// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((value) => ({ value })),
  withSpring: jest.fn((value) => value),
  withTiming: jest.fn((value) => value),
  View: 'View',
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

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
