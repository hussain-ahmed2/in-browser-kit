'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Globe, MapPin, Copy, Check, Search } from 'lucide-react'
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
import { lookupIp } from '../lib/ipLookup'
import {
  processingStarted,
  ipInfoSet,
  errorSet,
  clearAll,
} from '../ipLookupSlice'

const steps = [{ label: 'Input' }, { label: 'Results' }]

export function IpLookupPage() {
  const dispatch = useAppDispatch()
  const { ipInfo, error, isProcessing } = useAppSelector((s) => s.ipLookup)
  const [manualIp, setManualIp] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!ipInfo && !isProcessing && !error) {
      handleLookup('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLookup = async (ip: string) => {
    dispatch(processingStarted())
    try {
      const result = await lookupIp(ip || undefined)
      dispatch(ipInfoSet(result))
      toast.success('IP lookup complete!')
    } catch (err) {
      dispatch(errorSet(err instanceof Error ? err.message : 'Lookup failed'))
      toast.error('Failed to lookup IP')
    }
  }

  const handleCopyIp = () => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip)
      setCopied(true)
      toast.success('IP copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    dispatch(clearAll())
    setManualIp('')
    toast.success('Cleared!')
  }

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualIp.trim()) {
      handleLookup(manualIp)
    }
  }

  const mapUrl =
    ipInfo && ipInfo.latitude && ipInfo.longitude
      ? `https://www.google.com/maps?q=${ipInfo.latitude},${ipInfo.longitude}`
      : null

  return (
    <>
      <StepIndicator steps={steps} currentStep={ipInfo ? 1 : 0} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe /> IP Address Lookup
          </CardTitle>
          <CardDescription>
            Look up IP address details including location, ISP, timezone, and
            coordinates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleManualLookup} className="space-y-2">
            <Label className="text-sm font-medium">
              Manual IP Lookup (leave empty for your own IP)
            </Label>
            <div className="flex gap-2">
              <Input
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                placeholder="e.g. 8.8.8.8"
                className="font-mono"
              />
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Search />
                {isProcessing ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {ipInfo && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                <Globe className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {manualIp ? 'Looked-up IP' : 'Your IP Address'}
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {ipInfo.ip}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIp}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: 'City', value: ipInfo.city, icon: '🏙️' },
                  { label: 'Region', value: ipInfo.region, icon: '🗺️' },
                  { label: 'Country', value: ipInfo.country, icon: '🌍' },
                  { label: 'Postal', value: ipInfo.postal, icon: '📮' },
                  { label: 'Timezone', value: ipInfo.timezone, icon: '🕐' },
                  { label: 'ISP / Org', value: ipInfo.org, icon: '🏢' },
                  {
                    label: 'Latitude',
                    value: String(ipInfo.latitude),
                    icon: '📍',
                  },
                  {
                    label: 'Longitude',
                    value: String(ipInfo.longitude),
                    icon: '📍',
                  },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="p-4 rounded-xl bg-secondary/50 border border-border text-center space-y-1"
                  >
                    <p className="text-2xl">{icon}</p>
                    <p className="text-sm font-bold text-foreground truncate">
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border text-sm text-blue-500 hover:bg-secondary transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  View on Google Maps
                </a>
              )}
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleClear}
            className="w-full"
          >
            Clear
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
