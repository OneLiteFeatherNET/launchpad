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
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-og-image',
    '@nuxt/content',
    'nuxt-posthog',
    'nuxt-gtag'
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
    url: 'https://blog.onelitefeather.net',
  },
  sitemap: {
    autoI18n: true,
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Language', select: 'sitemap:hreflang', width: '25%' }
    ],
    urls: [],
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date()
    },
    // Ensure alternate language versions are properly linked
    i18n: {
      locales: ['de', 'en'],
      defaultLocale: 'de'
    },
    // Process content collections to add alternate links based on translationKey
    transformEntries: async (entries) => {
      // Group entries by translationKey
      const entriesByTranslationKey = entries.reduce((acc, entry) => {
        if (entry.translationKey) {
          if (!acc[entry.translationKey]) {
            acc[entry.translationKey] = [];
          }
          acc[entry.translationKey].push(entry);
        }
        return acc;
      }, {});

      // Add alternate links to entries
      return entries.map(entry => {
        if (entry.translationKey && entriesByTranslationKey[entry.translationKey]) {
          entry.alternates = entriesByTranslationKey[entry.translationKey]
            .filter(alt => alt._path !== entry._path)
            .map(alt => ({
              hreflang: alt._locale || 'x-default',
              href: alt._path
            }));
        }
        return entry;
      });
    }
  },
  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['json', 'java', 'xml', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml'],
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
    runtimeConfig: {
      public: {
        siteUrl: 'https://blog.onelitefeather.net',
      }
    },
    posthog: {
      publicKey: 'phc_t9nBlYL9LcDj4LDKZfQ97m5nbvFDTugkdQqAAspfdI',
      host: 'https://eu.i.posthog.com',
      proxy: true,
      clientOptions: {
        person_profiles: 'always'
      }
    },
    site: {
      url: 'https://blog.onelitefeather.net',
    },
    gtag: {
      id: 'AW-16761048144',
      config: {
        anonymize_ip: true,
        send_page_view: true
      }
    },
    image: {
      cloudflare: {
        baseUrl: 'https://blog.onelitefeather.net',
      }
    },
    i18n: {
      baseUrl: 'https://blog.onelitefeather.net',
    },
    nitro: {
      preset: "cloudflare_pages",
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