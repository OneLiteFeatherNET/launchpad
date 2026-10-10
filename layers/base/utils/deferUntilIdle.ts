export const IDLE_TIMEOUT_MS = 4000
export const IDLE_FALLBACK_MS = 2000

/** The two schedulers the task may use; injected so tests need no browser. */
export interface IdleHost {
  requestIdleCallback?: (callback: () => void, options: { timeout: number }) => unknown
  setTimeout: (callback: () => void, delay: number) => unknown
}

/** The timeout keeps a busy page from postponing the task indefinitely. */
export function deferUntilIdle(task: () => void, host: IdleHost): void {
  if (host.requestIdleCallback) {
    host.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS })
    return
  }
  host.setTimeout(task, IDLE_FALLBACK_MS)
}
