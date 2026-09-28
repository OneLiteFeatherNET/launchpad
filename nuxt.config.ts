// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineOrganization} from 'nuxt-schema-org/schema'
import tailwindcss from "@tailwindcss/vite";
import pkg from './package.json' assert {type: 'json'}

// Image provider, chosen at build time.
//
// Most images referenced from content/ do NOT exist in this repository — they
// live only behind the img.onelitefeather.net proxy (5 of the 6 paths under
// /images/ referenced by content/ have no file in public/). With the `none`
// provider those paths are emitted verbatim and 404 for every visitor.
//
// This used to depend solely on a NUXT_IMAGE_PROVIDER build variable
// configured in the Cloudflare dashboard, outside version control. When that
// variable is absent the fallback to `none` is silent, and the result is a
// deploy that renders without images. That is exactly what happened once
// Workers Builds rebuilt `main` after months without a deploy.
//
// So the default is now derived from the build context Cloudflare injects
// itself (WORKERS_CI=1 on Workers Builds — see
// developers.cloudflare.com/workers/ci-cd/builds/configuration/): anything
// built by Cloudflare is published and must use the proxy. Local and
// GitHub Actions builds keep `none`, which serves whatever is in public/.
//
// NUXT_IMAGE_PROVIDER still wins when set explicitly, so a Workers build can
// be forced onto `none` — scripts/check-image-assets.mjs then refuses the
// build unless every referenced image really is in public/.
const isCloudflareBuild = process.env.WORKERS_CI === '1'
const imageProvider = (process.env.NUXT_IMAGE_PROVIDER ?? (isCloudflareBuild ? 'cloudflare' : 'none')) === 'cloudflare'
  ? 'cloudflare'
  : 'none'

