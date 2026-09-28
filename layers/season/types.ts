/**
 * A seasonal costume: a named look the site puts on for a fixed part of the
 * year and takes off again on its own. The colours are not part of this — they
 * are generated per season id into assets/css/seasons.css and switched on by
 * `data-season` on <html>.
 */

/** A day in the year, independent of the year. 1-based, like a calendar. */
export interface SeasonDay {
  /** 1 = January, 12 = December. */
  month: number
  /** 1–31. */
  day: number
}

export interface Season {
  /**
   * Reaches the DOM as `data-season` and the stylesheet as an attribute
   * selector, so it stays lowercase and hyphenated. Must match a key of
   * `SEASONS` in scripts/md3-tokens.mjs.
   */
  id: string
  /** First day in effect, inclusive. */
  start: SeasonDay
  /** Last day in effect, inclusive. Before `start` means the window wraps the year end. */
  end: SeasonDay
  /** Whether the decoration overlay renders. */
  decor: boolean
  /**
   * Browser-chrome colour per scheme. Mirrors the season's `--color-surface`
   * in assets/css/seasons.css; a test holds the two together.
   */
  themeColor: { light: string, dark: string }
  /** Header logo, relative to `public/` as NuxtImg expects it. */
  logo: string
  /** Favicon, as an absolute path. */
  favicon: string
}

/** The season in effect. `null` for most of the year: no attribute, no overrides. */
export type ActiveSeason = Season | null
