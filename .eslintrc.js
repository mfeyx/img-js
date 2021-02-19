module.exports = {
  'env': {
    'commonjs': true,
    'es2015': true,
    'node': true,
    'browser': true,
    'jest/globals': true
  },
  'plugins': ['jest'],
  'extends': [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style'
  ],
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'no-control-regex': [
      'off'
    ],
    'no-unused-vars': [
      'off'
    ],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'always',
      'asyncArrow': 'always'
    }],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-prototype-builtins': [
      'off'
    ]
  }
}
