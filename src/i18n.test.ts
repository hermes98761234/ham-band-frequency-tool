import { describe, expect, it } from 'vitest'
import { tr, UK } from './i18n'

describe('tr', () => {
  it('returns English source unchanged and interpolates', () => {
    expect(tr('en', 'Nearest: {0}', 'x')).toBe('Nearest: x')
  })
  it('translates and interpolates in Ukrainian', () => {
    expect(tr('uk', 'Nearest: {0}', 'x')).toBe('Найближчий: x')
  })
  it('falls back to the source string', () => {
    expect(tr('uk', 'No such key')).toBe('No such key')
  })
  it('keeps placeholders consistent between languages', () => {
    for (const [en, uk] of Object.entries(UK)) {
      const ph = (s: string) => (s.match(/\{\d+\}/g) ?? []).sort().join()
      expect(ph(uk), en).toBe(ph(en))
    }
  })
})

describe('translation coverage', () => {
  it('every literal passed to t() or N() in the source has a Ukrainian entry', async () => {
    const { readdirSync, readFileSync } = await import('node:fs')
    const files = ['src/App.tsx', ...readdirSync('src/components').map((f) => `src/components/${f}`), 'src/i18n.ts', 'src/lib/radio.ts']
    const missing: string[] = []
    for (const f of files) {
      const text = readFileSync(f, 'utf8')
      for (const m of text.matchAll(/\b(?:t|N)\(\s*'((?:[^'\\]|\\.)*)'/g)) {
        const key = m[1].replace(/\\'/g, "'")
        if (!(key in UK)) missing.push(`${f}: ${key}`)
      }
      for (const m of text.matchAll(/name: '([^']+)'/g)) if (f.endsWith('radio.ts') && !(m[1] in UK)) missing.push(`${f}: ${m[1]}`)
    }
    expect(missing).toEqual([])
  })
})
