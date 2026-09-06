'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { CaseSensitive, RotateCcw, Check } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { convertCase, CASE_TYPES, type CaseType } from '../lib/caseConverter'
import { textSet, convertedSet, clearAll } from '../caseConverterSlice'

const steps = [{ label: 'Input' }, { label: 'Convert' }]

export function CaseConverterPage() {
  const dispatch = useAppDispatch()
  const { text, converted } = useAppSelector((s) => s.caseConverter)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleConvert = (targetCase: CaseType) => {
    const result = convertCase(text, targetCase)
    dispatch(convertedSet(result))
  }

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleClear = () => {
    dispatch(clearAll())
    setCopiedIndex(null)
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={text.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CaseSensitive /> Text Case Converter
          </CardTitle>
          <CardDescription>
            Convert text between different case formats instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Input Text</Label>
            <Textarea
              value={text}
              onChange={(e) => dispatch(textSet(e.target.value))}
              placeholder="Type or paste your text here..."
              className="min-h-32 resize-y font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CASE_TYPES.map(({ label, value }, index) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => handleConvert(value)}
                disabled={!text.trim()}
                className="justify-start text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {converted !== null && (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-sm font-medium">Result</Label>
              <div className="relative">
                <Textarea
                  readOnly
                  value={converted}
                  className="min-h-32 resize-y font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {CASE_TYPES.map(({ label, value }, index) => {
                  const result = convertCase(text, value)
                  return (
                    <button
                      key={value}
                      onClick={() => handleCopy(result, index)}
                      className={cn(
                        'flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-secondary/30 text-xs font-mono text-left hover:bg-secondary/60 transition-colors'
                      )}
                    >
                      <span className="truncate">{result}</span>
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!text}
            className="w-full"
          >
            <RotateCcw /> Clear
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
