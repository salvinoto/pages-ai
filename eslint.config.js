const globals = require('globals');
const typescriptParser = require('@typescript-eslint/parser');
// Note: Full migration might require importing plugins and configs directly.
// Example: const js = require("@eslint/js");

module.exports = [
  {
    // languageOptions apply globally unless overridden
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    // plugins: { /* Plugin definitions needed for flat config */ },
    // extends: [ /* Extends are handled differently, often via imported config objects */ ],
    settings: { // Settings might need adjustment based on plugins
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Rules from 'extends' might need to be added explicitly or via imported configs
      'react/prop-types': 'off', // Keep specific rules
    },
    // ignores replaces ignorePatterns
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.turbo/',
      '.changeset/',
      'coverage/',
      '*.log',
      '*.lock',
      '!.changeset/config.json',
      'eslint.config.js', // Ignore the config file itself
    ],
  },
  // Overrides become separate objects in the array
  {
    files: ['*.test.ts', '*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    // Add test-specific rules/plugins if needed
  },
  {
    files: ['jest.config.js', '*.config.js', '*.config.ts'], // Removed .eslintrc.js reference
    languageOptions: {
      globals: {
        ...globals.node, // Keep node env for config files
      },
    },
  },
];