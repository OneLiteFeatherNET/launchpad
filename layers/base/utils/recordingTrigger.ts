export const INTERACTION_EVENTS = ['pointerdown',
'keydown',
'touchstart',
'scroll',
'wheel'] as const
/** Quiet period after `load` before idle time counts as a real session. */
export const IDLE_AFTER_LOAD_MS = 10_000
export const IDLE_TIMEOUT_MS = 4000

export interface RecordingTriggerPorts {
  target: {
    addEventListener: (type: string, handler: () => void, options?: AddEventListenerOptions) => void
    removeEventListener: (type: string, handler: () => void, options?: EventListenerOptions) => void
  }
  isLoaded: () => boolean
  schedule: {
    setTimeout: (callback: () => void, delay: number) => unknown
    clearTimeout: (handle: unknown) => void
  }
  idle: {
    request: (callback: () => void, timeout: number) => unknown
    cancel: (handle: unknown) => void
  }
  start: () => void
}

/** Starts once, on the first interaction or on idle time after load; returns a disposer. */
export function armRecordingTrigger(ports: RecordingTriggerPorts): () => void {
  const { target, schedule, idle } = ports
  let timer: unknown
  let idleHandle: unknown
  let done = false
  const options = { capture: true, passive: true }

  const dispose = () => {
    done = true
    for (const type of INTERACTION_EVENTS) target.removeEventListener(type, fire, options)
    target.removeEventListener('load', afterLoad)
    if (timer !== undefined) schedule.clearTimeout(timer)
    if (idleHandle !== undefined) idle.cancel(idleHandle)
    timer = idleHandle = undefined
  }
  function fire() {
    if (done) return
    dispose()
    ports.start()
  }
  function afterLoad() {
    target.removeEventListener('load', afterLoad)
    if (done) return
    timer = schedule.setTimeout(() => {
      timer = undefined
      idleHandle = idle.request(fire, IDLE_TIMEOUT_MS)
    }, IDLE_AFTER_LOAD_MS)
  }

  for (const type of INTERACTION_EVENTS) target.addEventListener(type, fire, options)
  if (ports.isLoaded()) afterLoad()
  else target.addEventListener('load', afterLoad)
  return dispose
}

interface RecordingClient {
  has_opted_out_capturing: () => boolean
  startSessionRecording: () => void
}

/** Consent stays in charge: a visitor who opted out is never recorded. */
export function startRecordingUnlessOptedOut(client: RecordingClient): void {
  if (!client.has_opted_out_capturing()) client.startSessionRecording()
}
