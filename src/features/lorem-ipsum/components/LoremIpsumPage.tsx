'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { BookText, RotateCcw, Download, Copy, Check } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { generateLorem, type LoremOptions } from '../lib/loremIpsum'
import { resultSet, clearAll } from '../loremIpsumSlice'

const steps = [{ label: 'Configure' }, { label: 'Result' }]

export function LoremIpsumPage() {
  const dispatch = useAppDispatch()
  const { result } = useAppSelector((s) => s.loremIpsum)
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const handleGenerate = () => {
    const options: LoremOptions = { type, count, startWithLorem }
    const text = generateLorem(options)
    dispatch(resultSet(text))
    toast.success('Lorem ipsum generated!')
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
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
            <BookText /> Lorem Ipsum Generator
          </CardTitle>
          <CardDescription>
            Generate realistic placeholder text for your designs and mockups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="words">Words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Count (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v >= 1 && v <= 100) setCount(v)
                }}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <Checkbox
                  checked={startWithLorem}
                  onCheckedChange={(checked) => setStartWithLorem(checked === true)}
                />
                <span className="text-sm">Start with &quot;Lorem ipsum&quot;</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
          >
            <BookText /> Generate
          </Button>

          {result && (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-sm font-medium">Generated Text</Label>
              <Textarea
                readOnly
                value={result}
                className="min-h-48 resize-y font-mono text-sm"
              />

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {isCopied ? <Check /> : <Copy />} {isCopied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                  <Download /> Download
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw /> Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
