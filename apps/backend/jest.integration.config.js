/**
 * jest.integration.config.js
 * Configuration for integration tests.
 * These tests require the backend to be running at localhost:4000.
 * No mocking — real HTTP calls to the real backend.
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Only match integration test files — NOT spec files (unit tests)
  testMatch: ['**/*.integration.test.ts', '**/integration.test.ts'],
  testTimeout: 15000, // 15s timeout per test — real network calls take longer
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'ES2015',
        esModuleInterop: true,
        skipLibCheck: true,
        moduleResolution: 'node',
      },
    }],
  },
};
