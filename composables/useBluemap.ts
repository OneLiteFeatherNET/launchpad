// Simple composable to provide the BlueMap URL from runtime config
// Falls back to environment variable NUXT_PUBLIC_BLUEMAP_URL if present
// Usage: const bluemapUrl = useBluemapUrl()
export const useBluemapUrl = (): string => {
  const runtimeConfig = useRuntimeConfig();
  // Prefer runtimeConfig.public but allow an env override as safety net
  const envUrl = (process?.env?.NUXT_PUBLIC_BLUEMAP_URL as string | undefined);
  return (runtimeConfig.public?.bluemapUrl as string | undefined)
    || envUrl
    || 'https://bluemap.onelitefeather.dev/';
};

export type BluemapDimension = 'overworld' | 'nether' | 'end'

interface BluemapDeepLinkInput {
  x: number
  y?: number
  z: number
  dimension?: BluemapDimension
  /** Camera distance from the target; bigger = zoomed out. */
  distance?: number
  /** Force the flat/top-down view; defaults to true so a POI lands centered. */
  flat?: boolean
}

const DEFAULT_MAP_IDS: Record<BluemapDimension, string> = {
  overworld: 'world',
  nether: 'world_nether',
  end: 'world_the_end'
}

/**
 * Build a BlueMap deep-link URL with a coordinate-anchored hash.
 *
 * BlueMap's web client reads the URL hash to position the camera on load:
 * `#<mapId>:<x>:<y>:<z>:<distance>:<angleX>:<angleZ>:<rotation>:<tilt>:<perspective>`.
 * Map IDs are server-specific; the defaults below match the common Spigot/Paper
 * world names and can be overridden via `runtimeConfig.public.bluemapMapIds`.
 */
export const useBluemapDeepLink = (input: BluemapDeepLinkInput): string => {
  const base = useBluemapUrl()
  const runtimeConfig = useRuntimeConfig()
  const configured = (runtimeConfig.public?.bluemapMapIds || {}) as Partial<
    Record<BluemapDimension, string>
  >
  const dimension = input.dimension ?? 'overworld'
  const mapId = configured[dimension] || DEFAULT_MAP_IDS[dimension]

  const x = Math.round(input.x)
  const y = Math.round(input.y ?? 70)
  const z = Math.round(input.z)
  const distance = Math.round(input.distance ?? 300)
  const perspective = (input.flat ?? true) ? 'flat' : 'free'

  const hash = `#${mapId}:${x}:${y}:${z}:${distance}:0:0:0:0:${perspective}`

  // Strip a trailing slash so the hash sits cleanly after the host.
  const baseClean = base.endsWith('/') ? base.slice(0, -1) : base
  return `${baseClean}/${hash}`
}
