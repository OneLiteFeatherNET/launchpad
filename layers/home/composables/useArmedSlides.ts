import { reactive } from 'vue'

/** Runs `run` once the browser is idle and returns a cancel function. */
export type IdleScheduler = (run: () => void) => () => void

export const browserIdle: IdleScheduler = (run) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(run)
    return () => cancelIdleCallback(id)
  }
  const id = setTimeout(run, 200)
  return () => clearTimeout(id)
}

/**
 * Tracks which carousel slides may render their image. Slide 0 is armed from
 * the start (it is the LCP image); the others are armed on idle or on demand,
 * and stay armed.
 */
export function useArmedSlides(idle: IdleScheduler = browserIdle) {
  const armed = reactive(new Set<number>([0]))
  let cancel: (() => void) | null = null

  const isArmed = (index: number) => armed.has(index)
  const arm = (index: number) => { armed.add(index) }

  const armOnIdle = (index: number) => {
    cancel?.()
    cancel = idle(() => {
      cancel = null
      arm(index)
    })
  }

  const dispose = () => {
    cancel?.()
    cancel = null
  }

  return { isArmed, arm, armOnIdle, dispose }
}
