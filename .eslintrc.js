module.exports = {
  extends: ['standard', 'prettier'],
  env: {
    node: true,
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-unused-vars': 1,
  },
}
