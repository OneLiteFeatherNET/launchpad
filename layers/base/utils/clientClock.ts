import type { InjectionKey } from 'vue'

/**
 * The browser's clock, behind a port so a test can drive time by hand
 * instead of waiting for it (see tests/helpers/manualClock.ts).
 */
export interface ClientClock {
  now: () => number
  /** Calls `tick` every `ms`; the returned function stops it. */
  every: (ms: number, tick: () => void) => () => void
}

export const CLIENT_CLOCK_KEY: InjectionKey<ClientClock> = Symbol('client-clock')

export const systemClock: ClientClock = {
  now: () => Date.now(),
  every: (ms, tick) => {
    const id = setInterval(tick, ms)
    return () => clearInterval(id)
  }
}
