// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineOrganization } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  schemaOrg: {
    identity: defineOrganization({
      // Basic Information
      name: 'OneLiteFeather Network',
      alternateName: 'OneLiteFeather.net',
      description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers. ',
      url: 'https://onelitefeather.net',
      logo: '/logo.svg',

      // Contact Information, if applicable
      email: 'contact@onelitefeather.net',

      // Business Details, if applicable
      foundingDate: '2019-09-01',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        'minValue': 1,
        'maxValue': 25
      },
      sameAs: [
        'https://github.com/OneLiteFeatherNET'
      ]
    })
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-og-image'
  ],
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'de',
    locales: [
        { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
        { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
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
    dir: 'public',
  },
  site: {
    name: 'OneLiteFeather',
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            // Default theme (same as single string)
            default: 'github-light',
            // Theme used if `html.dark`
            dark: 'github-dark',
            // Theme used if `html.sepia`
            sepia: 'monokai'
          }
        }
      }
    }
  },
  $production: {
    image: {
      cloudflare: {
        baseUrl: 'https://blog.onelitefeather.network',
      }
    },
    nitro: {
      preset: "cloudflare_module",
      cloudflare: {
        deployConfig: true,
        nodeCompat: true,
        wrangler: {
          name: 'launchpad',
          d1_databases: [
            {
              binding: 'DB',
              database_name: 'launchpad',
              database_id: 'a92127c1-aaa3-4753-82ba-ea59fa9e7140'
            }
          ],
          vars: {
            "NUXT_IMAGE_PROVIDER": "cloudflare",
          }
        }
      }
    }
  },
  ogImage: {
    compatibility: {
      runtime: {
        resvg: "wasm"
      }
    }
  }
})