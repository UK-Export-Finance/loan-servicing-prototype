//.eslintrc
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'no-relative-import-paths'],
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022,
    sourceType: 'module',
    project: [
      './packages/loan-servicing-ui/tsconfig.json',
      './packages/loan-servicing-functions/tsconfig.json',
      './packages/loan-servicing-api/tsconfig.json',
      './libs/loan-servicing-common/tsconfig.json',
    ],
  },
  root: true,
  rules: {
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      { allowSameFolder: true },
    ],
    'no-case-declarations': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
}
