import { describe, expect, it } from 'vitest'
import { deferUntilIdle, IDLE_FALLBACK_MS, IDLE_TIMEOUT_MS } from '../../layers/base/utils/deferUntilIdle'

/** Records what gets scheduled; each test decides when the callbacks run. */
function fakeHost(withIdleCallback: boolean) {
  const idle: Array<{ callback: () => void, timeout: number }> = []
  const timers: Array<{ callback: () => void, delay: number }> = []
  const host = {
    ...(withIdleCallback
      ? {
          requestIdleCallback: (callback: () => void, options: { timeout: number }) => {
            idle.push({ callback, timeout: options.timeout })
          },
        }
      : {}),
    setTimeout: (callback: () => void, delay: number) => {
      timers.push({ callback, delay })
    },
  }
  return { host, idle, timers }
}

describe('deferUntilIdle', () => {
  it('does not run the task synchronously', () => {
    const { host } = fakeHost(true)
    let runs = 0
    deferUntilIdle(() => { runs++ }, host)
    expect(runs, 'task must wait for idle time').toBe(0)
  })

  it('hands the task to requestIdleCallback with a timeout', () => {
    const { host, idle } = fakeHost(true)
    deferUntilIdle(() => {}, host)
    expect(idle, 'one idle request expected').toHaveLength(1)
    expect(idle[0]!.timeout, 'a busy page must still reach the task').toBe(IDLE_TIMEOUT_MS)
  })

  it('runs the task when the browser reports idle time', () => {
    const { host, idle } = fakeHost(true)
    let runs = 0
    deferUntilIdle(() => { runs++ }, host)
    idle[0]!.callback()
    expect(runs).toBe(1)
  })

  it('falls back to a timer when requestIdleCallback is missing', () => {
    const { host, timers } = fakeHost(false)
    deferUntilIdle(() => {}, host)
    expect(timers, 'one fallback timer expected').toHaveLength(1)
    expect(timers[0]!.delay).toBe(IDLE_FALLBACK_MS)
  })

  it('runs the task from the fallback timer', () => {
    const { host, timers } = fakeHost(false)
    let runs = 0
    deferUntilIdle(() => { runs++ }, host)
    timers[0]!.callback()
    expect(runs).toBe(1)
  })
})
