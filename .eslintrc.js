module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/sort-comp': [0, {}],
    'max-classes-per-file': [0],
    'react/static-property-placement': [0],
    'react/forbid-prop-types': [0],
    'react/jsx-props-no-spreading': [0],
    'react/prop-types': [2, { ignore: ['match', 'history', 'location', 'children'] }],
    'no-param-reassign': [0],
    'object-curly-newline': [0],
    'class-methods-use-this': [0],
    'no-restricted-syntax': [0],
    'react/jsx-one-expression-per-line': [0],
    'react/prefer-stateless-function': [1],
    'no-else-return': [0],
    'react/no-redundant-should-component-update': [0],
  },
};
