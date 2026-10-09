import { describe, expect, it } from 'vitest'
import {
  allowedIntervals, findBand, findSegment, lookup, notableAt, PLAN_IDS, PLANS, usCanOperate,
} from './bands'

const MHz = (x: number) => Math.round(x * 1e6)

describe('band plan data integrity', () => {
  for (const id of PLAN_IDS) {
    it(`${id}: segments are contiguous, ordered and inside the band`, () => {
      for (const b of PLANS[id]) {
        expect(b.hi).toBeGreaterThan(b.lo)
        expect(b.segments[0].lo).toBe(b.lo)
        expect(b.segments[b.segments.length - 1].hi).toBe(b.hi)
        for (let i = 1; i < b.segments.length; i++) expect(b.segments[i].lo).toBe(b.segments[i - 1].hi)
        for (const s of b.segments) expect(s.hi).toBeGreaterThan(s.lo)
      }
    })
    it(`${id}: bands do not overlap`, () => {
      const bands = [...PLANS[id]].sort((a, b) => a.lo - b.lo)
      for (let i = 1; i < bands.length; i++) expect(bands[i].lo).toBeGreaterThan(bands[i - 1].hi)
    })
  }
})

describe('official band edges', () => {
  const edge = (plan: 'r1' | 'r2' | 'r3' | 'us', id: string) => {
    const b = PLANS[plan].find((x) => x.id === id)!
    return [b.lo / 1e6, b.hi / 1e6]
  }
  it('20 m is 14.000-14.350 everywhere', () => {
    for (const p of PLAN_IDS) expect(edge(p, '20m')).toEqual([14.0, 14.35])
  })
  it('40 m differs by region', () => {
    expect(edge('r1', '40m')).toEqual([7.0, 7.2])
    expect(edge('us', '40m')).toEqual([7.0, 7.3])
    expect(edge('r3', '40m')).toEqual([7.0, 7.2])
  })
  it('2 m and 70 cm', () => {
    expect(edge('r1', '2m')).toEqual([144, 146])
    expect(edge('us', '2m')).toEqual([144, 148])
    expect(edge('r3', '2m')).toEqual([144, 148])
    expect(edge('r1', '70cm')).toEqual([430, 440])
    expect(edge('us', '70cm')).toEqual([420, 450])
  })
  it('1.25 m exists only in the Americas', () => {
    expect(findBand('r1', MHz(223))).toBeUndefined()
    expect(findBand('us', MHz(223))?.id).toBe('1.25m')
    expect(findBand('r2', MHz(223))?.id).toBe('1.25m')
  })
})

describe('lookup', () => {
  it('14.074 MHz is FT8 territory on 20 m digital', () => {
    for (const p of PLAN_IDS) {
      const l = lookup(p, MHz(14.074))
      expect(l.band?.id).toBe('20m')
      expect(l.segment?.mode).toBe('digital')
    }
  })
  it('14.2 MHz is phone', () => {
    expect(lookup('r1', MHz(14.2)).segment?.mode).toBe('phone')
  })
  it('reports neighbours outside any band', () => {
    const l = lookup('r1', MHz(12))
    expect(l.band).toBeUndefined()
    expect(l.below?.id).toBe('30m')
    expect(l.above?.id).toBe('20m')
    expect(lookup('r1', MHz(7.25)).band).toBeUndefined()
    expect(lookup('us', MHz(7.25)).band?.id).toBe('40m')
  })
  it('band upper edge is inclusive', () => {
    const b = findBand('r1', MHz(14.35))!
    expect(findSegment(b, MHz(14.35))?.mode).toBe('phone')
    expect(findBand('r1', MHz(14.350001))).toBeUndefined()
  })
  it('US 13 cm has a hole at 2310-2390', () => {
    expect(lookup('us', MHz(2350)).segment?.mode).toBe('none')
    expect(usCanOperate(MHz(2350), 'E').allowed).toBe(false)
  })
})

describe('US license privileges', () => {
  it('Extra may use everything in the band plan', () => {
    for (const f of [1.9, 3.55, 3.7, 7.1, 14.05, 14.2, 21.1, 28.5, 146.52, 446]) {
      expect(usCanOperate(MHz(f), 'E').allowed).toBe(true)
    }
  })
  it('General on 20 m: CW/digital from 14.025, phone from 14.225', () => {
    expect(usCanOperate(MHz(14.074), 'G').allowed).toBe(true)
    expect(usCanOperate(MHz(14.01), 'G').allowed).toBe(false)
    expect(usCanOperate(MHz(14.2), 'G').allowed).toBe(false)
    expect(usCanOperate(MHz(14.25), 'G').allowed).toBe(true)
  })
  it('General on 75/80 m phone only from 3.800', () => {
    expect(usCanOperate(MHz(3.7), 'G').allowed).toBe(false)
    expect(usCanOperate(MHz(3.85), 'G').allowed).toBe(true)
    expect(usCanOperate(MHz(3.7), 'E').allowed).toBe(true)
  })
  it('Technician: CW on 80/40/15, 10 m up to 28.5, none on 20 m', () => {
    expect(usCanOperate(MHz(3.55), 'T').allowed).toBe(true)
    expect(usCanOperate(MHz(7.05), 'T').allowed).toBe(true)
    expect(usCanOperate(MHz(21.05), 'T').allowed).toBe(true)
    expect(usCanOperate(MHz(14.05), 'T').allowed).toBe(false)
    expect(usCanOperate(MHz(28.4), 'T').allowed).toBe(true)
    expect(usCanOperate(MHz(28.6), 'T').allowed).toBe(false)
    expect(usCanOperate(MHz(1.9), 'T').allowed).toBe(false)
  })
  it('Technician has full privileges from 50 MHz up', () => {
    for (const f of [50.2, 146.52, 223.5, 446, 927, 1296.1, 2400]) expect(usCanOperate(MHz(f), 'T').allowed).toBe(true)
  })
  it('Technician digital on 10 m 28.0-28.3 is allowed, on 80 m is not', () => {
    expect(usCanOperate(MHz(28.074), 'T').allowed).toBe(true)
    expect(usCanOperate(MHz(3.65), 'T').allowed).toBe(false)
    expect(usCanOperate(MHz(3.58), 'T').modes).toEqual(['cw'])
    expect(usCanOperate(MHz(3.58), 'G').modes).toEqual(['cw', 'digital'])
    expect(usCanOperate(MHz(14.3), 'E').modes).toEqual(['all'])
  })
  it('allowedIntervals clips a segment to privileges', () => {
    const b = findBand('us', MHz(14.1))!
    const digital = b.segments.find((s) => s.mode === 'digital')!
    expect(allowedIntervals(b, digital, 'G')).toEqual([[MHz(14.07), MHz(14.15)]])
    expect(allowedIntervals(b, digital, 'T')).toEqual([])
    const cw = b.segments[0]
    expect(allowedIntervals(b, cw, 'G')).toEqual([[MHz(14.025), MHz(14.07)]])
    expect(allowedIntervals(b, cw, 'E')).toEqual([[cw.lo, cw.hi]])
  })
})

describe('notable frequencies', () => {
  it('finds FT8 and honours region filters', () => {
    expect(notableAt(MHz(14.074), 'us').map((n) => n.label)).toContain('FT8')
    expect(notableAt(MHz(146.52), 'us')[0].label).toBe('FM calling')
    expect(notableAt(MHz(146.52), 'r1')).toEqual([])
    expect(notableAt(MHz(145.5), 'r1')[0].label).toBe('FM calling')
  })
})