/** Response headers for a page the edge may cache for `seconds`. */
const cachedPageHeaders = (seconds: number) => ({
  'cloudflare-cdn-cache-control': `max-age=${seconds}, stale-while-revalidate=86400`,
  'cache-control': 'public, max-age=0, must-revalidate'
})

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    app: {
        head: {
            // Declared here, not only in app.vue: nuxt-seo-utils adds its own
            // icon link for public/favicon.svg unless app.head already has
            // one, which left every page with two. The `key` lets app.vue
            // swap it for a season's favicon instead of adding a second.
            link: [{ key: 'favicon', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
        }
    },
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
      'nuxt-vitalizer'
    ],
    robots: {
        // Allow indexing for all crawlers by default. Per-route exclusions (legal pages, etc.)
        // are handled via routeRules. Blocking `/_nuxt/` would hide JS/CSS from crawlers and
        // break rendering for Googlebot, so we don't disallow anything globally here.
        // No `sitemap:` entry here. @nuxtjs/sitemap pushes the correct one
        // itself (/sitemap_index.xml under the i18n prefix strategy); adding
        // /sitemap.xml only announced a second URL that 307s to the first.
    },
    i18n: {
        strategy: 'prefix',
        defaultLocale: 'en',
        locales: [
            // `language`, not `iso`: @nuxtjs/i18n v10 reads only `language` for
            // hreflang and <html lang>. `iso` worked only because nuxtseo-shared
            // copies it over at runtime.
            {code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json'}, {code: 'en', language: 'en-US', name: 'English', file: 'en.json'}
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
        experimental: {
            // The module writes <html lang/dir>, canonical, hreflang and
            // og:locale itself, and omits every locale a page publishes no
            // route params for. Without it, an article that exists only in
            // German announced /en/blog/<german-slug> — a 404 — as its English
            // version and x-default, and the language switcher linked there.
            strictSeo: true
        },
    },
    sitemap: {
        xslColumns: [
            {label: 'URL', width: '50%'},
            {label: 'Last Modified', select: 'sitemap:lastmod', width: '25%'},
            // Alternates are attributes on <xhtml:link>, not children in the
            // sitemap namespace — 'sitemap:hreflang' matched nothing and the
            // column rendered empty in every row. The xhtml namespace is
            // already declared by the stylesheet.
            {label: 'Language', select: 'xhtml:link/@hreflang', width: '25%'}
        ],
        // Team profiles live in a data-type content collection so they're
        // not auto-discovered. We materialise the per-member URLs through
        // a Nitro endpoint that reads the same JSON the page uses.
        // Event detail pages are listed per request, because whether an
        // event is visible depends on the time — see the route's comment.
        sources: [
            '/api/__sitemap__/team', '/api/__sitemap__/events'
        ],
        // No changefreq/priority defaults: Google ignores both. lastmod comes
        // from real content dates only (content.config.ts), never the build.
        // One hour matches the edge cache of the pages the sitemap lists, and
        // bounds how late a scheduled article appears in it.
        cacheMaxAgeSeconds: 3600
    },
    routeRules: {
        // Edge caching. `cloudflare-cdn-cache-control` is read by Cloudflare's
        // Workers Cache and stripped before the response leaves the edge;
        // browsers only ever see `cache-control`, which makes them revalidate
        // every time. The two must stay separate: `must-revalidate` or
        // `s-maxage` in the edge directive would switch off
        // stale-while-revalidate there.
        //
        // Caching these routes by path is only correct because no render
        // reads query, cookies or request headers —
        // tests/architecture/request-independent-render.spec.ts holds that.
        // Errors are never cached: server/plugins/error-response-headers.ts
        // overrides these headers with `no-store` on any status >= 400.
        '/en/**': { headers: cachedPageHeaders(3600) },
        '/de/**': { headers: cachedPageHeaders(3600) },
        // Legal pages are intentionally excluded from search indexing, and
        // change even less often than content.
        '/en/imprint': { robots: 'noindex, follow', headers: cachedPageHeaders(86400) },
        '/de/imprint': { robots: 'noindex, follow', headers: cachedPageHeaders(86400) },
        '/en/privacy': { robots: 'noindex, follow', headers: cachedPageHeaders(86400) },
        '/de/privacy': { robots: 'noindex, follow', headers: cachedPageHeaders(86400) },
        '/robots.txt': { headers: { 'cloudflare-cdn-cache-control': 'max-age=3600, stale-while-revalidate=86400' } },
        // Request-dependent or internal: `/` redirects by cookie and
        // Accept-Language, the rest are the analytics proxy, Nuxt Content's
        // query endpoints and server APIs.
        // Also out of the sitemap: it only redirects, and a sitemap lists
        // pages that answer 200.
        '/': { sitemap: false, headers: { 'cloudflare-cdn-cache-control': 'no-store' } },
        '/ingest/**': { headers: { 'cloudflare-cdn-cache-control': 'no-store' } },
        '/__nuxt_content/**': { headers: { 'cloudflare-cdn-cache-control': 'no-store' } },
        '/api/**': { headers: { 'cloudflare-cdn-cache-control': 'no-store' } },
    },

    vite: {
        plugins: [tailwindcss()],
    },
    // Include FontAwesome core styles (we set autoAddCss = false in the plugin)
    css: [
        '@fortawesome/fontawesome-svg-core/styles.css', '~/assets/css/tailwind.css'
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
            // No consent layer exists yet, so capture must not start on its own.
            // `identified_only` stops a person profile (and its cookie) from being
            // created for every anonymous visitor; `opt_out_capturing_by_default`
            // holds all capture until something explicitly opts in. Remove both
            // only together with a real consent mechanism.
            person_profiles: 'identified_only',
            opt_out_capturing_by_default: true
        }
    },
    content: {
        build: {
            markdown: {
                highlight: {
                    langs: ['json',
'java',
'xml',
'js',
'ts',
'html',
'css',
'vue',
'shell',
'mdc',
'md',
'yaml'],
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
            // Forces a seasonal costume on (`spring`, `halloween`, `winter`,
            // `new-year`) or off (`none`) ahead of the calendar, via
            // NUXT_PUBLIC_SEASON — the kill switch that needs no deploy.
            // Empty follows the dates in layers/season/utils/seasons.ts.
            season: '',
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
        runtimeConfig: {
            public: {
                siteUrl: 'https://onelitefeather.net',
                discordUrl: 'https://1lf.link/discord',
                // Override BlueMap URL for production if needed
                bluemapUrl: 'https://bluemap.onelitefeather.dev/',
                openCollectiveSlug: 'onelitefeather',
                openCollectiveGoal: 3000,
                openCollectiveCurrency: 'EUR',
                season: '',
                social: {
                    twitterSite: '',
                    twitterCreator: '',
                    githubUrl: 'https://github.com/OneLiteFeatherNET',
                    openCollectiveUrl: 'https://opencollective.com/onelitefeather'
                }
            }
        },
        schemaOrg: {
            // Only the two absolute URLs differ from the base identity. The
            // rest is merged in from there — repeating it would concatenate
            // sameAs, contactPoint and availableLanguage rather than replace
            // them, publishing each entry twice as schema.org fact.
            identity: defineOrganization({
                // `name` only to satisfy defineOrganization's input type; it is
                // a scalar, so defu replaces rather than appends it.
                name: 'OneLiteFeather Network',
                url: 'https://onelitefeather.net',
                logo: 'https://onelitefeather.net/images/logo.svg'
            })
        },
        site: {
            url: 'https://onelitefeather.net',
        },
        image: {
            // Only the delivery host differs; `format` and `domains` are
            // declared in the base config and would be concatenated, not
            // replaced, if repeated here.
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
                    ],
                    // Requires Workers Paid — the Free plan rejects `limits`
                    // and caps every request at 10 ms CPU. That cap aborted
                    // renders midway (error 1102), which left Vue's global
                    // current instance pointing at the dead request; every
                    // later request in that isolate then failed with
                    // "Cannot redefine property: $i18n". The ceiling here is
                    // only a guard against runaway renders and must stay far
                    // above a normal render: ten times the measured p99, at
                    // least 1000 ms. 5000 is the placeholder until that
                    // measurement exists.
                    limits: {
                        cpu_ms: 5000
                    }
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
