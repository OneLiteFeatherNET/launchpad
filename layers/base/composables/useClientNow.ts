import { inject, onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue'
import { CLIENT_CLOCK_KEY, systemClock } from '../utils/clientClock'

/**
 * The browser's current time in ms, ticking every `intervalMs`. It is `null`
 * during the server render and the hydration pass and only gets a value in
 * `onMounted`, so anything derived from it appears after hydration instead of
 * differing from the server's HTML.
 */
export function useClientNow(intervalMs = 1000): Readonly<Ref<number | null>> {
  const clock = inject(CLIENT_CLOCK_KEY, systemClock)
  const now = ref<number | null>(null)
  let stop: (() => void) | undefined

  onMounted(() => {
    now.value = clock.now()
    stop = clock.every(intervalMs, () => { now.value = clock.now() })
  })
  onBeforeUnmount(() => stop?.())

  return readonly(now)
}
