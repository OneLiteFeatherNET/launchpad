// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxthq/studio'
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
  },
  appConfig: {
    appId: 'OneLiteFeather'
  },
  image: {
    // The screen sizes predefined by `@nuxt/image`:
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 1536
    },
    dir: 'public/images',
  }
})