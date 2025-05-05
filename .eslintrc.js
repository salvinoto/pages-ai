module.exports = {
  root: true, // Important for monorepos
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // Use new JSX transform
    'plugin:react-hooks/recommended',
    'prettier', // Add prettier last to override other configs
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  env: {
    browser: true, // For browser globals
    node: true,    // For Node.js globals and Node.js-specific rules
    es2021: true,  // Enables ES2021 globals
  },
  rules: {
    // Add any project-specific rules or overrides here
    // Example:
    // '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'react/prop-types': 'off', // Not needed with TypeScript
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.turbo/',
    '.changeset/',
    'coverage/',
    '*.log',
    '*.lock', // Ignore bun.lockb, package-lock.json, yarn.lock
    '!.changeset/config.json', // Don't ignore changeset config
  ],
  overrides: [
    // Configuration specific to test files
    {
      files: ['*.test.ts', '*.test.tsx'],
      env: {
        jest: true, // Add Jest environment for test files
      },
    },
    // Configuration specific to config files (like this one)
    {
      files: ['.eslintrc.js', 'jest.config.js', '*.config.js', '*.config.ts'],
      env: {
        node: true,
      },
    },
  ],
};