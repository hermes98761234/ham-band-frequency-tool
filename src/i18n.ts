import type { Lang } from './lib/model'
import type { Mode, PlanId } from './lib/bands'

export type T = (s: string, ...args: (string | number)[]) => string

/** Marks a string for translation where it is defined away from its t() call. */
export const N = (s: string) => s

export const PLAN_NAME: Record<PlanId, string> = {
  r1: N('IARU Region 1'),
  r2: N('IARU Region 2'),
  r3: N('IARU Region 3'),
  us: N('USA (FCC)'),
}

export const MODE_NAME: Record<Mode, string> = {
  cw: N('CW'),
  digital: N('Digital'),
  phone: N('Phone (SSB/AM)'),
  all: N('All modes'),
  beacon: N('Beacons'),
  satellite: N('Satellite'),
  fm: N('FM simplex'),
  repeater: N('Repeaters'),
  eme: N('Weak signal / EME'),
  none: N('Not allocated'),
}

export const modeLabel = (m: Mode, t: T) => t(MODE_NAME[m])

/** "20m" → "20 m", "70cm" → "70 cm" (localised unit). */
export function bandLabel(id: string, t: T): string {
  const m = /^([\d.]+)(m|cm|mm)$/.exec(id)
  return m ? `${m[1]} ${t(m[2])}` : id
}

