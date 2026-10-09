import { useEffect } from 'react'
import { BandChart } from './components/BandChart'
import { BandInfo } from './components/BandInfo'
import { Converter } from './components/Converter'
import { tr } from './i18n'
import type { T } from './i18n'
import { useSettings } from './settings'

const REPO = 'https://github.com/hermes98761234/ham-band-frequency-tool'

export default function App() {
  const [s, set] = useSettings()
  const t: T = (str, ...args) => tr(s.lang, str, ...args)

  useEffect(() => {
    const root = document.documentElement
    if (s.theme === 'auto') delete root.dataset.theme
    else root.dataset.theme = s.theme
    root.lang = s.lang
    document.title = s.lang === 'uk' ? 'Радіоаматорські діапазони та частоти' : 'Ham Band & Frequency Tool: frequency to wavelength, band plans'
  }, [s.theme, s.lang])

  return (
    <div className="app">
      <header>
        <div className="title">
          <img src="favicon.svg" alt="" width="36" height="36" />
          <div>
            <h1>{t('Ham band frequency tool')}</h1>
            <p className="muted">{t('Frequency and wavelength converter with amateur band plans.')}</p>
          </div>
        </div>
        <div className="settings">
          <label className="inline">
            <span>{t('Language')}</span>
            <select value={s.lang} onChange={(e) => set({ lang: e.target.value as 'en' | 'uk' })}>
              <option value="en">English</option>
              <option value="uk">Українська</option>
            </select>
          </label>
          <label className="inline">
            <span>{t('Theme')}</span>
            <select value={s.theme} onChange={(e) => set({ theme: e.target.value as 'auto' | 'light' | 'dark' })}>
              <option value="auto">{t('System')}</option>
              <option value="light">{t('Light')}</option>
              <option value="dark">{t('Dark')}</option>
            </select>
          </label>
        </div>
      </header>
      <main>
        <div className="top">
          <Converter s={s} set={set} t={t} />
          <BandInfo hz={s.hz} t={t} plan={s.plan} />
        </div>
        <BandChart s={s} set={set} t={t} />
      </main>
      <footer>
        <span>{t('Runs entirely in your browser. Nothing is sent anywhere.')}</span>
        <a href={REPO} target="_blank" rel="noreferrer">{t('Source on GitHub')}</a>
      </footer>
    </div>
  )
}
