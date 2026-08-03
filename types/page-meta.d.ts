/**
 * Fields `definePageMeta` may set beyond the ones Nuxt declares itself.
 *
 * Without this, a custom field arrives at the reading end as `unknown` from
 * PageMeta's index signature, and the reader has to assert what it is — an
 * assertion that says nothing about the pages doing the writing. Declared
 * here, both ends are held to the same contract by the compiler.
 *
 * `#app` covers `definePageMeta`; `vue-router` covers `useRoute().meta`,
 * which is where the layout reads it back.
 */

declare module '#app' {
  interface PageMeta {
    /**
     * i18n message key for the document title, resolved through `t()` in
     * `layouts/default.vue`. A key, not the rendered title.
     */
    title?: string
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    /** @see {@link import('#app').PageMeta.title} */
    title?: string
  }
}

export {}
