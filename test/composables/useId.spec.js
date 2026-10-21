import { describe, it, expect } from 'vitest'
import { useId } from '../../src/composables/useId.js'

describe('useId', () => {
  it('returns a prefixed id', () => {
    expect(useId('field')).toMatch(/^field-\d+$/)
  })

  it('never returns the same id twice', () => {
    const ids = new Set(Array.from({ length: 50 }, () => useId('x')))
    expect(ids.size).toBe(50)
  })

  it('falls back to the "au" prefix when none is given', () => {
    expect(useId()).toMatch(/^au-\d+$/)
  })
})
