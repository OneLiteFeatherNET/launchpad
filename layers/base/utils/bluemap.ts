import type { BluemapCoordinates, BluemapDimension } from '../types'

// Spigot/Paper defaults; a server with other world names sets
// runtimeConfig.public.bluemapMapIds.
const DEFAULT_MAP_IDS: Record<BluemapDimension, string> = {
  overworld: 'world',
  nether: 'world_nether',
  end: 'world_the_end',
}

/**
 * Deep link that centres BlueMap's flat top-down view on a position. The web
 * client reads it from the URL hash:
 * `#<mapId>:<x>:<y>:<z>:<distance>:<angleX>:<angleZ>:<rotation>:<tilt>:<perspective>`.
 */
export function bluemapDeepLink(
  baseUrl: string,
  coordinates: BluemapCoordinates,
  mapIds: Partial<Record<BluemapDimension, string>> = {},
): string {
  const dimension = coordinates.dimension ?? 'overworld'
  const mapId = mapIds[dimension] || DEFAULT_MAP_IDS[dimension]
  const x = Math.round(coordinates.x)
  const y = Math.round(coordinates.y ?? 70)
  const z = Math.round(coordinates.z)
  return `${baseUrl.replace(/\/$/, '')}/#${mapId}:${x}:${y}:${z}:300:0:0:0:0:flat`
}
