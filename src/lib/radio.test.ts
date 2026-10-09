import { describe, expect, it } from 'vitest'
import {
  antennaLengths, C, fmtNum, formatFreq, formatImperial, formatMetric, frequencyFromWavelength,
  parseFrequency, parseLength, wavelength,
} from './radio'

describe('wavelength', () => {
  it('uses c = 299792458 m/s', () => {
    expect(C).toBe(299792458)
    expect(wavelength(1e6)).toBeCloseTo(299.792458, 6)
  })
  it('matches textbook values for ham bands', () => {
    expect(wavelength(14.2e6)).toBeCloseTo(21.1121, 3) // 20 m band is ~21 m
    expect(wavelength(145e6)).toBeCloseTo(2.0675, 3) // "2 m"
    expect(wavelength(433e6)).toBeCloseTo(0.6924, 3) // "70 cm"
    expect(wavelength(1e9)).toBeCloseTo(0.299792, 5)
  })
  it('scales with velocity factor (RG-58 quarter wave at 144 MHz)', () => {
    expect(wavelength(144e6, 0.66) / 4).toBeCloseTo(0.34351, 4)
  })
  it('round-trips', () => {
    expect(frequencyFromWavelength(wavelength(7.1e6, 0.8), 0.8)).toBeCloseTo(7.1e6, 3)
  })
})

describe('parsing', () => {
  it('parses frequency with units', () => {
    expect(parseFrequency('14.074 MHz', 'kHz')).toBeCloseTo(14.074e6, 3)
    expect(parseFrequency('7074k', 'MHz')).toBe(7_074_000)
    expect(parseFrequency('2.4G', 'MHz')).toBe(2.4e9)
    expect(parseFrequency('145,5', 'MHz')).toBe(145.5e6)
    expect(parseFrequency('100', 'kHz')).toBe(100_000)
    expect(parseFrequency('1e3', 'Hz')).toBe(1000)
  })
  it('rejects junk and negatives', () => {
    expect(parseFrequency('abc', 'MHz')).toBeNull()
    expect(parseFrequency('-5', 'MHz')).toBeNull()
    expect(parseFrequency('5 parsecs', 'MHz')).toBeNull()
    expect(parseFrequency('', 'MHz')).toBeNull()
  })
  it('parses lengths', () => {
    expect(parseLength('21.1', 'm')).toBeCloseTo(21.1, 9)
    expect(parseLength('70 cm', 'm')).toBeCloseTo(0.7, 9)
    expect(parseLength('6ft', 'm')).toBeCloseTo(1.8288, 9)
    expect(parseLength('12 in', 'm')).toBeCloseTo(0.3048, 9)
    expect(parseLength('3 furlongs', 'm')).toBeNull()
  })
})

describe('formatting', () => {
  it('formats frequencies with best unit', () => {
    expect(formatFreq(14_074_000)).toBe('14.074 MHz')
    expect(formatFreq(950)).toBe('950 Hz')
    expect(formatFreq(10_368_100_000)).toBe('10.3681 GHz')
  })
  it('formats lengths', () => {
    expect(formatMetric(2.06752)).toBe('2.068 m')
    expect(formatMetric(0.5)).toBe('50 cm')
    expect(formatMetric(0.002)).toBe('2 mm')
    expect(formatImperial(0.3048)).toBe('12 in')
    expect(formatImperial(10 * 0.3048)).toBe('10 ft (10 ft 0 in)')
  })
  it('fmtNum avoids exponent noise', () => {
    expect(fmtNum(0.1 + 0.2)).toBe('0.3')
    expect(fmtNum(1234567.891, 9)).toBe('1234567.89')
  })
})

describe('antennaLengths', () => {
  it('half-wave dipole is close to 468/f feet', () => {
    const l = antennaLengths(14.2e6, 1, 0.95)
    const feet = l.dipole / 0.3048
    expect(feet).toBeCloseTo(468 / 14.2, 0) // ~32.96 ft, rule of thumb within a foot
    expect(Math.abs(feet - 468 / 14.2)).toBeLessThan(0.2)
  })
  it('quarter wave and loop', () => {
    const l = antennaLengths(7.1e6, 1, 0.95)
    expect(l.quarterWire).toBeCloseTo(l.dipole / 2, 9)
    expect(l.loop / 0.3048).toBeCloseTo(1005 / 7.1, 6)
    expect(l.half).toBeCloseTo(l.lambda / 2, 9)
    expect(l.fiveEighths).toBeCloseTo((l.lambda * 5) / 8, 9)
  })
  it('applies VF to electrical lengths only', () => {
    const l = antennaLengths(100e6, 0.66, 0.95)
    expect(l.lambdaVf).toBeCloseTo(l.lambda * 0.66, 9)
    expect(l.quarter).toBeCloseTo(l.lambda * 0.66 / 4, 9)
    expect(l.dipole).toBeCloseTo(l.lambda / 2 * 0.95, 9)
  })
})
