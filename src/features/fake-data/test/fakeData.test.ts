import { describe, expect, it } from 'vitest'
import {
  generateNames,
  generateEmails,
  generatePhones,
  generateAddresses,
  generateCreditCards,
  generateUuids,
  generateDates,
  generatePasswords,
  generateNumbers,
  generateColors,
  formatBytes,
  generateFakeData,
} from '../lib/fakeData'

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
  it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB') })
})

describe('generateNames', () => {
  it('returns requested count', () => { expect(generateNames(5)).toHaveLength(5) })
  it('returns strings with spaces', () => { generateNames(10).forEach((n) => expect(n).toContain(' ')) })
})

describe('generateEmails', () => {
  it('returns requested count', () => { expect(generateEmails(3)).toHaveLength(3) })
  it('contains @ symbol', () => { generateEmails(10).forEach((e) => expect(e).toContain('@')) })
})

describe('generatePhones', () => {
  it('returns requested count', () => { expect(generatePhones(3)).toHaveLength(3) })
})

describe('generateAddresses', () => {
  it('returns requested count', () => { expect(generateAddresses(3)).toHaveLength(3) })
})

describe('generateCreditCards', () => {
  it('returns requested count', () => { expect(generateCreditCards(3)).toHaveLength(3) })
  it('cards have expected length', () => { generateCreditCards(5).forEach((c) => expect(c.replace(/\s/g, '').length).toBeGreaterThanOrEqual(15)) })
})

describe('generateUuids', () => {
  it('returns requested count', () => { expect(generateUuids(5)).toHaveLength(5) })
  it('formats UUID', () => { generateUuids(3).forEach((u) => expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)) })
})

describe('generateDates', () => {
  it('returns requested count', () => { expect(generateDates(3)).toHaveLength(3) })
  it('ISO format', () => { generateDates(5).forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)) })
})

describe('generatePasswords', () => {
  it('returns requested count', () => { expect(generatePasswords(3)).toHaveLength(3) })
  it('minimum length', () => { generatePasswords(5).forEach((p) => expect(p.length).toBeGreaterThanOrEqual(12)) })
})

describe('generateNumbers', () => {
  it('returns requested count', () => { expect(generateNumbers(10, 1, 100)).toHaveLength(10) })
  it('within range', () => { generateNumbers(50, 5, 25).forEach((n) => { const v = Number(n); expect(v).toBeGreaterThanOrEqual(5); expect(v).toBeLessThanOrEqual(25) }) })
})

describe('generateColors', () => {
  it('returns requested count', () => { expect(generateColors(3)).toHaveLength(3) })
  it('hex format', () => { generateColors(5).forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/)) })
})

describe('generateFakeData', () => {
  it('dispatches to correct generator', () => { expect(generateFakeData('names', 5)).toHaveLength(5) })
  it('numbers with range', () => { expect(generateFakeData('numbers', 3, 10, 20)).toHaveLength(3) })
})
