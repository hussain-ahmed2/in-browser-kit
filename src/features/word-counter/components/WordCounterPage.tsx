'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Type, RotateCcw } from 'lucide-react'
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
import { countStats } from '../lib/wordCounter'
import { textSet, resultSet, clearAll } from '../wordCounterSlice'

const steps = [{ label: 'Input' }, { label: 'Results' }]

const statCards = [
  { key: 'words' as const, label: 'Words', icon: '📝' },
  { key: 'characters' as const, label: 'Characters', icon: '🔤' },
  { key: 'charactersNoSpaces' as const, label: 'Characters (no spaces)', icon: '🔡' },
  { key: 'sentences' as const, label: 'Sentences', icon: '📄' },
  { key: 'paragraphs' as const, label: 'Paragraphs', icon: '📑' },
  { key: 'readingTime' as const, label: 'Reading Time (~200wpm)', icon: '📖' },
  { key: 'speakingTime' as const, label: 'Speaking Time (~150wpm)', icon: '🎙️' },
]

export function WordCounterPage() {
  const dispatch = useAppDispatch()
  const { text, result } = useAppSelector((s) => s.wordCounter)

  useEffect(() => {
    const r = countStats(text)
    dispatch(resultSet(r))
  }, [text, dispatch])

  const handleClear = () => {
    dispatch(clearAll())
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={text.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type /> Word & Character Counter
          </CardTitle>
          <CardDescription>
            Count words, characters, sentences, paragraphs, and estimate
            reading/speaking time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Input Text</Label>
            <Textarea
              value={text}
              onChange={(e) => dispatch(textSet(e.target.value))}
              placeholder="Type or paste your text here..."
              className="min-h-48 resize-y font-mono text-sm"
            />
          </div>

          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
              {statCards.map(({ key, label, icon }) => (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-secondary/50 border border-border text-center space-y-1"
                >
                  <p className="text-2xl">{icon}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {String(result[key])}
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
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
