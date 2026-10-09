import { useState } from 'react'
import type { T } from '../i18n'
import {
  antennaLengths, fmtNum, formatImperial, formatMetric, frequencyFromWavelength, FREQ_MULT, FREQ_UNITS,
  LEN_M, LEN_UNITS, parseFrequency, parseLength, VELOCITY_PRESETS, wavelength,
} from '../lib/radio'
import type { Settings } from '../settings'

interface Props {
  s: Settings
  set: (p: Partial<Settings>) => void
  t: T
}

type Draft = { field: 'f' | 'l'; text: string } | null

export function Converter({ s, set, t }: Props) {
  const [draft, setDraft] = useState<Draft>(null)
  const preset = VELOCITY_PRESETS.find((p) => p.id === s.vfId) ?? VELOCITY_PRESETS[0]
  const vf = preset.id === 'custom' ? s.vfCustom : preset.vf

  const fText = draft?.field === 'f' ? draft.text : fmtNum(s.hz / FREQ_MULT[s.fUnit], 9)
  const lText = draft?.field === 'l' ? draft.text : fmtNum(wavelength(s.hz) / LEN_M[s.lUnit], 7)
  const fBad = draft?.field === 'f' && (parseFrequency(draft.text, s.fUnit) ?? 0) <= 0
  const lBad = draft?.field === 'l' && (parseLength(draft.text, s.lUnit) ?? 0) <= 0

  const onF = (text: string) => {
    setDraft({ field: 'f', text })
    const hz = parseFrequency(text, s.fUnit)
    if (hz && hz > 0) set({ hz })
  }
  const onL = (text: string) => {
    setDraft({ field: 'l', text })
    const m = parseLength(text, s.lUnit)
    if (m && m > 0) set({ hz: frequencyFromWavelength(m) })
  }

  const a = antennaLengths(s.hz, vf, s.k)
  const rows: [string, number][] = [
    ['Wavelength λ', a.lambdaVf],
    ['Half wave λ/2', a.half],
    ['Quarter wave λ/4', a.quarter],
    ['5/8 wave', a.fiveEighths],
  ]
  const wires: [string, number][] = [
    ['Half-wave dipole, total wire', a.dipole],
    ['Dipole, each leg', a.dipole / 2],
    ['Quarter-wave vertical / radial', a.quarterWire],
    ['5/8 wave vertical', a.fiveEighthsWire],
    ['Full-wave loop', a.loop],
  ]
  const L = (m: number) => (
    <>
      <td className="num">{formatMetric(m)}</td>
      <td className="num">{formatImperial(m)}</td>
    </>
  )

  return (
    <section className="card" aria-labelledby="conv-h">
      <h2 id="conv-h">{t('Frequency ↔ wavelength')}</h2>
      <div className="field-row">
        <label className="field">
          <span>{t('Frequency')}</span>
          <span className="inline">
            <input
              inputMode="decimal"
              value={fText}
              aria-invalid={fBad}
              onChange={(e) => onF(e.target.value)}
              onBlur={() => setDraft(null)}
              aria-label={t('Frequency')}
            />
            <select value={s.fUnit} aria-label={t('Frequency unit')} onChange={(e) => { setDraft(null); set({ fUnit: e.target.value as Settings['fUnit'] }) }}>
              {FREQ_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </span>
        </label>
        <label className="field">
          <span>{t('Wavelength (free space)')}</span>
          <span className="inline">
            <input
              inputMode="decimal"
              value={lText}
              aria-invalid={lBad}
              onChange={(e) => onL(e.target.value)}
              onBlur={() => setDraft(null)}
              aria-label={t('Wavelength (free space)')}
            />
            <select value={s.lUnit} aria-label={t('Length unit')} onChange={(e) => { setDraft(null); set({ lUnit: e.target.value as Settings['lUnit'] }) }}>
              {LEN_UNITS.map((u) => <option key={u} value={u}>{t(u)}</option>)}
            </select>
          </span>
        </label>
      </div>
      {(fBad || lBad) && <p className="err" role="alert">{t('Enter a positive number, optionally with a unit (e.g. 7.1 MHz or 40 m).')}</p>}

      <div className="field-row">
        <label className="field">
          <span>{t('Velocity factor (cable or wire)')}</span>
          <select value={s.vfId} onChange={(e) => set({ vfId: e.target.value })}>
            {VELOCITY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.id === 'custom' ? t('Custom') : `${t(p.name)} (${p.vf})`}</option>
            ))}
          </select>
        </label>
        {preset.id === 'custom' && (
          <label className="field narrow">
            <span>VF</span>
            <input
              type="number" step="0.01" min="0.1" max="1" value={s.vfCustom}
              onChange={(e) => { const v = e.target.valueAsNumber; if (v >= 0.1 && v <= 1) set({ vfCustom: v }) }}
            />
          </label>
        )}
        <label className="field narrow">
          <span title={t('Wire end-effect: a real half-wave dipole is cut about 5% shorter than the free-space half wave.')}>{t('Wire factor K')}</span>
          <input
            type="number" step="0.01" min="0.5" max="1" value={s.k}
            onChange={(e) => { const v = e.target.valueAsNumber; if (v >= 0.5 && v <= 1) set({ k: v }) }}
          />
        </label>
      </div>

      <h3>{vf === 1 ? t('Electrical lengths') : t('Electrical lengths at VF {0}', vf)}</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('Length')}</th><th>{t('Metric')}</th><th>{t('Imperial')}</th></tr></thead>
          <tbody>{rows.map(([n, m]) => <tr key={n}><th scope="row">{t(n)}</th>{L(m)}</tr>)}</tbody>
        </table>
      </div>
      <h3>{t('Antenna wire cut lengths (K = {0})', s.k)}</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('Antenna')}</th><th>{t('Metric')}</th><th>{t('Imperial')}</th></tr></thead>
          <tbody>{wires.map(([n, m]) => <tr key={n}><th scope="row">{t(n)}</th>{L(m)}</tr>)}</tbody>
        </table>
      </div>
      <p className="muted small">{t('Cut lengths are starting points: trim while watching SWR. Height above ground, nearby objects and wire insulation all shift resonance.')}</p>
    </section>
  )
}
