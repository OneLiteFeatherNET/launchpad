import type { PostHog } from 'posthog-js'

type Call = (client: PostHog) => void

/**
 * Stands in for the PostHog client while posthog-js is not loaded yet. Calls
 * are replayed in order once `attach` hands over the real client, so an opt-out
 * queued first still runs before any capture.
 */
export function createLazyPostHog() {
  const queue: Call[] = []
  let real: PostHog | undefined
  let optedOut = false

  const run = (call: Call) => {
    if (real) call(real)
    else queue.push(call)
  }

  const client = {
    capture: (...args: Parameters<PostHog['capture']>) => run(c => c.capture(...args)),
    opt_in_capturing: () => {
      optedOut = false
      run(c => c.opt_in_capturing())
    },
    opt_out_capturing: () => {
      optedOut = true
      run(c => c.opt_out_capturing())
    },
    has_opted_out_capturing: () => (real ? real.has_opted_out_capturing() : optedOut),
    startSessionRecording: () => run(c => c.startSessionRecording()),
  }

  function attach(loaded: PostHog) {
    real = loaded
    for (const call of queue.splice(0)) call(loaded)
  }

  return { client, attach }
}

export type LazyPostHog = ReturnType<typeof createLazyPostHog>['client']
