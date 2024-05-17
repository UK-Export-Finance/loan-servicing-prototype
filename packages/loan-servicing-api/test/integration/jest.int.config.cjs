const baseConfig = require('../../jest.base.config.cjs')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  rootDir: ".",
  setupFiles: ['./jest-environment/setupRunner.ts'],
  globalSetup: './jest-environment/globalSetup.ts',
  globalTeardown: './jest-environment/globalTeardown.ts',
  setupFilesAfterEnv: ['./jest-environment/setupEnv.ts'],
  globals: {
    sqlContainerUsername: '',
    sqlContainerPassword: '',
    sqlContainerDatabase: '',
    sqlContainerHost: '',
    sqlContainerPort: '',
  }
};