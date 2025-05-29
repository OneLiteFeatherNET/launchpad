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
    strategy: 'prefix',
    defaultLocale: 'de',
    locales: [
        { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
        { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
    baseUrl: 'https://blog.onelitefeather.net',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root' // recommended
    }
  },
  tailwindcss: {
    cssPath: [`~/css/tailwind.css`, { injectPosition: "first" }],
    config: {},
    viewer: true,
    exposeConfig: false,
  }
})