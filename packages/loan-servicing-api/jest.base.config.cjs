/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist'],
  moduleDirectories: [
    "node_modules", "src"
  ],
  rootDir: "./"
};