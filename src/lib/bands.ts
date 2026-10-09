/**
 * Amateur band plans, simplified from the IARU Region 1/2/3 band plans and the ARRL/FCC
 * plan for the United States. Frequencies are stored in Hz. Mode segments are the
 * conventional (voluntary) usage; license privileges are the legal limits (US only).
 */
export type Mode = 'cw' | 'digital' | 'phone' | 'all' | 'beacon' | 'satellite' | 'fm' | 'repeater' | 'eme' | 'none'
export type PlanId = 'r1' | 'r2' | 'r3' | 'us'
export type LicenseClass = 'T' | 'G' | 'E'
export type Group = 'HF' | 'VHF' | 'UHF' | 'Microwave'

export const PLAN_IDS: PlanId[] = ['r1', 'r2', 'r3', 'us']
export const GROUPS: Group[] = ['HF', 'VHF', 'UHF', 'Microwave']
export const CLASSES: LicenseClass[] = ['T', 'G', 'E']
export const MODES: Mode[] = ['cw', 'digital', 'phone', 'all', 'beacon', 'satellite', 'fm', 'repeater', 'eme', 'none']

export interface Segment {
  lo: number
  hi: number
  mode: Mode
}
export interface Band {
  id: string
  lo: number
  hi: number
  group: Group
  segments: Segment[]
}

const hz = (mhz: number) => Math.round(mhz * 1e6)

export function groupOf(f: number): Group {
  if (f < 30e6) return 'HF'
  if (f < 300e6) return 'VHF'
  if (f < 1300e6) return 'UHF'
  return 'Microwave'
}

/** Builds a band from a start frequency and consecutive [upper edge, mode] pairs (MHz). */
function seq(id: string, lo: number, edges: [number, Mode][]): Band {
  let prev = lo
  const segments: Segment[] = []
  for (const [hi, mode] of edges) {
    segments.push({ lo: hz(prev), hi: hz(hi), mode })
    prev = hi
  }
  return { id, lo: hz(lo), hi: hz(prev), group: groupOf(hz(lo)), segments }
}

/** Returns a copy of `b` extended up to `hi` MHz with one more segment. */
function extend(b: Band, hi: number, mode: Mode): Band {
  return { ...b, hi: hz(hi), segments: [...b.segments, { lo: b.hi, hi: hz(hi), mode }] }
}

const all = (id: string, lo: number, hi: number) => seq(id, lo, [[hi, 'all']])

/** Microwave allocations shared by Regions 1 and 3. */
const MICRO_R1: Band[] = [
  all('13cm', 2300, 2450),
  all('9cm', 3400, 3475),
  all('6cm', 5650, 5850),
  all('3cm', 10000, 10500),
  all('1.2cm', 24000, 24250),
  all('6mm', 47000, 47200),
  all('4mm', 76000, 81500),
  all('2.5mm', 122250, 123000),
  all('2mm', 134000, 141000),
  all('1mm', 241000, 250000),
]

