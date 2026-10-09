import type { T } from '../i18n'
import { bandLabel, modeLabel, PLAN_NAME } from '../i18n'
import type { Band, Group, LicenseClass, Mode, PlanId } from '../lib/bands'
import { allowedIntervals, CLASSES, GROUPS, MODES, PLAN_IDS, PLANS } from '../lib/bands'
import { formatFreq } from '../lib/radio'
import type { Settings } from '../settings'

const CLASS_NAME: Record<LicenseClass, string> = { T: 'Technician', G: 'General', E: 'Amateur Extra' }
const pct = (x: number, b: Band) => `${(((x - b.lo) / (b.hi - b.lo)) * 100).toFixed(4)}%`
const wpct = (lo: number, hi: number, b: Band) => `${(((hi - lo) / (b.hi - b.lo)) * 100).toFixed(4)}%`

/** Rounds a picked frequency to a sensible resolution for its band. */
function pickFreq(lo: number, hi: number): number {
  const mid = (lo + hi) / 2
  const step = mid < 3e9 ? 1e3 : 1e6
  return Math.min(hi, Math.max(lo, Math.round(mid / step) * step))
}

interface Props {
  s: Settings
  set: (p: Partial<Settings>) => void
  t: T
}

export function BandChart({ s, set, t }: Props) {
  const us = s.plan === 'us'
  const cls = us && s.cls !== 'any' ? s.cls : null
  const bands = PLANS[s.plan].filter((b) => s.group === 'all' || b.group === s.group)
  const visible = bands.filter((b) => !(cls && s.onlyMine && b.segments.every((g) => allowedIntervals(b, g, cls).length === 0)))
  const present = new Set<Mode>(visible.flatMap((b) => b.segments.map((g) => g.mode)))

  return (
    <section className="card wide" aria-labelledby="chart-h">
      <h2 id="chart-h">{t('Band plan')}</h2>
      <div className="controls">
        <div className="seg" role="group" aria-label={t('Band plan')}>
          {PLAN_IDS.map((p: PlanId) => (
            <button key={p} aria-pressed={s.plan === p} className={s.plan === p ? 'on' : ''} onClick={() => set({ plan: p })}>
              {t(PLAN_NAME[p])}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label={t('Frequency range')}>
          {(['all', ...GROUPS] as (Group | 'all')[]).map((g) => (
            <button key={g} aria-pressed={s.group === g} className={s.group === g ? 'on' : ''} onClick={() => set({ group: g })}>
              {g === 'all' ? t('All') : t(g)}
            </button>
          ))}
        </div>
        {us && (
          <>
            <label className="inline">
              <span>{t('US license class')}</span>
              <select value={s.cls} onChange={(e) => set({ cls: e.target.value as Settings['cls'] })}>
                <option value="any">{t('Show all')}</option>
                {CLASSES.map((c) => <option key={c} value={c}>{t(CLASS_NAME[c])}</option>)}
              </select>
            </label>
            <label className="inline check">
              <input type="checkbox" checked={s.onlyMine} disabled={!cls} onChange={(e) => set({ onlyMine: e.target.checked })} />
              <span>{t('Only bands I can use')}</span>
            </label>
          </>
        )}
      </div>

      <ul className="legend" aria-label={t('Legend')}>
        {MODES.filter((m) => present.has(m)).map((m) => (
          <li key={m}><i className={`sw m-${m}`} /> {modeLabel(m, t)}</li>
        ))}
        <li><i className="sw marker" /> {t('Your frequency')}</li>
      </ul>

      <div className="bands">
        {visible.map((b) => {
          const inBand = s.hz >= b.lo && s.hz <= b.hi
          return (
            <div className="band" key={b.id}>
              <div className="blabel">{bandLabel(b.id, t)}</div>
              <div className="bar" role="group" aria-label={`${bandLabel(b.id, t)} ${formatFreq(b.lo)} – ${formatFreq(b.hi)}`}>
                {b.segments.map((g) => {
                  const ok = cls ? allowedIntervals(b, g, cls) : null
                  const title = `${modeLabel(g.mode, t)}: ${formatFreq(g.lo)} – ${formatFreq(g.hi)}`
                  const style = { left: pct(g.lo, b), width: wpct(g.lo, g.hi, b) }
                  return (
                    <span className="segwrap" key={g.lo} style={style}>
                      <button
                        className={`segment m-${g.mode}${ok ? ' faded' : ''}`}
                        title={title}
                        aria-label={title}
                        disabled={g.mode === 'none'}
                        onClick={() => set({ hz: pickFreq(g.lo, g.hi) })}
                      />
                      {ok?.map(([lo, hi]) => (
                        <button
                          key={lo}
                          className={`segment on-top m-${g.mode}`}
                          style={{ left: wpct(g.lo, lo, { ...b, lo: g.lo, hi: g.hi }), width: wpct(lo, hi, { ...b, lo: g.lo, hi: g.hi }) }}
                          title={`${title} (${t('allowed')})`}
                          aria-label={`${title} (${t('allowed')})`}
                          onClick={() => set({ hz: pickFreq(lo, hi) })}
                        />
                      ))}
                    </span>
                  )
                })}
                {inBand && <span className="marker-line" style={{ left: pct(s.hz, b) }} aria-hidden="true" />}
              </div>
              <div className="brange muted small">{formatFreq(b.lo)} – {formatFreq(b.hi)}</div>
            </div>
          )
        })}
        {visible.length === 0 && <p className="muted">{t('No bands match the filters.')}</p>}
      </div>
      <p className="muted small">{t('Click a segment to use its centre frequency. Segment boundaries are voluntary band-plan conventions; US license privileges are the legal limits.')}</p>
    </section>
  )
}
