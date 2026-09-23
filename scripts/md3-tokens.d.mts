export interface SchemePair {
  light: string
  dark: string
}

export const CORE_COLORS: Record<'primary' | 'secondary' | 'tertiary', string>
export const CUSTOM_COLORS: Record<string, string>
export const SCHEME_ROLES: Record<string, string>
export const START_MARKER: string
export const END_MARKER: string
export function generateTokens(): Record<string, SchemePair>
export function renderBlock(tokens?: Record<string, SchemePair>): string
export function currentBlock(css?: string): string | null
