
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  testMatch: ['**/*.spec.ts'],

  moduleNameMapper: {
    '^@talent-matching/dtos$': '<rootDir>/../../libs/shared/dtos/src/index.ts',
  },

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        module: 'commonjs',
        target: 'ES2015',
        esModuleInterop: true,
        skipLibCheck: true,
        moduleResolution: 'node',
      },
    }],
  },
};
