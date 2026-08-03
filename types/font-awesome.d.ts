/**
 * `plugins/fontawesome.ts` registers `<font-awesome-icon>` on the Vue app, and
 * a globally registered component carries no props contract of its own — the
 * template compiler simply accepts whatever it is given.
 *
 * Declaring it here points the compiler at the real component's props, so a
 * misspelled attribute or a wrong icon shape is a type error at the call site
 * rather than an empty element in the page.
 *
 * The kebab-case spelling is the one the plugin registers and the one all five
 * call sites use; Vue resolves the PascalCase form to the same component, so
 * both are declared.
 */

import type { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

declare module 'vue' {
  interface GlobalComponents {
    'font-awesome-icon': typeof FontAwesomeIcon
    'FontAwesomeIcon': typeof FontAwesomeIcon
  }
}

export {}
