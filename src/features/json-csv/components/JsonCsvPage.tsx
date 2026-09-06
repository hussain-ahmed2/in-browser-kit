'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Table, RotateCcw, Copy, Check, Download, ArrowLeftRight, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { jsonToCsv, csvToJson } from '../lib/jsonCsv'
import { inputSet, outputSet, errorSet, swapMode, clearAll } from '../jsonCsvSlice'

const steps = [{ label: 'Input' }, { label: 'Output' }]

export function JsonCsvPage() {
  const dispatch = useAppDispatch()
  const { input, output, mode, error } = useAppSelector((s) => s.jsonCsv)
  const [isCopied, setIsCopied] = useState(false)

  const handleConvert = () => {
    if (!input.trim()) {
      dispatch(errorSet('Please enter data to convert'))
      return
    }
    try {
      if (mode === 'json-to-csv') {
        const result = jsonToCsv(input)
        dispatch(outputSet(result))
        toast.success('JSON converted to CSV!')
      } else {
        const result = csvToJson(input)
        const formatted = JSON.stringify(result, null, 2)
        dispatch(outputSet(formatted))
        toast.success('CSV converted to JSON!')
      }
    } catch (e) {
      dispatch(errorSet(e instanceof Error ? e.message : 'Conversion failed'))
    }
  }

  const handleSwap = () => {
    dispatch(swapMode())
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const ext = mode === 'json-to-csv' ? 'csv' : 'json'
    const type = mode === 'json-to-csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([output], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const handleClear = () => {
    dispatch(clearAll())
    setIsCopied(false)
    toast.success('Cleared!')
  }

  const inputLabel = mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input'
  const outputLabel = mode === 'json-to-csv' ? 'CSV Output' : 'JSON Output'

  return (
    <>
      <StepIndicator steps={steps} currentStep={input.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table /> JSON ↔ CSV Converter
          </CardTitle>
          <CardDescription>
            Convert between JSON and CSV formats with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-sm font-medium">
              {mode === 'json-to-csv' ? 'JSON' : 'CSV'} → {mode === 'json-to-csv' ? 'CSV' : 'JSON'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              className="group hover:bg-brand hover:text-brand-foreground hover:border-brand transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              Swap Direction
            </Button>
            <div className="flex-1" />
            <Button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
            >
              <Table /> Convert
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={!input}>
              <RotateCcw /> Clear
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2 flex flex-col">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {inputLabel}
              </Label>
              <Textarea
                value={input}
                onChange={(e) => dispatch(inputSet(e.target.value))}
                placeholder={
                  mode === 'json-to-csv'
                    ? '[{"name":"John","age":30},{"name":"Jane","age":25}]'
                    : 'name,age\nJohn,30\nJane,25'
                }
                className="flex-1 min-h-96 resize-y font-mono text-sm"
              />
            </div>

            {/* Output */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {outputLabel}
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!output}
                    className={`h-7 w-7 transition-all duration-300 ${isCopied ? 'text-green-500 bg-green-500/10' : ''}`}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    disabled={!output}
                    className="h-7 w-7"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={output || ''}
                placeholder="Converted output will appear here..."
                className="flex-1 min-h-96 resize-y font-mono text-sm bg-secondary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
