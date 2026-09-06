'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ScanLine, Copy, Check, Plus, X } from 'lucide-react'
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
import { COMMON_PORTS, type PortResult } from '../types'
import { scanPorts } from '../lib/portScanner'
import {
  hostSet,
  processingStarted,
  portResultAdded,
  resultSet,
  clearAll,
} from '../portScannerSlice'

const steps = [{ label: 'Input' }, { label: 'Results' }]

const statusColors: Record<string, string> = {
  open: 'bg-green-600/10 text-green-500 border-green-500/30',
  closed: 'bg-red-600/10 text-red-500 border-red-500/30',
  filtered: 'bg-yellow-600/10 text-yellow-500 border-yellow-500/30',
}

const statusDotColors: Record<string, string> = {
  open: 'bg-green-500',
  closed: 'bg-red-500',
  filtered: 'bg-yellow-500',
}

export function PortScannerPage() {
  const dispatch = useAppDispatch()
  const { host, results, isProcessing } = useAppSelector(
    (s) => s.portScanner
  )
  const [selectedPorts, setSelectedPorts] = useState<Set<number>>(
    new Set([80, 443, 22])
  )
  const [customPort, setCustomPort] = useState('')
  const [copied, setCopied] = useState(false)

  const togglePort = (port: number) => {
    setSelectedPorts((prev) => {
      const next = new Set(prev)
      if (next.has(port)) {
        next.delete(port)
      } else {
        next.add(port)
      }
      return next
    })
  }

  const addCustomPort = () => {
    const port = parseInt(customPort, 10)
    if (port > 0 && port <= 65535) {
      setSelectedPorts((prev) => new Set([...prev, port]))
      setCustomPort('')
    } else {
      toast.error('Invalid port number (1-65535)')
    }
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) {
      toast.error('Please enter a host')
      return
    }
    if (selectedPorts.size === 0) {
      toast.error('Please select at least one port')
      return
    }

    dispatch(processingStarted())
    const ports = Array.from(selectedPorts).sort((a, b) => a - b)

    try {
      const results = await scanPorts(host, ports, 3000, (result) => {
        dispatch(portResultAdded(result))
      })
      dispatch(resultSet(results))
      toast.success(`Scanned ${ports.length} port(s)!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scan failed')
      dispatch(resultSet([]))
    }
  }

  const handleCopy = () => {
    if (results.length > 0) {
      const text = results
        .map(
          (r) =>
            `${r.host}:${r.port} — ${r.status} (${r.responseTime}ms)`
        )
        .join('\n')
      navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Results copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    dispatch(clearAll())
    setSelectedPorts(new Set([80, 443, 22]))
    setCustomPort('')
    toast.success('Cleared!')
  }

  const openCount = results.filter((r) => r.status === 'open').length
  const closedCount = results.filter((r) => r.status === 'closed').length
  const filteredCount = results.filter((r) => r.status === 'filtered').length

  return (
    <>
      <StepIndicator
        steps={steps}
        currentStep={results.length > 0 ? 1 : 0}
      />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine /> Port Scanner
          </CardTitle>
          <CardDescription>
            Check if common or custom ports are open on a host. Useful for
            network diagnostics and server setup verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleScan} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Host / Domain</Label>
              <Input
                value={host}
                onChange={(e) => dispatch(hostSet(e.target.value))}
                placeholder="e.g. example.com or 192.168.1.1"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Common Ports
              </Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_PORTS.map(({ port, name }) => (
                  <button
                    key={port}
                    type="button"
                    onClick={() => togglePort(port)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      selectedPorts.has(port)
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-500'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {name} ({port})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Custom Port</Label>
              <div className="flex gap-2">
                <Input
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  placeholder="e.g. 8080"
                  className="font-mono max-w-[200px]"
                  type="number"
                  min={1}
                  max={65535}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomPort}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {selectedPorts.size > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(selectedPorts)
                  .sort((a, b) => a - b)
                  .map((port) => (
                    <span
                      key={port}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 border border-border text-xs font-mono"
                    >
                      {port}
                      <button
                        type="button"
                        onClick={() => togglePort(port)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={isProcessing || !host.trim() || selectedPorts.size === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <ScanLine />
              {isProcessing
                ? 'Scanning...'
                : `Scan ${selectedPorts.size} Port(s)`}
            </Button>
          </form>

          {results.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs">
                  <span className="text-green-500">
                    ● {openCount} open
                  </span>
                  <span className="text-red-500">
                    ● {closedCount} closed
                  </span>
                  <span className="text-yellow-500">
                    ● {filteredCount} filtered
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-medium">
                        Status
                      </th>
                      <th className="text-left p-3 text-muted-foreground font-medium">
                        Port
                      </th>
                      <th className="text-left p-3 text-muted-foreground font-medium">
                        Host
                      </th>
                      <th className="text-right p-3 text-muted-foreground font-medium">
                        Response Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .sort((a, b) => a.port - b.port)
                      .map((r) => (
                        <tr
                          key={r.port}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-bold capitalize ${statusColors[r.status]}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${statusDotColors[r.status]}`}
                              />
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {r.port}
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {r.host}
                          </td>
                          <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                            {r.responseTime}ms
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
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
