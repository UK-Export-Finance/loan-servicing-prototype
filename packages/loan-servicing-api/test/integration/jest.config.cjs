const baseConfig = require('../../jest.config.cjs')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  rootDir: "../../",
  
  setupFiles: ['./test/integration/utils/setupRunner.ts'],
  setupFilesAfterEnv: ['./test/integration/utils/setupEnv.ts'],
};