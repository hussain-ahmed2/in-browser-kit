'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Clock, RotateCcw, Copy, Check, Zap, Share2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  generateCron,
  describeCron,
  COMMON_EXPRESSIONS,
  type CronFields,
} from '../lib/cronGenerator'
import { expressionSet, descriptionSet, clearAll } from '../cronGeneratorSlice'
import { copyShareableUrl, decodeToolConfig } from '@/lib/shareableUrl'

const steps = [{ label: 'Configure' }, { label: 'Result' }]

const MINUTE_OPTIONS = ['*', '*/5', '*/10', '*/15', '*/30', '0', '15', '30', '45']
const HOUR_OPTIONS = ['*', '*/2', '*/4', '*/6', '*/8', '*/12', '0', '1', '6', '8', '9', '12', '18']
const DAY_OF_MONTH_OPTIONS = ['*', '1', '15', '*/7', '*/15', '1,15']
const MONTH_OPTIONS = ['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const DAY_OF_WEEK_OPTIONS = ['*', '0', '1', '2', '3', '4', '5', '6', '1-5', '0,6']

export function CronGeneratorPage() {
  const dispatch = useAppDispatch()
  const { expression, description } = useAppSelector((s) => s.cronGenerator)
  const [fields, setFields] = useState<CronFields>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  })
  const [directInput, setDirectInput] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [mode, setMode] = useState<'builder' | 'direct'>('builder')

  // Load config from URL hash on mount
  useEffect(() => {
    const config = decodeToolConfig('cron-generator')
    if (config) {
      if (config.fields && typeof config.fields === 'object') {
        setFields(config.fields as CronFields)
      }
      if (typeof config.directInput === 'string') {
        setDirectInput(config.directInput)
      }
      if (config.mode === 'builder' || config.mode === 'direct') {
        setMode(config.mode)
      }
      if (typeof config.expression === 'string' && config.expression) {
        dispatch(expressionSet(config.expression))
        if (Array.isArray(config.description)) {
          dispatch(descriptionSet(config.description as string[]))
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShare = async () => {
    try {
      await copyShareableUrl('cron-generator', {
        fields,
        directInput,
        mode,
        expression,
        description,
      })
      toast.success('Link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleGenerate = () => {
    const cronExpr = generateCron(fields)
    dispatch(expressionSet(cronExpr))
    const desc = describeCron(cronExpr)
    dispatch(descriptionSet(desc))
    toast.success('Cron expression generated!')
  }

  const handleDirectDescribe = () => {
    if (!directInput.trim()) {
      toast.error('Enter a cron expression')
      return
    }
    const desc = describeCron(directInput.trim())
    dispatch(expressionSet(directInput.trim()))
    dispatch(descriptionSet(desc))
    toast.success('Expression described!')
  }

  const handleQuickSelect = (value: string) => {
    setDirectInput(value)
    const desc = describeCron(value)
    dispatch(expressionSet(value))
    dispatch(descriptionSet(desc))
    setMode('direct')
  }

  const handleCopy = () => {
    if (!expression) return
    navigator.clipboard.writeText(expression)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleClear = () => {
    dispatch(clearAll())
    setFields({ minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' })
    setDirectInput('')
    setIsCopied(false)
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={expression ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock /> Cron Expression Generator
          </CardTitle>
          <CardDescription>
            Build cron expressions visually or describe existing ones in
            human-readable form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick presets */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" /> Quick Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_EXPRESSIONS.map(({ label, value }) => (
                <button
                  key={value + label}
                  onClick={() => handleQuickSelect(value)}
                  className="px-2.5 py-1 rounded-md bg-background border border-border text-xs hover:bg-secondary/50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'builder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('builder')}
            >
              Field Builder
            </Button>
            <Button
              variant={mode === 'direct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('direct')}
            >
              Direct Input
            </Button>
          </div>

          {mode === 'builder' ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Minute</Label>
                <Select
                  value={fields.minute}
                  onValueChange={(v) => setFields({ ...fields, minute: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hour</Label>
                <Select
                  value={fields.hour}
                  onValueChange={(v) => setFields({ ...fields, hour: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Day of Month</Label>
                <Select
                  value={fields.dayOfMonth}
                  onValueChange={(v) => setFields({ ...fields, dayOfMonth: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_MONTH_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Month</Label>
                <Select
                  value={fields.month}
                  onValueChange={(v) => setFields({ ...fields, month: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Day of Week</Label>
                <Select
                  value={fields.dayOfWeek}
                  onValueChange={(v) => setFields({ ...fields, dayOfWeek: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_WEEK_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cron Expression</Label>
              <Input
                value={directInput}
                onChange={(e) => setDirectInput(e.target.value)}
                placeholder="* * * * *"
                className="font-mono"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={mode === 'builder' ? handleGenerate : handleDirectDescribe}
              className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
            >
              <Clock /> {mode === 'builder' ? 'Generate' : 'Describe'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 /> Share
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw /> Clear
            </Button>
          </div>

          {/* Results */}
          {expression && description && (
            <div className="space-y-3 animate-fade-in p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Expression</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={`h-7 w-7 transition-all duration-300 ${isCopied ? 'text-green-500 bg-green-500/10' : ''}`}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <code className="block p-3 rounded-md bg-background font-mono text-sm">
                {expression}
              </code>

              <Label className="text-sm font-medium">Description</Label>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {description.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
