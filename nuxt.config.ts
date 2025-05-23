// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss'
  ],
  i18n: {
    strategy: 'prefix_and_default',
    defaultLocale: 'de',
    locales: [
        { code: 'de', iso: 'de-DE', name: 'Deutsch' },
        { code: 'en', iso: 'en-US', name: 'English' }
    ]
  },
  tailwindcss: {
    cssPath: [`~/css/tailwind.css`, { injectPosition: "first" }],
    config: {},
    viewer: true,
    exposeConfig: false,
  }
})