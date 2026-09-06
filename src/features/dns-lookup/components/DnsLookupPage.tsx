'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Search, Copy, Check } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepIndicator } from '@/components/StepIndicator'
import { lookupDns, DNS_RECORD_TYPES } from '../lib/dnsLookup'
import {
  domainSet,
  recordTypeSet,
  processingStarted,
  resultSet,
  errorSet,
  clearAll,
} from '../dnsLookupSlice'

const steps = [{ label: 'Input' }, { label: 'Results' }]

export function DnsLookupPage() {
  const dispatch = useAppDispatch()
  const { domain, result, recordType, error, isProcessing } = useAppSelector(
    (s) => s.dnsLookup
  )
  const [copied, setCopied] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) {
      toast.error('Please enter a domain')
      return
    }
    dispatch(processingStarted())
    try {
      const res = await lookupDns(domain, recordType)
      dispatch(resultSet(res))
      toast.success('DNS lookup complete!')
    } catch (err) {
      dispatch(errorSet(err instanceof Error ? err.message : 'Lookup failed'))
      toast.error('Failed to lookup DNS records')
    }
  }

  const handleCopy = () => {
    if (result) {
      const text = result.records
        .map((r) => `${r.type}\t${r.data}\tTTL: ${r.ttl}`)
        .join('\n')
      navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Records copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    dispatch(clearAll())
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 1 : 0} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search /> DNS Record Lookup
          </CardTitle>
          <CardDescription>
            Query DNS records for any domain using Cloudflare DNS-over-HTTPS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Domain Name</Label>
              <Input
                value={domain}
                onChange={(e) => dispatch(domainSet(e.target.value))}
                placeholder="e.g. example.com"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Record Type</Label>
              <Select
                value={recordType}
                onValueChange={(val) => dispatch(recordTypeSet(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  {DNS_RECORD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isProcessing || !domain.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Search />
              {isProcessing ? 'Looking up...' : 'Lookup DNS Records'}
            </Button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {result.domain} — {recordType} records
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Query time: {result.queryTime}ms • {result.records.length}{' '}
                    record(s)
                  </p>
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

              {result.records.length === 0 ? (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center text-muted-foreground text-sm">
                  No records found for {recordType} type.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground font-medium">
                          Type
                        </th>
                        <th className="text-left p-3 text-muted-foreground font-medium">
                          Data
                        </th>
                        <th className="text-right p-3 text-muted-foreground font-medium">
                          TTL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records.map((record, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-md bg-blue-600/10 text-blue-500 font-mono text-xs font-bold">
                              {record.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs break-all">
                            {record.data}
                          </td>
                          <td className="p-3 text-right text-muted-foreground font-mono text-xs">
                            {record.ttl}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
