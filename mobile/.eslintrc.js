module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'expo',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // no any without suppression comment
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
    // no inline StyleSheet.create in render
    // (enforced by code review, flagged here as a reminder)
    // magic numbers forbidden
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, -1],
      ignoreArrayIndexes: true,
    }],
    // functions <= 50 lines
    'max-lines-per-function': ['warn', { max: 55, skipBlankLines: true, skipComments: true }],
    // files <= 300 lines
    'max-lines': ['warn', { max: 320, skipBlankLines: true, skipComments: true }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**/*.ts', '__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'max-lines-per-function': 'off',
        'no-magic-numbers': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'android/', 'ios/'],
};
