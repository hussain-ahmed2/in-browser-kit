import { describe, expect, it } from 'vitest'
import { isSecurityHeader } from '../lib/httpHeaders'

describe('HTTP Headers', () => {
  describe('isSecurityHeader', () => {
    it('identifies HSTS as a security header', () => {
      expect(isSecurityHeader('strict-transport-security')).toBe(true)
    })

    it('identifies CSP as a security header', () => {
      expect(isSecurityHeader('content-security-policy')).toBe(true)
    })

    it('identifies X-Frame-Options as a security header', () => {
      expect(isSecurityHeader('x-frame-options')).toBe(true)
    })

    it('identifies X-Content-Type-Options as a security header', () => {
      expect(isSecurityHeader('x-content-type-options')).toBe(true)
    })

    it('identifies Referrer-Policy as a security header', () => {
      expect(isSecurityHeader('referrer-policy')).toBe(true)
    })

    it('identifies Permissions-Policy as a security header', () => {
      expect(isSecurityHeader('permissions-policy')).toBe(true)
    })

    it('does not identify Content-Type as a security header', () => {
      expect(isSecurityHeader('content-type')).toBe(false)
    })

    it('does not identify Server as a security header', () => {
      expect(isSecurityHeader('server')).toBe(false)
    })

    it('handles case-insensitive header names', () => {
      expect(isSecurityHeader('Strict-Transport-Security')).toBe(true)
      expect(isSecurityHeader('strict-transport-security')).toBe(true)
      expect(isSecurityHeader('CONTENT-SECURITY-POLICY')).toBe(true)
    })
  })
})
