'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Code, RotateCcw, Copy, Check, Download, AlertCircle } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatXml, validateXml } from '../lib/xmlBeautifier'
import { inputSet, outputSet, errorSet, clearAll } from '../xmlBeautifierSlice'

const steps = [{ label: 'Input' }, { label: 'Output' }]

export function XmlBeautifierPage() {
  const dispatch = useAppDispatch()
  const { input, output, error } = useAppSelector((s) => s.xmlBeautifier)
  const [indent, setIndent] = useState(2)
  const [isCopied, setIsCopied] = useState(false)

  const handleFormat = () => {
    if (!input.trim()) {
      dispatch(errorSet('Please enter XML to format'))
      return
    }
    try {
      const formatted = formatXml(input, indent)
      dispatch(outputSet(formatted))
      toast.success('XML formatted!')
    } catch {
      dispatch(errorSet('Failed to format XML'))
    }
  }

  const handleValidate = () => {
    if (!input.trim()) {
      dispatch(errorSet('Please enter XML to validate'))
      return
    }
    const result = validateXml(input)
    if (result.valid) {
      dispatch(outputSet('✅ Valid XML'))
      toast.success('XML is valid!')
    } else {
      dispatch(errorSet(result.error || 'Invalid XML'))
    }
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
    const blob = new Blob([output], { type: 'text/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.xml'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const handleClear = () => {
    dispatch(clearAll())
    setIsCopied(false)
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={input.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code /> XML Formatter & Validator
          </CardTitle>
          <CardDescription>
            Format, prettify, and validate XML documents locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Indent Size</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={indent}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v >= 1 && v <= 8) setIndent(v)
                }}
                className="w-24"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleFormat}
                disabled={!input.trim()}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                <Code /> Format
              </Button>
              <Button
                onClick={handleValidate}
                disabled={!input.trim()}
                variant="outline"
              >
                Validate
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={!input}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono">{error}</AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              XML Input
            </Label>
            <Textarea
              value={input}
              onChange={(e) => dispatch(inputSet(e.target.value))}
              placeholder='<root><item>Hello</item></root>'
              className="min-h-48 resize-y font-mono text-sm"
            />
          </div>

          {/* Output */}
          {output && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Formatted Output
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className={`h-7 w-7 transition-all duration-300 ${isCopied ? 'text-green-500 bg-green-500/10' : ''}`}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-7 w-7"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={output}
                className="min-h-48 resize-y font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
