const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  ...compat.extends('eslint-config-expo'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
      }],
      'max-lines-per-function': ['warn', { max: 55, skipBlankLines: true, skipComments: true }],
      'max-lines': ['warn', { max: 320, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-lines-per-function': 'off',
      'no-magic-numbers': 'off',
    },
  },
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'android/', 'ios/'],
  },
];
