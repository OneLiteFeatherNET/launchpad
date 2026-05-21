// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineOrganization} from 'nuxt-schema-org/schema'
import tailwindcss from "@tailwindcss/vite";
import pkg from './package.json' assert {type: 'json'}

// Image provider is chosen at build time from the NUXT_IMAGE_PROVIDER build
// variable, set per Wrangler environment in Cloudflare Workers Builds. The
// `production` environment sets it to `cloudflare` to route images through
// the img.onelitefeather.net proxy; preview/local builds leave it unset and
// fall back to `none`, serving the originals straight from the deploy's own
// /public — the proxy only knows the live site and would 404 branch assets.
const imageProvider = process.env.NUXT_IMAGE_PROVIDER === 'cloudflare'
  ? 'cloudflare'
  : 'none'

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
        // Absolute base for i18n-generated canonical + hreflang links. Kept on
        // the production domain in every environment so the SEO tags Google
        // sees are always the real URLs (dev never gets indexed anyway).
        baseUrl: 'https://onelitefeather.net',
    },
    sitemap: {
        xslColumns: [
            {label: 'URL', width: '50%'},
            {label: 'Last Modified', select: 'sitemap:lastmod', width: '25%'},
            {label: 'Language', select: 'sitemap:hreflang', width: '25%'}
        ],
        // Team profiles live in a data-type content collection so they're
        // not auto-discovered. We materialise the per-member URLs through
        // a Nitro endpoint that reads the same JSON the page uses.
        sources: [
            '/api/__sitemap__/team'
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
        // Provider is resolved from the NUXT_IMAGE_PROVIDER build variable
        // (see the note at the top of this file). `cloudflare` on production,
        // `none` everywhere else.
        provider: imageProvider,
        // Prefer modern formats with automatic fallback for browsers that don't support them.
        format: ['avif', 'webp'],
        // Slightly lower default quality to trim payloads without obvious visual loss.
        quality: 75,
        // Allow the Cloudflare Images pipeline to transform third-party origins
        // we explicitly trust. Minecraft head renders come from mc-heads.net and
        // are reshipped as AVIF/WebP via img.onelitefeather.net.
        domains: ['mc-heads.net'],
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
            domains: ['mc-heads.net'],
            cloudflare: {
                baseURL: 'https://img.onelitefeather.net',
            }
        },
        nitro: {
            preset: "cloudflare_module",
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
                    ]
                    // NUXT_IMAGE_PROVIDER is a Cloudflare Workers Builds build
                    // variable (read at build time in nuxt.config, see top of
                    // file) — not a runtime Worker var, so it is not in `vars`.
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
