const baseConfig = require('../../jest.config.cjs')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  rootDir: "../../",
  setupFiles: ['./test/integration/utils/setupRunner.ts'],
  globalSetup: './test/integration/utils/globalSetup.ts',
  globalTeardown: './test/integration/utils/globalTeardown.ts',
  setupFilesAfterEnv: ['./test/integration/utils/setupEnv.ts'],
  globals: {
    sqlContainerUsername: '',
    sqlContainerPassword: '',
    sqlContainerDatabase: '',
    sqlContainerHost: '',
    sqlContainerPort: '',
  }
};