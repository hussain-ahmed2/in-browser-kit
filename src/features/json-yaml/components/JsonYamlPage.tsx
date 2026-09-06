'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ArrowLeftRight, Copy, Check, RotateCcw } from 'lucide-react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { inputSet, outputSet, modeSet, clearAll } from '../jsonYamlSlice'
import { jsonToYaml, yamlToJson } from '../lib/jsonYaml'

export function JsonYamlPage() {
  const dispatch = useAppDispatch()
  const { input, output, mode } = useAppSelector((s) => s.jsonYaml)
  const [isCopied, setIsCopied] = useState(false)

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please enter input to convert')
      return
    }
    try {
      const result = mode === 'json-to-yaml' ? jsonToYaml(input) : yamlToJson(input)
      dispatch(outputSet(result))
      toast.success(`Converted ${mode === 'json-to-yaml' ? 'JSON to YAML' : 'YAML to JSON'}!`)
    } catch (err) {
      toast.error(`Invalid ${mode === 'json-to-yaml' ? 'JSON' : 'YAML'} input.`)
    }
  }, [input, mode, dispatch])

  const handleSwap = () => {
    const newMode = mode === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'
    dispatch(modeSet(newMode))
    if (output) dispatch(inputSet(output))
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight /> JSON ↔ YAML Converter
        </CardTitle>
        <CardDescription>
          Convert between JSON and YAML formats with ease.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex gap-2">
            <Button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              {mode === 'json-to-yaml' ? 'JSON → YAML' : 'YAML → JSON'}
            </Button>
            <Button variant="outline" onClick={handleSwap}>
              <ArrowLeftRight className="w-4 h-4 mr-1" /> Swap
            </Button>
            <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!input}>
              <RotateCcw /> Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {mode === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
            </Label>
            <Textarea
              value={input}
              onChange={(e) => dispatch(inputSet(e.target.value))}
              placeholder={mode === 'json-to-yaml' ? '{\n  "key": "value"\n}' : 'key: value'}
              className="flex-1 min-h-96 resize-y font-mono text-sm"
            />
          </div>

          {/* Output */}
          <div className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {mode === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'}
              </Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={!output}
                className={`h-7 w-7 transition-all duration-300 ${isCopied ? 'text-green-500 bg-green-500/10' : ''}`}
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <Textarea
              readOnly
              value={output || ''}
              placeholder="Converted result will appear here..."
              className="flex-1 min-h-96 resize-y font-mono text-sm bg-secondary/20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
