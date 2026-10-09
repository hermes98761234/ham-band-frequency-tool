/** Speed of light in vacuum, m/s (exact). */
export const C = 299_792_458

export type FreqUnit = 'Hz' | 'kHz' | 'MHz' | 'GHz'
export type LenUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in'

export const FREQ_UNITS: FreqUnit[] = ['Hz', 'kHz', 'MHz', 'GHz']
export const LEN_UNITS: LenUnit[] = ['m', 'cm', 'mm', 'ft', 'in']
export const FREQ_MULT: Record<FreqUnit, number> = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 }
export const LEN_M: Record<LenUnit, number> = { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 }

/** Wavelength in metres at `hz`, in a medium with velocity factor `vf` (1 = free space). */
export function wavelength(hz: number, vf = 1): number {
  return (C * vf) / hz
}

/** Inverse of {@link wavelength}. */
export function frequencyFromWavelength(m: number, vf = 1): number {
  return (C * vf) / m
}

function parseNumber(s: string): number | null {
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const NUM = String.raw`([0-9]*[.,]?[0-9]+(?:[eE][+-]?[0-9]+)?)`

/** Parses "14.074", "14.074 MHz", "7074k", "2.4G" etc. Bare numbers use `fallback`. */
export function parseFrequency(text: string, fallback: FreqUnit): number | null {
  const m = new RegExp(`^\\s*${NUM}\\s*([a-zA-Z]*)\\s*$`).exec(text)
  if (!m) return null
  const n = parseNumber(m[1])
  if (n === null || n < 0) return null
  const u = m[2]
  let mult: number
  if (u === '') mult = FREQ_MULT[fallback]
  else if (u === 'k' || u === 'K' || /^khz$/i.test(u)) mult = 1e3
  else if (u === 'M' || /^mhz$/i.test(u) || /^mc$/i.test(u)) mult = 1e6
  else if (u === 'G' || /^ghz$/i.test(u)) mult = 1e9
  else if (/^hz$/i.test(u)) mult = 1
  else return null
  return n * mult
}

/** Parses a length such as "21.1", "21.1 m", "6 ft", "70cm". Bare numbers use `fallback`. */
export function parseLength(text: string, fallback: LenUnit): number | null {
  const m = new RegExp(`^\\s*${NUM}\\s*([a-zA-Z"']*)\\s*$`).exec(text)
  if (!m) return null
  const n = parseNumber(m[1])
  if (n === null || n < 0) return null
  const u = m[2].toLowerCase()
  const map: Record<string, LenUnit> = { m: 'm', cm: 'cm', mm: 'mm', ft: 'ft', "'": 'ft', in: 'in', '"': 'in' }
  const unit = u === '' ? fallback : map[u]
  if (!unit) return null
  return n * LEN_M[unit]
}

/** Trims a number to `digits` significant digits without exponent noise. */
export function fmtNum(x: number, digits = 6): string {
  if (!Number.isFinite(x)) return ''
  if (x === 0) return '0'
  const s = Number(x.toPrecision(digits))
  const a = Math.abs(s)
  if (a >= 1e-6 && a < 1e15) return s.toLocaleString('en-US', { maximumFractionDigits: 12, useGrouping: false })
  return String(s)
}

export function bestFreqUnit(hz: number): FreqUnit {
  if (hz >= 1e9) return 'GHz'
  if (hz >= 1e6) return 'MHz'
  if (hz >= 1e3) return 'kHz'
  return 'Hz'
}

export function formatFreq(hz: number, digits = 7): string {
  const u = bestFreqUnit(hz)
  return `${fmtNum(hz / FREQ_MULT[u], digits)} ${u}`
}

/** Metric length with an automatically chosen unit (m, cm, mm). */
export function formatMetric(m: number, digits = 4): string {
  const a = Math.abs(m)
  if (a >= 1) return `${fmtNum(m, digits)} m`
  if (a >= 0.01) return `${fmtNum(m * 100, digits)} cm`
  return `${fmtNum(m * 1000, digits)} mm`
}

/** Imperial length: feet and inches for long lengths, inches for short ones. */
export function formatImperial(m: number, digits = 4): string {
  const inches = m / LEN_M.in
  if (Math.abs(inches) < 36) return `${fmtNum(inches, digits)} in`
  const ft = Math.floor(inches / 12)
  const rest = inches - ft * 12
  return `${fmtNum(m / LEN_M.ft, digits)} ft (${ft} ft ${fmtNum(rest, 3)} in)`
}

export interface VelocityPreset {
  id: string
  name: string
  vf: number
}

export const VELOCITY_PRESETS: VelocityPreset[] = [
  { id: 'free', name: 'Free space / air', vf: 1 },
  { id: 'openwire', name: 'Open-wire line', vf: 0.97 },
  { id: 'ladder', name: 'Ladder line (window)', vf: 0.91 },
  { id: 'twinlead', name: 'Twin-lead 300 Ω', vf: 0.8 },
  { id: 'ecoflex', name: 'Ecoflex / LMR-400 / Aircell 7', vf: 0.85 },
  { id: 'lmr240', name: 'LMR-240', vf: 0.84 },
  { id: 'rg8x', name: 'RG-8X', vf: 0.78 },
  { id: 'rg213', name: 'RG-213 / RG-58 / RG-174', vf: 0.66 },
  { id: 'rg316', name: 'RG-316 (PTFE)', vf: 0.7 },
  { id: 'heliax', name: 'Heliax 1/2" (foam)', vf: 0.88 },
  { id: 'custom', name: 'Custom', vf: 1 },
]

export interface AntennaLengths {
  /** Free-space wavelength. */
  lambda: number
  /** Wavelength in the medium with velocity factor vf. */
  lambdaVf: number
  half: number
  quarter: number
  fiveEighths: number
  /** Cut length of a half-wave wire dipole (all legs), shortened by `k`. */
  dipole: number
  /** Cut length of a quarter-wave vertical / radial, shortened by `k`. */
  quarterWire: number
  /** Cut length of a 5/8 wave vertical, shortened by `k`. */
  fiveEighthsWire: number
  /** Full-wave loop circumference (ARRL 1005/f ft rule). */
  loop: number
}

/** Typical rule-of-thumb loop: 1005 / f(MHz) feet. */
const LOOP_FT_MHZ = 1005

export function antennaLengths(hz: number, vf: number, k: number): AntennaLengths {
  const lambda = wavelength(hz)
  const lambdaVf = wavelength(hz, vf)
  return {
    lambda,
    lambdaVf,
    half: lambdaVf / 2,
    quarter: lambdaVf / 4,
    fiveEighths: (lambdaVf * 5) / 8,
    dipole: (lambda / 2) * k,
    quarterWire: (lambda / 4) * k,
    fiveEighthsWire: ((lambda * 5) / 8) * k,
    loop: (LOOP_FT_MHZ / (hz / 1e6)) * LEN_M.ft,
  }
}
