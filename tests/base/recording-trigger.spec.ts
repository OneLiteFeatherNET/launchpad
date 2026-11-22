import { describe, expect, it } from 'vitest'
import {
  armRecordingTrigger,
  IDLE_AFTER_LOAD_MS,
  INTERACTION_EVENTS,
  startRecordingUnlessOptedOut,
  type RecordingTriggerPorts,
} from '../../layers/base/utils/recordingTrigger'

/** Fake event source, timers and idle scheduler; each test decides when anything fires. */
function fakePorts(options: { loaded?: boolean } = {}) {
  const listeners = new Map<string, Set<() => void>>()
  const timers = new Map<number, { callback: () => void, delay: number }>()
  const idles = new Map<number, { callback: () => void, timeout: number }>()
  let nextHandle = 1
  let starts = 0
  const ports: RecordingTriggerPorts = {
    target: {
      addEventListener: (type, handler) => {
        if (!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type)!.add(handler)
      },
      removeEventListener: (type, handler) => { listeners.get(type)?.delete(handler) },
    },
    isLoaded: () => options.loaded ?? false,
    schedule: {
      setTimeout: (callback, delay) => {
        const handle = nextHandle++
        timers.set(handle, { callback, delay })
        return handle
      },
      clearTimeout: (handle) => { timers.delete(handle as number) },
    },
    idle: {
      request: (callback, timeout) => {
        const handle = nextHandle++
        idles.set(handle, { callback, timeout })
        return handle
      },
      cancel: (handle) => { idles.delete(handle as number) },
    },
    start: () => { starts++ },
  }
  const emit = (type: string) => [...(listeners.get(type) ?? [])].forEach(handler => handler())
  const fireTimers = () => [...timers.values()].forEach(timer => timer.callback())
  const fireIdles = () => [...idles.values()].forEach(idle => idle.callback())
  const attached = () => [...listeners.values()].reduce((sum, set) => sum + set.size, 0)
  return { ports, emit, fireTimers, fireIdles, attached, timers, idles, starts: () => starts }
}

describe('armRecordingTrigger', () => {
  it('does not start when it is armed', () => {
    const fake = fakePorts()
    armRecordingTrigger(fake.ports)
    expect(fake.starts(), 'arming must only wait').toBe(0)
  })

  it.each(INTERACTION_EVENTS)('starts once on the first %s', (type) => {
    const fake = fakePorts()
    armRecordingTrigger(fake.ports)
    fake.emit(type)
    expect(fake.starts()).toBe(1)
  })

  it('removes every listener and timer after the first interaction', () => {
    const fake = fakePorts()
    armRecordingTrigger(fake.ports)
    fake.emit('pointerdown')
    expect(fake.attached(), 'listeners left behind').toBe(0)
    expect(fake.timers.size, 'timer left behind').toBe(0)
    expect(fake.idles.size, 'idle request left behind').toBe(0)
  })

  it('does not start a second time on later triggers', () => {
    const fake = fakePorts()
    armRecordingTrigger(fake.ports)
    fake.emit('keydown')
    fake.emit('scroll')
    fake.fireTimers()
    fake.fireIdles()
    expect(fake.starts()).toBe(1)
  })

  it('waits for the load event before it counts down the idle period', () => {
    const fake = fakePorts({ loaded: false })
    armRecordingTrigger(fake.ports)
    expect(fake.timers.size, 'timer before load').toBe(0)
    fake.emit('load')
    expect([...fake.timers.values()].map(timer => timer.delay)).toEqual([IDLE_AFTER_LOAD_MS])
  })

  it('counts down at once when the page has already loaded', () => {
    const fake = fakePorts({ loaded: true })
    armRecordingTrigger(fake.ports)
    expect([...fake.timers.values()].map(timer => timer.delay)).toEqual([IDLE_AFTER_LOAD_MS])
  })

  it('starts in the idle callback after the period, not at the period end', () => {
    const fake = fakePorts({ loaded: true })
    armRecordingTrigger(fake.ports)
    fake.fireTimers()
    expect(fake.starts(), 'must wait for real idle time').toBe(0)
    expect(fake.idles.size).toBe(1)
    fake.fireIdles()
    expect(fake.starts()).toBe(1)
    expect(fake.attached(), 'listeners left behind').toBe(0)
  })

  it('does not start when disposed before any trigger', () => {
    const fake = fakePorts({ loaded: true })
    const dispose = armRecordingTrigger(fake.ports)
    dispose()
    fake.emit('pointerdown')
    fake.fireTimers()
    fake.fireIdles()
    expect(fake.starts()).toBe(0)
    expect(fake.attached()).toBe(0)
    expect(fake.timers.size).toBe(0)
  })

  it('cancels a pending idle request when an interaction wins', () => {
    const fake = fakePorts({ loaded: true })
    armRecordingTrigger(fake.ports)
    fake.fireTimers()
    fake.emit('touchstart')
    expect(fake.starts()).toBe(1)
    expect(fake.idles.size).toBe(0)
  })
})

describe('startRecordingUnlessOptedOut', () => {
  function fakeClient(optedOut: boolean) {
    let starts = 0
    return {
      client: {
        has_opted_out_capturing: () => optedOut,
        startSessionRecording: () => { starts++ },
      },
      starts: () => starts,
    }
  }

  it('starts the recording when the visitor has not opted out', () => {
    const fake = fakeClient(false)
    startRecordingUnlessOptedOut(fake.client)
    expect(fake.starts()).toBe(1)
  })

  it('does not start the recording when the visitor has opted out', () => {
    const fake = fakeClient(true)
    startRecordingUnlessOptedOut(fake.client)
    expect(fake.starts(), 'opt-out must win over the trigger').toBe(0)
  })
})
