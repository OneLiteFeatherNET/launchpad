import { afterEach, describe, expect, it, vi } from 'vitest'
import { browserIdle, useArmedSlides, type IdleScheduler } from '../../layers/home/composables/useArmedSlides'

const manualIdle = () => {
  const jobs: Array<() => void> = []
  const cancelled: Array<() => void> = []
  const scheduler: IdleScheduler = (run) => {
    jobs.push(run)
    return () => { cancelled.push(run) }
  }
  const flush = () => jobs.splice(0).filter(job => !cancelled.includes(job)).forEach(job => job())
  return { scheduler, flush }
}

describe('useArmedSlides', () => {
  it('arms only the first slide at the start', () => {
    const slides = useArmedSlides(manualIdle().scheduler)
    expect([0,
1,
2].map(slides.isArmed)).toEqual([true,
false,
false])
  })

  it('arms the requested slide once the idle scheduler fires', () => {
    const idle = manualIdle()
    const slides = useArmedSlides(idle.scheduler)
    slides.armOnIdle(1)
    expect(slides.isArmed(1), 'not before idle').toBe(false)
    idle.flush()
    expect(slides.isArmed(1)).toBe(true)
  })

  it('arms a slide immediately when navigation asks for it before idle', () => {
    const idle = manualIdle()
    const slides = useArmedSlides(idle.scheduler)
    slides.armOnIdle(1)
    slides.arm(1)
    expect(slides.isArmed(1)).toBe(true)
  })

  it('keeps a slide armed', () => {
    const idle = manualIdle()
    const slides = useArmedSlides(idle.scheduler)
    slides.arm(2)
    slides.armOnIdle(3)
    idle.flush()
    expect(slides.isArmed(2)).toBe(true)
  })

  it('drops a pending idle arm when a newer one replaces it', () => {
    const idle = manualIdle()
    const slides = useArmedSlides(idle.scheduler)
    slides.armOnIdle(1)
    slides.armOnIdle(2)
    idle.flush()
    expect(slides.isArmed(1)).toBe(false)
    expect(slides.isArmed(2)).toBe(true)
  })

  it('drops a pending idle arm on dispose', () => {
    const idle = manualIdle()
    const slides = useArmedSlides(idle.scheduler)
    slides.armOnIdle(3)
    slides.dispose()
    idle.flush()
    expect(slides.isArmed(3)).toBe(false)
  })
})

describe('browserIdle', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('falls back to a timeout when requestIdleCallback is missing', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    const run = vi.fn()
    browserIdle(run)
    expect(run).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(run).toHaveBeenCalledOnce()
  })

  it('can be cancelled', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    const run = vi.fn()
    browserIdle(run)()
    vi.runAllTimers()
    expect(run).not.toHaveBeenCalled()
  })
})
