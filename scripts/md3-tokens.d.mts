export interface SchemePair {
  light: string
  dark: string
}

export const CORE_COLORS: Record<'primary' | 'secondary' | 'tertiary', string>
export const CUSTOM_COLORS: Record<string, string>
export const SCHEME_ROLES: Record<string, string>
export const START_MARKER: string
export const END_MARKER: string
export function generateTokens(
  core?: SeasonSeeds['core'],
  custom?: Record<string, string>,
  neutralChroma?: number,
): Record<string, SchemePair>
export function renderBlock(tokens?: Record<string, SchemePair>): string
export function currentBlock(css?: string): string | null

export interface SeasonSeeds {
  core: Record<'primary' | 'secondary' | 'tertiary', string>
  custom: Record<string, string>
  /** See `generateTokens`'s neutralChroma parameter; unset for most seasons. */
  neutralChroma?: number
}

export const SEASONS: Record<string, SeasonSeeds>
export const SEASONS_HEADER: string
export const BRIDGE_START: string
export const BRIDGE_END: string
export interface SeasonDeclarations {
  roles: Record<string, string>
  bridge: Record<string, string>
}

export function seasonDeclarations(id: string): SeasonDeclarations
export function renderSeasons(): string