const R1_BANDS: Band[] = [
  seq('160m', 1.81, [[1.838, 'cw'], [1.843, 'digital'], [2.0, 'phone']]),
  seq('80m', 3.5, [[3.57, 'cw'], [3.6, 'digital'], [3.8, 'phone']]),
  all('60m', 5.3515, 5.3665),
  seq('40m', 7.0, [[7.04, 'cw'], [7.06, 'digital'], [7.2, 'phone']]),
  seq('30m', 10.1, [[10.13, 'cw'], [10.15, 'digital']]),
  seq('20m', 14.0, [[14.07, 'cw'], [14.099, 'digital'], [14.101, 'beacon'], [14.35, 'phone']]),
  seq('17m', 18.068, [[18.095, 'cw'], [18.109, 'digital'], [18.111, 'beacon'], [18.168, 'phone']]),
  seq('15m', 21.0, [[21.07, 'cw'], [21.149, 'digital'], [21.151, 'beacon'], [21.45, 'phone']]),
  seq('12m', 24.89, [[24.915, 'cw'], [24.929, 'digital'], [24.931, 'beacon'], [24.99, 'phone']]),
  seq('10m', 28.0, [[28.07, 'cw'], [28.19, 'digital'], [28.225, 'beacon'], [29.2, 'phone'], [29.3, 'digital'], [29.51, 'satellite'], [29.7, 'fm']]),
  seq('6m', 50.0, [[50.1, 'cw'], [50.3, 'phone'], [50.4, 'digital'], [50.5, 'beacon'], [52.0, 'all']]),
  seq('4m', 70.0, [[70.1, 'beacon'], [70.3, 'phone'], [70.5, 'all']]),
  seq('2m', 144.0, [
    [144.15, 'eme'], [144.4, 'phone'], [144.491, 'beacon'], [144.794, 'all'], [144.99, 'digital'],
    [145.194, 'repeater'], [145.594, 'fm'], [145.806, 'repeater'], [146.0, 'satellite'],
  ]),
  seq('70cm', 430.0, [
    [432.0, 'all'], [432.1, 'eme'], [432.4, 'phone'], [432.5, 'beacon'], [433.0, 'all'],
    [433.4, 'repeater'], [434.6, 'fm'], [435.0, 'digital'], [438.0, 'satellite'], [440.0, 'repeater'],
  ]),
  seq('23cm', 1240, [
    [1260, 'all'], [1270, 'satellite'], [1290, 'repeater'], [1296, 'all'], [1296.15, 'eme'],
    [1296.4, 'phone'], [1296.8, 'beacon'], [1300, 'all'],
  ]),
  ...MICRO_R1,
]

const R3_BANDS: Band[] = R1_BANDS.filter((b) => b.id !== '60m' && b.id !== '4m').map((b) => {
  if (b.id === '80m') return extend(b, 3.9, 'phone')
  if (b.id === '160m') return { ...b, lo: hz(1.8), segments: [{ lo: hz(1.8), hi: b.segments[0].lo, mode: 'cw' as Mode }, ...b.segments] }
  if (b.id === '6m') return extend(b, 54.0, 'all')
  if (b.id === '2m') return extend(b, 148.0, 'all')
  return b
})

const US_MICRO: Band[] = [
  seq('13cm', 2300, [[2310, 'all'], [2390, 'none'], [2450, 'all']]),
  all('9cm', 3300, 3500),
  all('6cm', 5650, 5925),
  all('3cm', 10000, 10500),
  all('1.2cm', 24000, 24250),
  all('6mm', 47000, 47200),
  all('4mm', 75500, 81000),
  all('2.5mm', 122250, 123000),
  all('2mm', 134000, 141000),
  all('1mm', 241000, 250000),
]

const US_BANDS: Band[] = [
  seq('160m', 1.8, [[1.84, 'cw'], [1.86, 'digital'], [2.0, 'phone']]),
  seq('80m', 3.5, [[3.57, 'cw'], [3.6, 'digital'], [4.0, 'phone']]),
  all('60m', 5.3305, 5.4035),
  seq('40m', 7.0, [[7.04, 'cw'], [7.125, 'digital'], [7.3, 'phone']]),
  seq('30m', 10.1, [[10.13, 'cw'], [10.15, 'digital']]),
  seq('20m', 14.0, [[14.07, 'cw'], [14.15, 'digital'], [14.35, 'phone']]),
  seq('17m', 18.068, [[18.1, 'cw'], [18.11, 'digital'], [18.168, 'phone']]),
  seq('15m', 21.0, [[21.07, 'cw'], [21.2, 'digital'], [21.45, 'phone']]),
  seq('12m', 24.89, [[24.92, 'cw'], [24.93, 'digital'], [24.99, 'phone']]),
  seq('10m', 28.0, [[28.07, 'cw'], [28.19, 'digital'], [28.3, 'beacon'], [29.3, 'phone'], [29.51, 'satellite'], [29.7, 'fm']]),
  seq('6m', 50.0, [
    [50.1, 'cw'], [50.3, 'phone'], [50.6, 'all'], [50.8, 'digital'], [51.1, 'all'], [52.0, 'repeater'],
    [53.5, 'fm'], [54.0, 'repeater'],
  ]),
  seq('2m', 144.0, [
    [144.1, 'eme'], [144.275, 'phone'], [144.3, 'beacon'], [144.5, 'satellite'], [144.6, 'all'],
    [144.9, 'repeater'], [145.1, 'fm'], [145.2, 'all'], [145.5, 'repeater'], [145.8, 'all'],
    [146.0, 'satellite'], [146.4, 'repeater'], [146.6, 'fm'], [147.4, 'repeater'], [147.6, 'fm'],
    [148.0, 'repeater'],
  ]),
  seq('1.25m', 222.0, [[222.15, 'eme'], [222.25, 'phone'], [223.38, 'repeater'], [223.64, 'fm'], [225.0, 'repeater']]),
  seq('70cm', 420.0, [
    [432.0, 'all'], [432.1, 'eme'], [432.3, 'phone'], [432.4, 'beacon'], [435.0, 'all'],
    [438.0, 'satellite'], [442.0, 'all'], [445.0, 'repeater'], [447.0, 'fm'], [450.0, 'repeater'],
  ]),
  all('33cm', 902, 928),
  seq('23cm', 1240, [
    [1260, 'all'], [1270, 'satellite'], [1295, 'repeater'], [1297, 'eme'], [1300, 'digital'],
  ]),
  ...US_MICRO,
]

