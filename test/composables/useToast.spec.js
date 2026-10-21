// WCAG 2.2.1 Timing Adjustable: urgent toasts never vanish on their own, and
// every auto-closing toast gets at least the configured minimum.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast, configureToast } from '../../src/composables/useToast.js'

describe('useToast timing', () => {
  const toast = useToast()

  beforeEach(() => {
    vi.useFakeTimers()
    configureToast()
  })
  afterEach(() => {
    toast.toasts.splice(0).forEach((t) => toast.dismiss(t.id))
    configureToast()
    vi.useRealTimers()
  })

  const alive = (id) => toast.toasts.some((t) => t.id === id)

  it('danger and warning stay until dismissed when no duration is given', () => {
    const danger = toast.danger('Failed.')
    const warning = toast.warning('Careful.')
    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(alive(danger)).toBe(true)
    expect(alive(warning)).toBe(true)
  })

  it('info and success last 10 s by default', () => {
    const id = toast.success('Saved.')
    vi.advanceTimersByTime(9999)
    expect(alive(id)).toBe(true)
    vi.advanceTimersByTime(1)
    expect(alive(id)).toBe(false)
  })

  it('raises a shorter explicit duration to the minimum', () => {
    const id = toast.info('FYI.', { duration: 2000 })
    vi.advanceTimersByTime(5000)
    expect(alive(id)).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(alive(id)).toBe(false)
  })

  it('an explicit duration still auto-closes an urgent toast (opt-in)', () => {
    const id = toast.danger('Failed.', { duration: 15000 })
    vi.advanceTimersByTime(15000)
    expect(alive(id)).toBe(false)
  })

  it('duration 0 never auto-closes', () => {
    const id = toast.info('FYI.', { duration: 0 })
    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(alive(id)).toBe(true)
  })

  it('configureToast({ duration: 0 }) turns auto-closing off app-wide', () => {
    configureToast({ duration: 0 })
    const id = toast.success('Saved.')
    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(alive(id)).toBe(true)
  })

  it('configureToast changes duration and minimum, and resets with no argument', () => {
    expect(configureToast({ duration: 20000, minDuration: 15000 })).toEqual({ duration: 20000, minDuration: 15000 })
    const id = toast.info('FYI.', { duration: 1000 })
    vi.advanceTimersByTime(14999)
    expect(alive(id)).toBe(true)
    vi.advanceTimersByTime(1)
    expect(alive(id)).toBe(false)
    expect(configureToast()).toEqual({ duration: 10000, minDuration: 10000 })
  })

  it('rejects invalid settings', () => {
    expect(() => configureToast({ duration: -1 })).toThrow(TypeError)
    expect(() => configureToast({ minDuration: '5s' })).toThrow(TypeError)
  })

  it('pause/resume still stop the clock', () => {
    const id = toast.info('FYI.')
    vi.advanceTimersByTime(5000)
    toast.pause(id)
    vi.advanceTimersByTime(60000)
    expect(alive(id)).toBe(true)
    toast.resume(id)
    vi.advanceTimersByTime(5000)
    expect(alive(id)).toBe(false)
  })
})
