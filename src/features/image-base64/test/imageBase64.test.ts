import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  inferMimeType,
  dataUrlToBlob,
  base64ToFile,
} from '../lib/imageBase64'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(2621440)).toBe('2.5 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('inferMimeType', () => {
  it('returns type when set on file', () => {
    const file = new File([''], 'test.png', { type: 'image/png' })
    expect(inferMimeType(file)).toBe('image/png')
  })

  it('infers jpeg from .jpg extension', () => {
    const file = new File([''], 'photo.jpg', { type: '' })
    expect(inferMimeType(file)).toBe('image/jpeg')
  })

  it('infers jpeg from .jpeg extension', () => {
    const file = new File([''], 'photo.jpeg', { type: '' })
    expect(inferMimeType(file)).toBe('image/jpeg')
  })

  it('infers png from .png extension', () => {
    const file = new File([''], 'image.png', { type: '' })
    expect(inferMimeType(file)).toBe('image/png')
  })

  it('infers gif from .gif extension', () => {
    const file = new File([''], 'anim.gif', { type: '' })
    expect(inferMimeType(file)).toBe('image/gif')
  })

  it('infers webp from .webp extension', () => {
    const file = new File([''], 'photo.webp', { type: '' })
    expect(inferMimeType(file)).toBe('image/webp')
  })

  it('defaults to image/png for unknown extension', () => {
    const file = new File([''], 'unknown.xyz', { type: '' })
    expect(inferMimeType(file)).toBe('image/png')
  })

  it('defaults to image/png for no extension', () => {
    const file = new File([''], 'noext', { type: '' })
    expect(inferMimeType(file)).toBe('image/png')
  })
})

describe('dataUrlToBlob', () => {
  it('converts a data URL to blob', () => {
    const dataUrl = 'data:text/plain;base64,SGVsbG8='
    const blob = dataUrlToBlob(dataUrl)
    expect(blob.type).toBe('text/plain')
  })

  it('defaults mime to image/png when missing', () => {
    const dataUrl = 'data:;base64,SGVsbG8='
    const blob = dataUrlToBlob(dataUrl)
    expect(blob.type).toBe('image/png')
  })
})

describe('base64ToFile', () => {
  it('creates a file from base64', () => {
    const base64 = btoa('hello world')
    const file = base64ToFile(base64, 'test.txt', 'text/plain')
    expect(file.name).toBe('test.txt')
    expect(file.type).toBe('text/plain')
  })
})