const R2_BANDS: Band[] = US_BANDS.map((b) => (b.id === '13cm' ? all('13cm', 2300, 2450) : b))

export const PLANS: Record<PlanId, Band[]> = { r1: R1_BANDS, r2: R2_BANDS, r3: R3_BANDS, us: US_BANDS }

// ---- US license privileges (47 CFR 97.301-97.305), Technician / General / Amateur Extra ----

export type PrivMode = 'cw' | 'digital' | 'phone' | 'all'
interface Priv {
  lo: number
  hi: number
  modes: PrivMode[]
}
const P = (lo: number, hi: number, ...modes: PrivMode[]): Priv => ({ lo: hz(lo), hi: hz(hi), modes })

/** Privileges below the Extra class. Bands not listed on VHF and above are open to every class. */
const US_PRIVS: Record<string, Partial<Record<LicenseClass, Priv[]>>> = {
  '160m': { G: [P(1.8, 2.0, 'all')] },
  '80m': { T: [P(3.525, 3.6, 'cw')], G: [P(3.525, 3.6, 'cw', 'digital'), P(3.8, 4.0, 'phone')] },
  '60m': { G: [P(5.3305, 5.4035, 'all')] },
  '40m': { T: [P(7.025, 7.125, 'cw')], G: [P(7.025, 7.125, 'cw', 'digital'), P(7.175, 7.3, 'phone')] },
  '30m': { G: [P(10.1, 10.15, 'cw', 'digital')] },
  '20m': { G: [P(14.025, 14.15, 'cw', 'digital'), P(14.225, 14.35, 'phone')] },
  '17m': { G: [P(18.068, 18.168, 'all')] },
  '15m': { T: [P(21.025, 21.2, 'cw')], G: [P(21.025, 21.2, 'cw', 'digital'), P(21.275, 21.45, 'phone')] },
  '12m': { G: [P(24.89, 24.99, 'all')] },
  '10m': { T: [P(28.0, 28.3, 'cw', 'digital'), P(28.3, 28.5, 'cw', 'phone')], G: [P(28.0, 29.7, 'all')] },
}

export function usPrivileges(band: Band, cls: LicenseClass): Priv[] {
  const full = [{ lo: band.lo, hi: band.hi, modes: ['all' as PrivMode] }]
  if (cls === 'E') return full
  const entry = US_PRIVS[band.id]
  if (!entry) return band.group === 'HF' ? [] : full
  // General includes everything Technician has; the tables list each class in full.
  return entry[cls] ?? []
}

/** Sub-ranges of `seg` where a US operator of class `cls` has any privileges (maybe only some modes). */
export function allowedIntervals(band: Band, seg: Segment, cls: LicenseClass): [number, number][] {
  if (seg.mode === 'none') return []
  const out: [number, number][] = []
  for (const p of usPrivileges(band, cls)) {
    const lo = Math.max(p.lo, seg.lo)
    const hi = Math.min(p.hi, seg.hi)
    if (hi > lo) out.push([lo, hi])
  }
  return out
}

export function findBand(plan: PlanId, f: number): Band | undefined {
  return PLANS[plan].find((b) => f >= b.lo && f <= b.hi)
}

