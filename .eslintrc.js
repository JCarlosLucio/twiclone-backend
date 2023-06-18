module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'prettier', // Make sure this is always the last element in the array.
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    eqeqeq: 'error',
    'no-console': 0,
    'no-var': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
