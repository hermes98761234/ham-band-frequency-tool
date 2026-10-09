import { useEffect, useState } from 'react'
import type { LicenseClass, Group, PlanId } from './lib/bands'
import { PLAN_IDS, GROUPS } from './lib/bands'
import type { Lang, Theme } from './lib/model'
import type { FreqUnit, LenUnit } from './lib/radio'
import { FREQ_UNITS, LEN_UNITS, VELOCITY_PRESETS } from './lib/radio'

export interface Settings {
  lang: Lang
  theme: Theme
  /** Frequency being converted, in Hz. */
  hz: number
  fUnit: FreqUnit
  lUnit: LenUnit
  vfId: string
  vfCustom: number
  /** Wire shortening factor for antenna cut lengths. */
  k: number
  plan: PlanId
  /** 'any' shows every segment undimmed; otherwise the license class to highlight (US plan). */
  cls: LicenseClass | 'any'
  onlyMine: boolean
  group: Group | 'all'
}

const KEY = 'ham-band-frequency-tool:v1'

function defaultLang(): Lang {
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

export const DEFAULTS: Settings = {
  lang: 'en',
  theme: 'auto',
  hz: 14_074_000,
  fUnit: 'MHz',
  lUnit: 'm',
  vfId: 'free',
  vfCustom: 0.66,
  k: 0.95,
  plan: 'r1',
  cls: 'any',
  onlyMine: false,
  group: 'HF',
}

const num = (v: unknown, lo: number, hi: number, d: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d)

/** Validates untrusted stored JSON field by field. */
export function sanitize(raw: unknown): Settings {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const d = { ...DEFAULTS, lang: defaultLang() }
  return {
    lang: oneOf(o.lang, ['en', 'uk'] as const, d.lang),
    theme: oneOf(o.theme, ['auto', 'light', 'dark'] as const, d.theme),
    hz: num(o.hz, 1, 1e12, d.hz),
    fUnit: oneOf(o.fUnit, FREQ_UNITS, d.fUnit),
    lUnit: oneOf(o.lUnit, LEN_UNITS, d.lUnit),
    vfId: oneOf(o.vfId, VELOCITY_PRESETS.map((p) => p.id), d.vfId),
    vfCustom: num(o.vfCustom, 0.1, 1, d.vfCustom),
    k: num(o.k, 0.5, 1, d.k),
    plan: oneOf(o.plan, PLAN_IDS, d.plan),
    cls: oneOf(o.cls, ['any', 'T', 'G', 'E'] as const, d.cls),
    onlyMine: o.onlyMine === true,
    group: oneOf(o.group, ['all', ...GROUPS] as const, d.group),
  }
}

export function loadSettings(): Settings {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? 'null'))
  } catch {
    return sanitize(null)
  }
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [s, setS] = useState(loadSettings)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* private mode: settings just won't persist */
    }
  }, [s])
  return [s, (patch) => setS((cur) => ({ ...cur, ...patch }))]
}
