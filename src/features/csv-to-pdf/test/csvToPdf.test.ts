import { describe, expect, it } from 'vitest'
import { convertCsvToPdf } from '../lib/csvToPdf'

describe('CSV to PDF Converter', () => {
  it('exports convertCsvToPdf function', () => {
    expect(typeof convertCsvToPdf).toBe('function')
  })

  it('convertCsvToPdf produces a Blob from CSV input', async () => {
    const csv = 'Name,Age\nAlice,30\nBob,25'
    const blob = await convertCsvToPdf(csv)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/pdf')
  })
})
