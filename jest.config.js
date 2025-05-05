/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Default environment
  projects: [
    // Core package (Node environment)
    {
      displayName: 'core',
      preset: 'ts-jest',
      rootDir: '<rootDir>/packages/core',
      testEnvironment: 'node',
      moduleNameMapper: {
        // Map workspace dependencies to their source for tests if needed
        // Example: '^@page-ai/core/(.*)$': '<rootDir>/src/$1',
        // Or map to dist if testing built code:
        '^@page-ai/core$': '<rootDir>/src/index.ts', // Adjust if needed
      },
      testMatch: ['<rootDir>/src/**/*.test.ts'],
    },
    // DOM package (JSDOM environment)
    {
      displayName: 'dom',
      preset: 'ts-jest',
      rootDir: '<rootDir>/packages/dom',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@page-ai/core$': '<rootDir>/../core/src/index.ts', // Map core dependency
        '^@page-ai/dom$': '<rootDir>/src/index.ts',
      },
      testMatch: ['<rootDir>/src/**/*.test.ts'],
    },
    // React package (JSDOM environment)
    {
      displayName: 'react',
      preset: 'ts-jest',
      rootDir: '<rootDir>/packages/react',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@page-ai/core$': '<rootDir>/../core/src/index.ts', // Map core dependency
        '^@page-ai/dom$': '<rootDir>/../dom/src/index.ts',   // Map dom dependency
        '^@page-ai/react$': '<rootDir>/src/index.ts',
        // Handle CSS modules or other assets if needed
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
      // Add setup file if needed for React Testing Library etc.
      // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    },
  ],
  // Optional: Collect coverage
  // collectCoverage: true,
  // coverageDirectory: '<rootDir>/coverage/',
  // coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // collectCoverageFrom: [
  //   'packages/*/src/**/*.{ts,tsx}',
  //   '!packages/*/src/**/*.d.ts',
  //   '!packages/*/src/**/*.test.{ts,tsx}',
  //   '!packages/*/src/index.{ts,tsx}', // Often excluded
  // ],
};