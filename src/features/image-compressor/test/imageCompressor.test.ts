import { describe, expect, it } from 'vitest'
import type { CompressorFormValues, CompressionResult } from '../types'
import { COMPRESSOR_DEFAULTS, MAX_FILE_SIZE_MB, MAX_BATCH_SIZE } from '../constants'

describe('COMPRESSOR_DEFAULTS', () => {
  it('has maxSizeMB of 1', () => {
    expect(COMPRESSOR_DEFAULTS.maxSizeMB).toBe(1)
  })

  it('has maxWidth of 1920', () => {
    expect(COMPRESSOR_DEFAULTS.maxWidth).toBe(1920)
  })

  it('has initialQuality of 0.8', () => {
    expect(COMPRESSOR_DEFAULTS.initialQuality).toBe(0.8)
  })

  it('has alwaysKeepResolution as false', () => {
    expect(COMPRESSOR_DEFAULTS.alwaysKeepResolution).toBe(false)
  })

  it('has fileType as "keep"', () => {
    expect(COMPRESSOR_DEFAULTS.fileType).toBe('keep')
  })
})

describe('constants', () => {
  it('MAX_FILE_SIZE_MB is 50', () => {
    expect(MAX_FILE_SIZE_MB).toBe(50)
  })

  it('MAX_BATCH_SIZE is 100', () => {
    expect(MAX_BATCH_SIZE).toBe(100)
  })
})

describe('CompressorFormValues type', () => {
  it('accepts valid form values', () => {
    const values: CompressorFormValues = {
      maxSizeMB: 1,
      maxWidth: 1920,
      initialQuality: 0.8,
      alwaysKeepResolution: false,
      fileType: 'keep',
    }
    expect(values.maxSizeMB).toBe(1)
  })
})

describe('CompressionResult type', () => {
  it('accepts valid result shape', () => {
    const originalFile = new File([''], 'original.jpg', { type: 'image/jpeg' })
    const compressedFile = new File([''], 'compressed.jpg', { type: 'image/jpeg' })
    const result: CompressionResult = { originalFile, compressedFile }
    expect(result.originalFile.name).toBe('original.jpg')
    expect(result.compressedFile.name).toBe('compressed.jpg')
  })
})
