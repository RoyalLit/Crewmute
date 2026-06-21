/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)',
  ],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@design/(.*)$': '<rootDir>/src/design/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      // Coverage thresholds — must not be lowered without an ADR
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};

module.exports = config;
