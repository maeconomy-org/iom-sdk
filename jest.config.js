/**
 * Jest configuration for comprehensive SDK testing
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Use ts-jest for TypeScript support
  preset: 'ts-jest/presets/default-esm',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2020'
        }
      }
    ]
  },

  // Module name mapper for path aliases (fixed typo: moduleNameMapping -> moduleNameMapper)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js)',
    '<rootDir>/tests/**/*.spec.(ts|tsx|js)'
  ],

  // Files to ignore
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**/*', // Exclude type definitions
    '!src/validation/**/*', // Exclude unused validation files
    '!src/services/aggregate-service.ts', // Exclude unused service
    '!src/services/common-service.ts', // Exclude unused service
    '!src/index.ts' // Exclude main export file
  ],

  coverageDirectory: 'coverage',

  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 45,
      lines: 45,
      statements: 45
    }
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Watch mode configuration
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

  // Module resolution
  extensionsToTreatAsEsm: ['.ts'],

  // Mock configuration
  modulePathIgnorePatterns: ['<rootDir>/dist/'],

  // Performance optimization
  maxWorkers: '50%',

  // Bail on first test failure in CI
  bail: process.env.CI ? 1 : 0,

  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache'
};
