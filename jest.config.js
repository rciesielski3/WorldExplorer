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
