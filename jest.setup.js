// Global setup
global.__DEV__ = false;

// Mock PixelRatio FIRST (before anything that might use it)
//
// NOTE: React Native's real modules are authored as `export default X` and
// compiled by Babel to CommonJS, so consumers do
// `require('./PixelRatio').default` (see StyleSheet.js, which immediately
// calls `.roundToNearestPixel()` on that value). A mock factory that returns
// the mock shape directly - without a `.default` property - makes `.default`
// resolve to `undefined`, producing
// "Cannot read properties of undefined (reading 'roundToNearestPixel')".
// Mirror the real `__esModule`/`default` shape so both ESM `import` and CJS
// `.default` access resolve to the same mock object.
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    roundToNearestPixel: jest.fn((num) => Math.round(num)),
    getPixelSizeForLayoutSize: jest.fn((num) => Math.round(num * 2)),
  },
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setUseNativeDriver: jest.fn(),
  },
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  __esModule: true,
  default: {
    OS: 'ios',
    Version: 14,
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock AsyncStorage
//
// NOTE: Resolve every method to a settled Promise (not a bare `jest.fn()`,
// which returns `undefined`). Consumers like ThemeContext's `useEffect` do
// `await AsyncStorage.getItem(...)`; awaiting `undefined` still yields a
// microtask, but tests that call `render()` and immediately run synchronous
// queries (`getBy*`) don't flush that microtask, so they observe the
// provider's loading/splash state instead of the settled one. Returning an
// already-resolved Promise here keeps behavior async (a consumer still needs
// `await`/`act`) while matching the real module's contract.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
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
// Includes the ImpactFeedbackStyle/NotificationFeedbackType enums (mirroring
// the real module's string values) since several components reference them
// directly, e.g. `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
    Soft: 'soft',
    Rigid: 'rigid',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
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
