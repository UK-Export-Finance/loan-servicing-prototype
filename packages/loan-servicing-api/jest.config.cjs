/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist'],
  setupFiles: ['./test/integration/utils/setupRunner.ts'],
  setupFilesAfterEnv: ['./test/integration/utils/setupEnv.ts'],
  moduleDirectories: [
    "node_modules", "src"
  ],
};