import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  // CJS source files
  {
    files: ['lib/**/*.js', 'index.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.commonjs },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // ESM test files (top-level await requires ecmaVersion: 'latest')
  {
    files: ['tests/**/*.js', 'vitest.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['node_modules/', 'coverage/'],
  },
];
