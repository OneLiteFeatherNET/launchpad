// @ts-check
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

const a11yConfigs = vuejsAccessibility.configs['flat/recommended'].map(config => ({
  ...config,
  files: ['**/*.vue'],
  rules: {
    ...config.rules,
    // Labels associated via `for`/`id` are valid; do not also require nesting.
    'vuejs-accessibility/label-has-for': [
      'error',
      { required: { some: ['nesting', 'id'] }, allowChildren: false }
    ]
  }
}))

export default withNuxt(...a11yConfigs, {
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
