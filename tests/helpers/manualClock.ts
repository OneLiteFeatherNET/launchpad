import type { ClientClock } from '../../layers/base/utils/clientClock'

export interface ManualClock extends ClientClock {
  /** Moves time forward and runs every registered tick once, synchronously. */
  advance: (ms: number) => void
  /** How many registered ticks have not been stopped. */
  activeTimers: () => number
}

export function manualClock(startMs: number): ManualClock {
  let current = startMs
  const ticks = new Set<() => void>()
  return {
    now: () => current,
    every: (_ms, tick) => {
      ticks.add(tick)
      return () => { ticks.delete(tick) }
    },
    advance: (ms) => {
      current += ms
      for (const tick of [...ticks]) tick()
    },
    activeTimers: () => ticks.size
  }
}
