'use client'

import { useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Database, Copy, Download, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { generateFakeData, DATA_TYPE_LABELS, type FakeDataType } from '../lib/fakeData'
import { dataTypeSet, countSet, resultsSet, clearResults } from '../fakeDataSlice'

const steps = [{ label: 'Configure' }, { label: 'Results' }]
const dataTypes = Object.keys(DATA_TYPE_LABELS) as FakeDataType[]

export function FakeDataPage() {
  const dispatch = useAppDispatch()
  const { dataType, count, results } = useAppSelector((s) => s.fakeData)
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1000)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    const data = generateFakeData(dataType as FakeDataType, count, min, max)
    dispatch(resultsSet(data))
    toast.success(`Generated ${count} ${DATA_TYPE_LABELS[dataType as FakeDataType].toLowerCase()}`)
  }, [dataType, count, min, max, dispatch])

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(results.join('\n'))
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fake-${dataType}-${count}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Downloaded JSON!')
  }

  const handleDownloadCSV = () => {
    const lines = results.map((r, i) => `${i + 1},"${r.replace(/"/g, '""')}"`)
    const csv = `index,value\n${lines.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fake-${dataType}-${count}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Downloaded CSV!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={results.length > 0 ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database /> Fake Data Generator</CardTitle>
          <CardDescription>Generate realistic fake data for testing — names, emails, addresses, and more.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
            {/* Data type selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <select
                value={dataType}
                onChange={(e) => dispatch(dataTypeSet(e.target.value))}
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {dataTypes.map((dt) => (
                  <option key={dt} value={dt}>{DATA_TYPE_LABELS[dt]}</option>
                ))}
              </select>
            </div>

            {/* Count slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Count: {count}</label>
              <input
                type="range"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => dispatch(countSet(Number(e.target.value)))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span><span>500</span><span>1000</span>
              </div>
            </div>

            {/* Number range (conditional) */}
            {dataType === 'numbers' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min</label>
                  <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full p-2 rounded-lg border border-border bg-background text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-full p-2 rounded-lg border border-border bg-background text-sm" />
                </div>
              </div>
            )}

            <Button onClick={handleGenerate} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
              <Database /> Generate {DATA_TYPE_LABELS[dataType as FakeDataType]}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-muted-foreground text-center">{results.length} results generated</p>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary/80 backdrop-blur-sm">
                    <tr>
                      <th className="text-left p-2 text-xs text-muted-foreground font-medium">#</th>
                      <th className="text-left p-2 text-xs text-muted-foreground font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-2 text-xs text-muted-foreground w-12">{i + 1}</td>
                        <td className="p-2 font-mono text-xs break-all">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={handleCopyAll} className="text-xs">
                  <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy All'}
                </Button>
                <Button variant="outline" onClick={handleDownloadJSON} className="text-xs">
                  <Download className="h-3 w-3" /> JSON
                </Button>
                <Button variant="outline" onClick={handleDownloadCSV} className="text-xs">
                  <Download className="h-3 w-3" /> CSV
                </Button>
              </div>
              <Button variant="outline" onClick={() => dispatch(clearResults())} className="w-full"><RotateCcw /> Clear Results</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
