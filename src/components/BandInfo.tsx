import type { T } from '../i18n'
import { bandLabel, modeLabel, PLAN_NAME } from '../i18n'
import type { LicenseClass, PlanId } from '../lib/bands'
import { CLASSES, lookup, notableAt, PLAN_IDS, usCanOperate } from '../lib/bands'
import { formatFreq } from '../lib/radio'

const CLASS_NAME: Record<LicenseClass, string> = { T: 'Technician', G: 'General', E: 'Amateur Extra' }
const range = (lo: number, hi: number) => `${formatFreq(lo)} – ${formatFreq(hi)}`

export function BandInfo({ hz, t, plan }: { hz: number; t: T; plan: PlanId }) {
  const notes = notableAt(hz, plan)
  return (
    <section className="card" aria-labelledby="look-h">
      <h2 id="look-h">{t('Which band is {0}?', formatFreq(hz))}</h2>
      {notes.length > 0 && (
        <p className="notable">★ {notes.map((n) => t(n.label)).join(', ')}</p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>{t('Band plan')}</th><th>{t('Band')}</th><th>{t('Usage here')}</th></tr>
          </thead>
          <tbody>
            {PLAN_IDS.map((p) => {
              const l = lookup(p, hz)
              return (
                <tr key={p} className={p === plan ? 'sel' : ''}>
                  <th scope="row">{t(PLAN_NAME[p])}</th>
                  {l.band ? (
                    <>
                      <td>
                        <strong>{bandLabel(l.band.id, t)}</strong>
                        <div className="muted small">{range(l.band.lo, l.band.hi)}</div>
                      </td>
                      <td>
                        {l.segment && l.segment.mode !== 'none' ? (
                          <>
                            <span className={`chip m-${l.segment.mode}`}>{modeLabel(l.segment.mode, t)}</span>
                            <div className="muted small">{range(l.segment.lo, l.segment.hi)}</div>
                          </>
                        ) : (
                          <span className="warn">{t('Not allocated to amateurs here')}</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="muted">
                      {t('Not in an amateur band.')}{' '}
                      {l.below && <span>{t('Below: {0} ({1})', bandLabel(l.below.id, t), formatFreq(l.below.hi))} </span>}
                      {l.above && <span>{t('Above: {0} ({1})', bandLabel(l.above.id, t), formatFreq(l.above.lo))}</span>}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <h3>{t('US privileges at this frequency')}</h3>
      <ul className="classes">
        {CLASSES.map((c) => {
          const r = usCanOperate(hz, c)
          const modes = r.modes.includes('all') ? t('all modes') : r.modes.map((m) => t(m === 'cw' ? 'CW' : m === 'digital' ? 'Digital' : 'Phone')).join(', ')
          return (
            <li key={c} className={r.allowed ? 'yes' : 'no'}>
              <span aria-hidden="true">{r.allowed ? '✓' : '✗'}</span> {t(CLASS_NAME[c])}
              <span className="muted small">{r.allowed ? ` · ${modes}` : ` · ${t('no privileges')}`}</span>
            </li>
          )
        })}
      </ul>
      <p className="muted small">{t('Band plans are simplified summaries. Check your national regulator for exact limits and conditions.')}</p>
    </section>
  )
}
