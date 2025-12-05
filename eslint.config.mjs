// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'linebreak-style': ['error', 'unix'],
    'max-len': [
      'error',
      {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'object-curly-newline': ['error', { multiline: true, consistent: true }],
    'array-element-newline': ['error', { multiline: true, minItems: 3 }],
    'operator-linebreak': ['error', 'before'],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'function-paren-newline': ['error', 'multiline'],
    'no-trailing-spaces': 'error'
  }
})
