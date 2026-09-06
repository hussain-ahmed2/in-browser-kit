'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Paintbrush, RotateCcw, Copy, Check, Download } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { minifyCss, beautifyCss, compareSizes } from '../lib/cssMinifier'
import { inputSet, outputSet, modeSet, clearAll } from '../cssMinifierSlice'

const steps = [{ label: 'Input' }, { label: 'Output' }]

export function CssMinifierPage() {
  const dispatch = useAppDispatch()
  const { input, output, mode } = useAppSelector((s) => s.cssMinifier)
  const [isCopied, setIsCopied] = useState(false)

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error('Please enter CSS to process')
      return
    }
    const result = mode === 'minify' ? minifyCss(input) : beautifyCss(input)
    dispatch(outputSet(result))
    toast.success(mode === 'minify' ? 'CSS minified!' : 'CSS beautified!')
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
    const blob = new Blob([output], { type: 'text/css;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'minify' ? 'minified.css' : 'beautified.css'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const handleClear = () => {
    dispatch(clearAll())
    setIsCopied(false)
    toast.success('Cleared!')
  }

  const sizeComparison = output ? compareSizes(input, output) : null

  return (
    <>
      <StepIndicator steps={steps} currentStep={input.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush /> CSS Minifier & Beautifier
          </CardTitle>
          <CardDescription>
            Minify CSS for production or beautify it for readability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mode</Label>
              <Select
                value={mode}
                onValueChange={(v) => dispatch(modeSet(v as 'minify' | 'beautify'))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minify">Minify</SelectItem>
                  <SelectItem value="beautify">Beautify</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleProcess}
                disabled={!input.trim()}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                <Paintbrush /> {mode === 'minify' ? 'Minify' : 'Beautify'}
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={!input}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2 flex flex-col">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                CSS Input
              </Label>
              <Textarea
                value={input}
                onChange={(e) => dispatch(inputSet(e.target.value))}
                placeholder="Paste your CSS here..."
                className="flex-1 min-h-96 resize-y font-mono text-sm"
              />
            </div>

            {/* Output */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {mode === 'minify' ? 'Minified' : 'Beautified'} Output
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
                placeholder="Result will appear here..."
                className="flex-1 min-h-96 resize-y font-mono text-sm bg-secondary/20"
              />
            </div>
          </div>

          {/* Size comparison */}
          {sizeComparison && (
            <div className="grid grid-cols-3 gap-4 text-sm animate-fade-in">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="font-medium">{sizeComparison.original} B</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className="font-medium">{sizeComparison.result} B</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-xs text-muted-foreground">Saved</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {sizeComparison.savedPercent > 0 ? `-${sizeComparison.savedPercent}%` : '0%'}
                  {' '}({sizeComparison.saved} B)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
