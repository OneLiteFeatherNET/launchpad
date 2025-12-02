// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineOrganization} from 'nuxt-schema-org/schema'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: {
        enabled: false,

        timeline: {
            enabled: true
        }
    },
    schemaOrg: {
        identity: defineOrganization({
            name: 'OneLiteFeather Network',
            alternateName: 'OneLiteFeather.net',
            description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers. ',
            url: 'http://localhost:3000',
            logo: '/logo.svg',
            email: 'contact@onelitefeather.net',
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
    site: {
        debug: true,
    },
    modules: [
      '@vueuse/nuxt',
      'nuxt-link-checker',
      'nuxt-site-config',
      '@nuxt/eslint',
      '@nuxtjs/i18n',
      '@nuxtjs/seo',
      '@nuxt/image',
      'nuxt-og-image',
      '@nuxt/content',
      'nuxt-posthog',
      'nuxt-gtag',
      'nuxt-vitalizer'
    ],
    i18n: {
        strategy: 'prefix',
        defaultLocale: 'en',
        locales: [
            {code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json'},
            {code: 'en', iso: 'en-US', name: 'English', file: 'en.json'}
        ],
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root' // recommended
        },
        baseUrl: 'http://localhost:3000',
    },

    vite: {
        plugins: [tailwindcss()],
    },
    // Include FontAwesome core styles (we set autoAddCss = false in the plugin)
    css: [
        '@fortawesome/fontawesome-svg-core/styles.css',
        '~/assets/css/tailwind.css'
    ],
    appConfig: {
        appId: 'OneLiteFeather'
    },
    image: {
        provider: 'cloudflare',
        // Prefer modern formats with automatic fallback for browsers that don't support them.
        format: ['avif', 'webp'],
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
        cloudflare: {
            baseURL: 'https://img.onelitefeather.net',
        }
    },
    postcss: {
        plugins: {
            "@tailwindcss/postcss": {},
            'postcss-import': {},
        },
    },
    posthog: {
        publicKey: 'phc_t9nBlYL9LcDj4LDKZfQ97m5nbvFDTugkdQqAAspfdI',
        host: 'https://eu.i.posthog.com',
        proxy: true,
        clientOptions: {
            person_profiles: 'always'
        }
    },
    sitemap: {
        autoI18n: true,
        xslColumns: [
            {label: 'URL', width: '50%'},
            {label: 'Last Modified', select: 'sitemap:lastmod', width: '25%'},
            {label: 'Language', select: 'sitemap:hreflang', width: '25%'}
        ],
        urls: [],
        sources: [],
        defaults: {
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date()
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
    runtimeConfig: {
        public: {
            discordUrl: 'https://1lf.link/discord',
            // Public BlueMap URL used to embed the external map
            bluemapUrl: 'https://bluemap.onelitefeather.dev/',
        }
    },
    $production: {
        i18n: {
            strategy: 'prefix',
            defaultLocale: 'en',
            locales: [
                {code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json'},
                {code: 'en', iso: 'en-US', name: 'English', file: 'en.json'}
            ],
            detectBrowserLanguage: {
                useCookie: true,
                cookieKey: 'i18n_redirected',
                redirectOn: 'root' // recommended
            },
            baseUrl: 'https://onelitefeather.net',
        },
        runtimeConfig: {
            public: {
                siteUrl: 'https://onelitefeather.net',
                discordUrl: 'https://1lf.link/discord',
                // Override BlueMap URL for production if needed
                bluemapUrl: 'https://bluemap.onelitefeather.dev/',
            }
        },
        schemaOrg: {
            identity: defineOrganization({
                name: 'OneLiteFeather Network',
                alternateName: 'OneLiteFeather.net',
                description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers. ',
                url: 'https://onelitefeather.net',
                logo: '/logo.svg',
                email: 'contact@onelitefeather.net',
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
        posthog: {
            publicKey: 'phc_t9nBlYL9LcDj4LDKZfQ97m5nbvFDTugkdQqAAspfdI',
            host: 'https://eu.i.posthog.com',
            proxy: true,
            clientOptions: {
                person_profiles: 'always'
            }
        },
        site: {
            url: 'https://onelitefeather.net',
        },
        gtag: {
            id: 'AW-16761048144',
            config: {
                anonymize_ip: true,
                send_page_view: true
            }
        },
        image: {
            format: ['avif', 'webp'],
            cloudflare: {
                baseURL: 'https://img.onelitefeather.net',
            }
        },
        i18n: {
            baseUrl: 'https://onelitefeather.net',
        },
        nitro: {
            preset: "cloudflare_pages",
            externals: {
                inline: ["@nuxt/content"]
            },
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
