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
      'error', { required: { some: ['nesting', 'id'] }, allowChildren: false }
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
}, {
  // Components directly under `layers/<domain>/components/` get no
  // directory-derived name prefix (see AGENTS.md: "Layer names produce no
  // auto-import prefix"). Before the layer migration these four lived a
  // couple of directories deeper (e.g. `components/features/carousel/Carousel.vue`),
  // which happened to make their auto-registered name multi-word on its own
  // (`FeaturesCarousel`); flattening the tree removed that side effect. Renaming
  // the components to satisfy the rule would ripple into every call site for a
  // purely cosmetic reason, so the exception is scoped to the exact names this
  // is true for today. `Footer` was removed from this list and renamed to
  // `SiteFooter` instead: colliding with the `<footer>` element is the exact
  // hazard this rule exists to catch, so it does not get the cosmetic pass.
  files: ['layers/*/components/**/*.vue'],
  rules: {
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: [
          'Chip',
          'Top1',
          'Carousel',
          'Sponsoring'
        ]
      }
    ]
  }
})
