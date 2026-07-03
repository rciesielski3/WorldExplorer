module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@react-native-vector-icons/material-community-icons': '<rootDir>/jest.mocks/icon.js',
    '@react-native-vector-icons/ionicons': '<rootDir>/jest.mocks/icon.js',
    '^react-native-vector-icons/MaterialCommunityIcons$': '<rootDir>/jest.mocks/icon.js',
    '^react-native-vector-icons/Ionicons$': '<rootDir>/jest.mocks/icon.js',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // quizSession.test.js is written against Node's built-in `node:test`
    // runner (`node --test`, see the "test:node" npm script), not Jest's
    // global `test()`. Loading it under Jest reports a failed suite with 0
    // tests, since Jest never sees a test it recognizes.
    '<rootDir>/screens/quiz/quizSession.test.js',
    // Local-only archive of an extracted EAS build kept outside git for
    // inspection (see .git/info/exclude); not part of the app source.
    '<rootDir>/.codex-local/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'theme/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};
