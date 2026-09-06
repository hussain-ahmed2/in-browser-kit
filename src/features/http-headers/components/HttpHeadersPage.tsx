'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FileSearch, Copy, Check, Shield, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepIndicator } from '@/components/StepIndicator'
import { checkHeaders, isSecurityHeader } from '../lib/httpHeaders'
import {
  urlSet,
  processingStarted,
  resultSet,
  errorSet,
  clearAll,
} from '../httpHeadersSlice'

const steps = [{ label: 'Input' }, { label: 'Results' }]

export function HttpHeadersPage() {
  const dispatch = useAppDispatch()
  const { url, result, error, isProcessing } = useAppSelector(
    (s) => s.httpHeaders
  )
  const [copied, setCopied] = useState(false)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }
    dispatch(processingStarted())
    try {
      const res = await checkHeaders(url)
      dispatch(resultSet(res))
      toast.success('Headers fetched!')
    } catch (err) {
      dispatch(errorSet(err instanceof Error ? err.message : 'Check failed'))
      toast.error('Failed to check headers')
    }
  }

  const handleCopy = () => {
    if (result) {
      const text = Object.entries(result.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
      navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Headers copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    dispatch(clearAll())
    toast.success('Cleared!')
  }

  const headerEntries = result ? Object.entries(result.headers) : []
  const securityHeaders = headerEntries.filter(([k]) => isSecurityHeader(k))
  const otherHeaders = headerEntries.filter(([k]) => !isSecurityHeader(k))

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 1 : 0} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch /> HTTP Headers Checker
          </CardTitle>
          <CardDescription>
            Inspect HTTP response headers, security headers, and connection
            timing for any URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCheck} className="space-y-2">
            <Label className="text-sm font-medium">URL to Check</Label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => dispatch(urlSet(e.target.value))}
                placeholder="https://example.com"
                className="font-mono"
              />
              <Button
                type="submit"
                disabled={isProcessing || !url.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <FileSearch />
                {isProcessing ? 'Checking...' : 'Check'}
              </Button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-sm font-bold ${
                      result.statusCode && result.statusCode >= 200 && result.statusCode < 300
                        ? 'bg-green-600/10 text-green-500'
                        : result.statusCode && result.statusCode >= 400
                        ? 'bg-red-600/10 text-red-500'
                        : 'bg-yellow-600/10 text-yellow-500'
                    }`}
                  >
                    {result.statusCode ?? 'N/A'}
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-xs">
                    {result.url}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Timing */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Timing</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'DNS', value: `${result.timing.dns}ms` },
                    { label: 'Connect', value: `${result.timing.connect}ms` },
                    { label: 'TLS', value: `${result.timing.tls}ms` },
                    { label: 'TTFB', value: `${result.timing.ttfb}ms` },
                    { label: 'Total', value: `${result.timing.total}ms` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-bold font-mono text-foreground">
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Headers */}
              {securityHeaders.length > 0 && (
                <div className="p-4 rounded-xl bg-green-600/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-green-500">
                      Security Headers ({securityHeaders.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {securityHeaders.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-start gap-1 p-2 rounded-lg bg-green-600/5"
                      >
                        <span className="font-mono text-xs font-bold text-green-500 min-w-[200px]">
                          {key}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground break-all">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Headers */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium mb-3">
                  All Headers ({otherHeaders.length})
                </p>
                {otherHeaders.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No additional headers found.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {otherHeaders.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-start gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-mono text-xs font-bold text-blue-500 min-w-[200px]">
                          {key}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground break-all">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleClear} className="w-full">
            Clear
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
