import { describe, expect, it } from 'vitest'
import { DEFAULTS, sanitize } from './settings'

describe('sanitize', () => {
  it('keeps valid values', () => {
    const s = sanitize({ ...DEFAULTS, hz: 7_100_000, plan: 'us', cls: 'G', group: 'VHF', theme: 'dark' })
    expect(s.hz).toBe(7_100_000)
    expect(s.plan).toBe('us')
    expect(s.cls).toBe('G')
    expect(s.group).toBe('VHF')
    expect(s.theme).toBe('dark')
  })
  it('replaces garbage with defaults', () => {
    const s = sanitize({ hz: -4, plan: 'mars', cls: 'Z', k: 7, vfId: 'nope', fUnit: 'THz', onlyMine: 'yes' })
    expect(s.hz).toBe(DEFAULTS.hz)
    expect(s.plan).toBe(DEFAULTS.plan)
    expect(s.cls).toBe('any')
    expect(s.k).toBe(DEFAULTS.k)
    expect(s.vfId).toBe('free')
    expect(s.fUnit).toBe('MHz')
    expect(s.onlyMine).toBe(false)
  })
  it('survives null and non-objects', () => {
    expect(sanitize(null).hz).toBe(DEFAULTS.hz)
    expect(sanitize('x').plan).toBe(DEFAULTS.plan)
  })
})
