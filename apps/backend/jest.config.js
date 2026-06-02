/**
 * jest.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Jest configuration for the NestJS backend.
 *
 * Why this file is needed:
 *   The project uses TypeScript and Nx but has no built-in Jest target for the
 *   backend. This config tells Jest how to find, compile, and run the .spec.ts
 *   test files without needing a real database or server.
 *
 * How to run:
 *   node node_modules/.bin/jest --config apps/backend/jest.config.js --verbose
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {import('jest').Config} */
module.exports = {
  // Label shown in test output (e.g. "PASS backend src/app/...")
  displayName: 'backend',

  // ts-jest preset lets Jest understand TypeScript files directly.
  // Without this, Jest would not know how to read .ts files.
  preset: 'ts-jest',

  // Run tests in a Node.js environment (not a browser/jsdom environment).
  // This matches how NestJS services actually run in production.
  testEnvironment: 'node',

  // Only look for test files inside apps/backend/src/.
  // Prevents Jest from accidentally scanning node_modules or other apps.
  roots: ['<rootDir>/src'],

  // Only treat files ending in .spec.ts as test files.
  // e.g. candidates.service.spec.ts is a test file;
  //      candidates.service.ts is not.
  testMatch: ['**/*.spec.ts'],

  // Path alias resolution.
  // The shared DTOs library is imported as "@talent-matching/dtos" in the
  // source code. Jest does not understand Nx path aliases by default, so we
  // map the alias to the actual file path here.
  moduleNameMapper: {
    '^@talent-matching/dtos$': '<rootDir>/../../libs/shared/dtos/src/index.ts',
  },

  // Tell ts-jest which TypeScript compiler options to use when compiling
  // test files. These options are kept minimal — just enough to compile
  // NestJS decorators (@Injectable, @Controller, etc.) correctly.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // Required for NestJS decorators like @Injectable() and @Controller()
        experimentalDecorators: true,
        // Required to make decorator metadata (used by NestJS DI) work at runtime
        emitDecoratorMetadata: true,
        // commonjs is required because Jest runs in Node.js and does not support
        // ES module imports natively
        module: 'commonjs',
        target: 'ES2015',
        // Allows default imports from CommonJS modules (e.g. import express from 'express')
        esModuleInterop: true,
        // Skip type-checking of third-party library .d.ts files to speed up compilation
        skipLibCheck: true,
        moduleResolution: 'node',
      },
    }],
  },
};
