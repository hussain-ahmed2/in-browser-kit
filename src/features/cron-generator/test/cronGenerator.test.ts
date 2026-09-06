import { describe, expect, it } from 'vitest'
import { generateCron, describeCron } from '../lib/cronGenerator'

describe('Cron Generator', () => {
  describe('generateCron', () => {
    it('generates simple cron expression', () => {
      const result = generateCron({
        minute: '0',
        hour: '9',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
      })
      expect(result).toBe('0 9 * * *')
    })

    it('generates expression with ranges', () => {
      const result = generateCron({
        minute: '0',
        hour: '9',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '1-5',
      })
      expect(result).toBe('0 9 * * 1-5')
    })

    it('generates expression with steps', () => {
      const result = generateCron({
        minute: '*/5',
        hour: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
      })
      expect(result).toBe('*/5 * * * *')
    })
  })

  describe('describeCron', () => {
    it('describes every minute', () => {
      const result = describeCron('* * * * *')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((d) => d.includes('every minute'))).toBe(true)
    })

    it('describes specific time', () => {
      const result = describeCron('0 9 * * *')
      expect(result.some((d) => d.includes('9:00 AM'))).toBe(true)
    })

    it('describes day of week', () => {
      const result = describeCron('0 0 * * 0')
      expect(result.some((d) => d.includes('Sunday'))).toBe(true)
    })

    it('describes day of week range', () => {
      const result = describeCron('0 9 * * 1-5')
      expect(result.some((d) => d.includes('Monday'))).toBe(true)
      expect(result.some((d) => d.includes('Friday'))).toBe(true)
    })

    it('describes step values', () => {
      const result = describeCron('*/5 * * * *')
      expect(result.some((d) => d.includes('every 5 minutes'))).toBe(true)
    })

    it('returns error for invalid expression', () => {
      const result = describeCron('invalid')
      expect(result.some((d) => d.includes('Invalid'))).toBe(true)
    })
  })
})
