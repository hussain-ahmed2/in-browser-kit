import { describe, expect, it } from 'vitest'
import { convertExcelToPdf } from '../lib/excelToPdf'

describe('Excel to PDF Converter', () => {
  it('exports convertExcelToPdf function', () => {
    expect(typeof convertExcelToPdf).toBe('function')
  })

  it('convertExcelToPdf produces a Blob from CSV input', async () => {
    const csv = 'Name,Age,City\nAlice,30,NYC\nBob,25,LA'
    const blob = await convertExcelToPdf(csv)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/pdf')
  })
})
