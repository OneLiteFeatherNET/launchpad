/**
 * Baseline security headers, sent on every response by
 * server/plugins/security-headers.ts.
 *
 * Why a plugin and not `routeRules`: route rules never run for a response that
 * comes out of the error handler, and errors must carry the headers too.
 * Cloudflare already adds Strict-Transport-Security at the zone; it is not
 * repeated here.
 */

/** Sources the report-only policy allows, per directive. */
export const CSP_SOURCES = {
  'default-src': ["'self'"],
  // 'unsafe-inline': Nuxt inlines `window.__NUXT__` and the payload bootstrap.
  // A nonce would differ per request, and pages are cached and shared at the
  // edge; a hash would change with every page. Revisit with a build-time hash step.
  // static.cloudflareinsights.com: Web Analytics beacon, injected by Cloudflare at the edge.
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://static.cloudflareinsights.com'
  ],
  // Vue's `style` bindings and Nuxt's inlined critical CSS are inline styles.
  'style-src': ["'self'", "'unsafe-inline'"],
  // img.onelitefeather.net: @nuxt/image's Cloudflare provider. The other two
  // are loaded directly by the team and community pages: Minecraft heads and
  // OpenCollective avatars.
  'img-src': ["'self'",
'data:',
'https://img.onelitefeather.net',
'https://mc-heads.net',
'https://images.opencollective.com'],
  'font-src': ["'self'", 'data:'],
  // PostHog reaches the browser through the same-origin /ingest proxy.
  'connect-src': ["'self'"],
  // The BlueMap embed (runtimeConfig.public.bluemapUrl).
  'frame-src': ['https://bluemap.onelitefeather.dev'],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
} as const satisfies Record<string, readonly string[]>

const policy = (sources: Record<string, readonly string[]>) => Object.entries(sources).map(([name, values]) => `${name} ${values.join(' ')}`).join('; ')

export const CSP_REPORT_ONLY = policy(CSP_SOURCES)

/**
 * `frame-ancestors` is ignored in a report-only policy, so it ships as its own
 * enforced header. Nothing legitimately frames this site.
 */
export const CSP_ENFORCED = "frame-ancestors 'self'"

/**
 * No feature of the site uses these. `fullscreen` stays for the BlueMap
 * embed, which asks for it with `allow="fullscreen"`.
 */
const DENIED_FEATURES = [
  'accelerometer',
'autoplay',
'bluetooth',
'camera',
'display-capture',
  'geolocation',
'gyroscope',
'hid',
'magnetometer',
'microphone',
'midi',
  'payment',
'serial',
'usb',
'xr-spatial-tracking'
]

export const PERMISSIONS_POLICY = [
  ...DENIED_FEATURES.map(feature => `${feature}=()`), 'fullscreen=(self "https://bluemap.onelitefeather.dev")'
].join(', ')

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': PERMISSIONS_POLICY,
  // Cloudflare adds this at the zone today; sent here so the app does not depend on that setting.
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': CSP_ENFORCED,
  'Content-Security-Policy-Report-Only': CSP_REPORT_ONLY
}
