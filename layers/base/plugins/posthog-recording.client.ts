// Recording is off at init (nuxt.config.ts); the recorder loads on the first interaction
// or on idle time after load, never during page load. Opt-out is checked before the start.
export default defineNuxtPlugin(() => {
  const { $clientPosthog } = useNuxtApp()
  if (!$clientPosthog) return
  armRecordingTrigger({
    target: window,
    isLoaded: () => document.readyState === 'complete',
    schedule: {
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      clearTimeout: handle => window.clearTimeout(handle as number),
    },
    idle: {
      request: (callback, timeout) => typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(callback, { timeout })
        : window.setTimeout(callback, timeout / 2),
      cancel: handle => typeof window.cancelIdleCallback === 'function'
        ? window.cancelIdleCallback(handle as number)
        : window.clearTimeout(handle as number),
    },
    start: () => startRecordingUnlessOptedOut($clientPosthog),
  })
})
