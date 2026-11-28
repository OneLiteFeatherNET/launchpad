/**
 * Gives sub-requests the Worker's bindings.
 *
 * @nuxt/content refills an empty D1 database by fetching its dump through
 * `serverFetch`, which Nitro 3 runs as a fresh request without the
 * `cloudflare` runtime context. The dump handler then finds no ASSETS binding
 * and answers 404, so the first render of a new deploy fails. `env` from
 * `cloudflare:workers` is the same binding set the outer request carries.
 */
type Runtime = { cloudflare?: { env?: unknown } }
type RuntimeRequest = { runtime?: Runtime }

const specifier = 'cloudflare:workers'

export default defineNitroPlugin(async (nitroApp) => {
  const load = () => import(/* @vite-ignore */ specifier).then(m => m.env as unknown)
  const env = await load().catch(() => undefined)
  if (!env) return
  nitroApp.hooks.hook('request', (event) => {
    const req = event.req as unknown as RuntimeRequest
    if (req.runtime?.cloudflare?.env) return
    req.runtime = { ...req.runtime, cloudflare: { ...req.runtime?.cloudflare, env } }
  })
})
