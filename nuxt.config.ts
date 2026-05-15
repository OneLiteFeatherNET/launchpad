// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineOrganization} from 'nuxt-schema-org/schema'
import tailwindcss from "@tailwindcss/vite";
import pkg from './package.json' assert {type: 'json'}

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
            name: 'OneLiteFeather Network',
            alternateName: 'OneLiteFeather.net',
            description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers.',
            url: 'http://localhost:3000',
            logo: '/images/logo.svg',
            email: 'contact@onelitefeather.net',
            foundingDate: '2019-09-01',
            numberOfEmployees: {
                '@type': 'QuantitativeValue',
                'minValue': 1,
                'maxValue': 25
            },
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Geisinger Straße 6',
                postalCode: '71634',
                addressLocality: 'Ludwigsburg',
                addressCountry: 'DE'
            },
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'contact@onelitefeather.net',
                    availableLanguage: ['en', 'de']
                }
            ],
            sameAs: [
                'https://github.com/OneLiteFeatherNET',
                'https://1lf.link/discord',
                'https://opencollective.com/onelitefeather'
            ]
        })
    },
    site: {
        url: 'http://localhost:3000',
        name: 'OneLiteFeather Network',
        description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers.',
        defaultLocale: 'en'
    },
    modules: [
      '@vueuse/nuxt',
      'nuxt-link-checker',
      'nuxt-site-config',
      '@nuxt/eslint',
      '@nuxtjs/i18n',
      '@nuxtjs/seo',
      '@nuxtjs/robots',
      '@nuxtjs/sitemap',
      '@nuxt/image',
      'nuxt-og-image',
      '@nuxt/content',
      'nuxt-posthog',
      'nuxt-gtag',
      'nuxt-vitalizer'
    ],
    robots: {
        // Allow indexing for all crawlers by default. Per-route exclusions (legal pages, etc.)
        // are handled via routeRules. Blocking `/_nuxt/` would hide JS/CSS from crawlers and
        // break rendering for Googlebot, so we don't disallow anything globally here.
        sitemap: ['/sitemap.xml']
    },
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
    sitemap: {
        xslColumns: [
            {label: 'URL', width: '50%'},
            {label: 'Last Modified', select: 'sitemap:lastmod', width: '25%'},
            {label: 'Language', select: 'sitemap:hreflang', width: '25%'}
        ],
        defaults: {
            changefreq: 'weekly',
            priority: 0.8
        }
    },
    routeRules: {
        // Legal pages are intentionally excluded from search indexing.
        '/en/imprint': { robots: 'noindex, follow' },
        '/de/imprint': { robots: 'noindex, follow' },
        '/en/privacy': { robots: 'noindex, follow' },
        '/de/privacy': { robots: 'noindex, follow' },
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
        appId: 'OneLiteFeather',
        version: pkg.version
    },
    image: {
        provider: 'cloudflare',
        // Prefer modern formats with automatic fallback for browsers that don't support them.
        format: ['avif', 'webp'],
        // Slightly lower default quality to trim payloads without obvious visual loss.
        quality: 75,
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
            openCollectiveSlug: 'onelitefeather',
            openCollectiveGoal: 3000,
            openCollectiveCurrency: 'EUR',
            // Social handles consumed by usePageSeo for twitter:site / twitter:creator.
            // Empty strings are filtered out by the composable.
            social: {
                twitterSite: '',
                twitterCreator: '',
                githubUrl: 'https://github.com/OneLiteFeatherNET',
                openCollectiveUrl: 'https://opencollective.com/onelitefeather'
            }
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
                openCollectiveSlug: 'onelitefeather',
                openCollectiveGoal: 3000,
                openCollectiveCurrency: 'EUR',
                social: {
                    twitterSite: '',
                    twitterCreator: '',
                    githubUrl: 'https://github.com/OneLiteFeatherNET',
                    openCollectiveUrl: 'https://opencollective.com/onelitefeather'
                }
            }
        },
        schemaOrg: {
            identity: defineOrganization({
                name: 'OneLiteFeather Network',
                alternateName: 'OneLiteFeather.net',
                description: 'OneLiteFeather is a Minecraft Network focusing on the development tools with intention to share with other servers.',
                url: 'https://onelitefeather.net',
                logo: 'https://onelitefeather.net/images/logo.svg',
                email: 'contact@onelitefeather.net',
                foundingDate: '2019-09-01',
                numberOfEmployees: {
                    '@type': 'QuantitativeValue',
                    'minValue': 1,
                    'maxValue': 25
                },
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Geisinger Straße 6',
                    postalCode: '71634',
                    addressLocality: 'Ludwigsburg',
                    addressCountry: 'DE'
                },
                contactPoint: [
                    {
                        '@type': 'ContactPoint',
                        contactType: 'customer support',
                        email: 'contact@onelitefeather.net',
                        availableLanguage: ['en', 'de']
                    }
                ],
                sameAs: [
                    'https://github.com/OneLiteFeatherNET',
                    'https://1lf.link/discord',
                    'https://opencollective.com/onelitefeather'
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
        // Generate OG images at build time and serve them as static assets.
        // Avoids shipping the Satori/Resvg pipeline into the Cloudflare Workers
        // runtime, which fails to initialise there. The /_og endpoint is
        // unavailable at runtime; images are emitted under public/ during build.
        zeroRuntime: true
    }
})