/** English source string → Ukrainian. `{0}`, `{1}` are placeholders for interpolated values. */
export const UK: Record<string, string> = {
  'Ham band frequency tool': 'Радіоаматорські діапазони та частоти',
  'Frequency and wavelength converter with amateur band plans.': 'Конвертер частота ↔ довжина хвилі з бандпланами радіоаматорських діапазонів.',
  'Source on GitHub': 'Код на GitHub',
  'Runs entirely in your browser. Nothing is sent anywhere.': 'Працює повністю у браузері. Дані нікуди не надсилаються.',
  Language: 'Мова',
  Theme: 'Тема',
  System: 'Системна',
  Light: 'Світла',
  Dark: 'Темна',
  'Frequency ↔ wavelength': 'Частота ↔ довжина хвилі',
  Frequency: 'Частота',
  'Frequency unit': 'Одиниця частоти',
  'Wavelength (free space)': 'Довжина хвилі (вакуум)',
  'Length unit': 'Одиниця довжини',
  'Enter a positive number, optionally with a unit (e.g. 7.1 MHz or 40 m).': 'Введіть додатне число, за бажання з одиницею (наприклад, 7.1 MHz або 40 m).',
  'Velocity factor (cable or wire)': 'Коефіцієнт скорочення (кабель або провід)',
  Custom: 'Власний',
  'Wire factor K': 'Коефіцієнт проводу K',
  'Wire end-effect: a real half-wave dipole is cut about 5% shorter than the free-space half wave.': 'Крайовий ефект: реальний напівхвильовий диполь робиться приблизно на 5% коротшим за півхвилі у вільному просторі.',
  'Electrical lengths': 'Електричні довжини',
  'Electrical lengths at VF {0}': 'Електричні довжини при VF {0}',
  'Antenna wire cut lengths (K = {0})': 'Довжини проводу антен (K = {0})',
  Length: 'Довжина',
  Antenna: 'Антена',
  Metric: 'Метрична',
  Imperial: 'Дюймова',
  'Wavelength λ': 'Довжина хвилі λ',
  'Half wave λ/2': 'Півхвилі λ/2',
  'Quarter wave λ/4': 'Чверть хвилі λ/4',
  '5/8 wave': '5/8 хвилі',
  'Half-wave dipole, total wire': 'Напівхвильовий диполь, весь провід',
  'Dipole, each leg': 'Диполь, кожне плече',
  'Quarter-wave vertical / radial': 'Чвертьхвильовий вертикал / радіал',
  '5/8 wave vertical': '5/8-хвильовий вертикал',
  'Full-wave loop': 'Рамка на повну хвилю',
  'Cut lengths are starting points: trim while watching SWR. Height above ground, nearby objects and wire insulation all shift resonance.': 'Довжини — лише відправна точка: підрізайте, стежачи за КСХ. Висота над землею, довколишні об’єкти та ізоляція проводу зсувають резонанс.',
  'Free space / air': 'Вільний простір / повітря',
  'Open-wire line': 'Повітряна двопровідна лінія',
  'Ladder line (window)': 'Стрічкова лінія (з вікнами)',
  'Twin-lead 300 Ω': 'Двопровідна стрічка 300 Ом',
  'Ecoflex / LMR-400 / Aircell 7': 'Ecoflex / LMR-400 / Aircell 7',
  'LMR-240': 'LMR-240',
  'RG-8X': 'RG-8X',
  'RG-213 / RG-58 / RG-174': 'RG-213 / RG-58 / RG-174',
  'RG-316 (PTFE)': 'RG-316 (PTFE)',
  'Heliax 1/2" (foam)': 'Heliax 1/2" (пінопласт)',
  m: 'м',
  cm: 'см',
  mm: 'мм',
  ft: 'фут',
  in: 'дюйм',
  'Which band is {0}?': 'Який це діапазон: {0}?',
  'Band plan': 'Бандплан',
  Band: 'Діапазон',
  'Usage here': 'Використання тут',
  'Not allocated to amateurs here': 'Тут не виділено радіоаматорам',
  'Not in an amateur band.': 'Поза радіоаматорськими діапазонами.',
  'Below: {0} ({1})': 'Нижче: {0} ({1})',
  'Above: {0} ({1})': 'Вище: {0} ({1})',
  'US privileges at this frequency': 'Права в США на цій частоті',
  Technician: 'Technician',
  General: 'General',
  'Amateur Extra': 'Amateur Extra',
  'all modes': 'усі види',
  Phone: 'Телефон',
  'no privileges': 'немає прав',
  'Band plans are simplified summaries. Check your national regulator for exact limits and conditions.': 'Бандплани спрощені. Точні межі й умови дивіться у національного регулятора.',
  'IARU Region 1': 'IARU Район 1',
  'IARU Region 2': 'IARU Район 2',
  'IARU Region 3': 'IARU Район 3',
  'USA (FCC)': 'США (FCC)',
  CW: 'CW (телеграф)',
  Digital: 'Цифрові',
  'Phone (SSB/AM)': 'Телефон (SSB/AM)',
  'All modes': 'Усі види',
  Beacons: 'Маяки',
  Satellite: 'Супутники',
  'FM simplex': 'FM симплекс',
  Repeaters: 'Репітери',
  'Weak signal / EME': 'Слабкі сигнали / EME',
  'Not allocated': 'Не виділено',
  'Frequency range': 'Діапазон частот',
  All: 'Усі',
  HF: 'КХ',
  VHF: 'УКХ',
  UHF: 'ДМХ',
  Microwave: 'Мікрохвилі',
  'US license class': 'Клас ліцензії США',
  'Show all': 'Показати все',
  'Only bands I can use': 'Лише доступні мені діапазони',
  Legend: 'Умовні позначення',
  'Your frequency': 'Ваша частота',
  allowed: 'дозволено',
  'No bands match the filters.': 'Немає діапазонів за цими фільтрами.',
  'Click a segment to use its centre frequency. Segment boundaries are voluntary band-plan conventions; US license privileges are the legal limits.': 'Клацніть сегмент, щоб узяти його центральну частоту. Межі сегментів — добровільні домовленості бандплану; права ліцензій США — юридичні обмеження.',
  'Nearest: {0}': 'Найближчий: {0}',
  // notable frequencies
  FT8: 'FT8',
  FT4: 'FT4',
  WSPR: 'WSPR',
  'QRP CW calling': 'QRP CW виклик',
  'QRP SSB calling': 'QRP SSB виклик',
  'IBP beacon': 'Маяк IBP',
  'DX calling (6 m SSB)': 'DX-виклик (6 м SSB)',
  'SSB calling': 'SSB виклик',
  'FM calling': 'FM виклик',
  APRS: 'APRS',
  'ISS APRS / digipeater': 'МКС APRS / цифропітер',
  'ISS voice downlink': 'МКС голос (downlink)',
}

export function tr(lang: Lang, s: string, ...args: (string | number)[]): string {
  const src = lang === 'uk' ? (UK[s] ?? s) : s
  return src.replace(/\{(\d+)\}/g, (_, i: string) => String(args[+i]))
}
