import { describe, expect, it } from 'vitest'
import type { RotateOptions, FlipDirection } from '../lib/imageRotate'

describe('RotateOptions type', () => {
  it('accepts valid degrees', () => {
    const opts: RotateOptions = { degrees: 90 }
    expect(opts.degrees).toBe(90)
  })

  it('accepts flip option', () => {
    const opts: RotateOptions = { degrees: 0, flip: 'horizontal' }
    expect(opts.flip).toBe('horizontal')
  })
})

describe('FlipDirection type', () => {
  it('accepts horizontal', () => {
    const dir: FlipDirection = 'horizontal'
    expect(dir).toBe('horizontal')
  })

  it('accepts vertical', () => {
    const dir: FlipDirection = 'vertical'
    expect(dir).toBe('vertical')
  })
})
