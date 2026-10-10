// Recording is off at init (nuxt.config.ts) so the recorder loads after first paint.
// startSessionRecording still honours opt-out and the remote sampling/flag settings.
export default defineNuxtPlugin(() => {
  const { $clientPosthog } = useNuxtApp()
  if (!$clientPosthog) return
  deferUntilIdle(() => $clientPosthog.startSessionRecording(), window)
})