export function findSegment(band: Band, f: number): Segment | undefined {
  return band.segments.find((s) => f >= s.lo && f < s.hi) ?? band.segments.find((s) => f === s.hi)
}

/** Privileges of a US operator of `cls` at `f`: whether any, and which modes ('all' = every mode). */
export function usCanOperate(f: number, cls: LicenseClass): { allowed: boolean; modes: PrivMode[] } {
  const band = findBand('us', f)
  if (!band) return { allowed: false, modes: [] }
  const seg = findSegment(band, f)
  if (!seg || seg.mode === 'none') return { allowed: false, modes: [] }
  const hits = usPrivileges(band, cls).filter((p) => f >= p.lo && f <= p.hi)
  return { allowed: hits.length > 0, modes: [...new Set(hits.flatMap((p) => p.modes))] }
}

export interface Lookup {
  plan: PlanId
  band?: Band
  segment?: Segment
  /** Nearest bands below and above when `f` is outside every band. */
  below?: Band
  above?: Band
}

export function lookup(plan: PlanId, f: number): Lookup {
  const band = findBand(plan, f)
  if (band) return { plan, band, segment: findSegment(band, f) }
  const bands = PLANS[plan]
  const below = [...bands].filter((b) => b.hi < f).sort((a, b) => b.hi - a.hi)[0]
  const above = [...bands].filter((b) => b.lo > f).sort((a, b) => a.lo - b.lo)[0]
  return { plan, below, above }
}

// ---- Well-known frequencies ----

export interface Notable {
  mhz: number
  label: string
  plans?: PlanId[]
}
const NA: PlanId[] = ['r2', 'us']
export const NOTABLE: Notable[] = [
  { mhz: 1.84, label: 'FT8' },
  { mhz: 3.573, label: 'FT8' },
  { mhz: 7.074, label: 'FT8' },
  { mhz: 10.136, label: 'FT8' },
  { mhz: 14.074, label: 'FT8' },
  { mhz: 18.1, label: 'FT8' },
  { mhz: 21.074, label: 'FT8' },
  { mhz: 24.915, label: 'FT8' },
  { mhz: 28.074, label: 'FT8' },
  { mhz: 50.313, label: 'FT8' },
  { mhz: 144.174, label: 'FT8' },
  { mhz: 7.0475, label: 'FT4' },
  { mhz: 14.08, label: 'FT4' },
  { mhz: 14.0956, label: 'WSPR' },
  { mhz: 7.0386, label: 'WSPR' },
  { mhz: 3.56, label: 'QRP CW calling' },
  { mhz: 7.03, label: 'QRP CW calling' },
  { mhz: 14.06, label: 'QRP CW calling' },
  { mhz: 21.06, label: 'QRP CW calling' },
  { mhz: 28.06, label: 'QRP CW calling' },
  { mhz: 14.285, label: 'QRP SSB calling' },
  { mhz: 14.1, label: 'IBP beacon' },
  { mhz: 18.11, label: 'IBP beacon' },
  { mhz: 21.15, label: 'IBP beacon' },
  { mhz: 24.93, label: 'IBP beacon' },
  { mhz: 28.2, label: 'IBP beacon' },
  { mhz: 50.11, label: 'DX calling (6 m SSB)' },
  { mhz: 144.3, label: 'SSB calling' },
  { mhz: 432.2, label: 'SSB calling' },
  { mhz: 1296.2, label: 'SSB calling' },
  { mhz: 145.5, label: 'FM calling', plans: ['r1', 'r3'] },
  { mhz: 433.5, label: 'FM calling', plans: ['r1'] },
  { mhz: 146.52, label: 'FM calling', plans: NA },
  { mhz: 223.5, label: 'FM calling', plans: NA },
  { mhz: 446.0, label: 'FM calling', plans: NA },
  { mhz: 144.8, label: 'APRS', plans: ['r1', 'r3'] },
  { mhz: 144.39, label: 'APRS', plans: NA },
  { mhz: 145.825, label: 'ISS APRS / digipeater' },
  { mhz: 145.8, label: 'ISS voice downlink' },
]

export function notableAt(f: number, plan: PlanId, tolHz = 600): Notable[] {
  return NOTABLE.filter((n) => Math.abs(hz(n.mhz) - f) <= tolHz && (!n.plans || n.plans.includes(plan)))
}
