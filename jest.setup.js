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
const asyncStorageStore = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(asyncStorageStore[key] || null)),
  setItem: jest.fn((key, value) => {
    asyncStorageStore[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete asyncStorageStore[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(asyncStorageStore).forEach(key => delete asyncStorageStore[key]);
    return Promise.resolve();
  }),
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

// Mock expo-linear-gradient
// The real module pulls in expo-modules-core's native binding
// (NativeModule.ts throws outside a real Expo runtime), so it can't run
// under Jest even with transformIgnorePatterns allowing it through Babel.
// Render it as a plain View so components using <ScreenBackground> (which
// wraps LinearGradient) can still be tested.
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LinearGradient = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref })
  );
  LinearGradient.displayName = 'LinearGradient';
  return { LinearGradient };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

// Mock firebase-config
jest.mock('./firebase-config', () => ({
  db: {},
  auth: {},
  default: {},
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
