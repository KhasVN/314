
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Match both integration.test.ts AND system.test.ts
  testMatch: [
    '**/integration.test.ts',
    '**/system.test.ts',
    '**/*.integration.test.ts',
    '**/*.system.test.ts',
  ],
  testTimeout: 15000,
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
