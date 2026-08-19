'use client'

import { useState, useEffect, useMemo } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, FileText, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  FLAG_OPTIONS,
  CHEATSHEET,
} from '../lib/regexTester'

interface MatchHighlightProps {
  text: string
  matches: Array<{ match: string; index: number; indices: [number, number][] }>
}

function MatchHighlighter({ text, matches }: MatchHighlightProps) {
  if (!matches.length) {
    return <Textarea readOnly value={text} className="min-h-[200px] font-mono text-sm" />
  }

  const segments: Array<{ text: string; highlighted: boolean }> = []
  let lastIndex = 0

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlighted: false })
    }
    segments.push({ text: match.match, highlighted: true })
    lastIndex = match.index + match.match.length
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false })
  }

  return (
    <div className="relative min-h-[200px] max-h-[400px] overflow-auto rounded-lg border border-input bg-transparent p-3 font-mono text-sm leading-relaxed">
      <div className="whitespace-pre-wrap break-words">
        {segments.map((seg, i) => (
          <span
            key={i}
            className={cn(
              seg.highlighted &&
                'bg-brand/30 text-brand font-medium rounded px-0.5'
            )}
          >
            {seg.text}
          </span>
        ))}
      </div>
    </div>
  )
}

function testRegexLocal(
  pattern: string,
  flags: string,
  testString: string
): { matches: Array<{ match: string; index: number; groups: Record<string, string>; indices: [number, number][] }>; error: string | null; fullMatch: boolean } {
  if (!pattern) {
    return { matches: [], error: null, fullMatch: false }
  }
  try {
    const regex = new RegExp(pattern, flags)
    const matches: Array<{ match: string; index: number; groups: Record<string, string>; indices: [number, number][] }> = []
    let match: RegExpExecArray | null

    if (flags.includes('g')) {
      regex.lastIndex = 0
      while ((match = regex.exec(testString)) !== null) {
        const groups: Record<string, string> = {}
        if (match.groups) {
          for (const [key, value] of Object.entries(match.groups)) {
            groups[key] = value
          }
        }
        const indices: [number, number][] = []
        if (match.indices) {
          for (const [start, end] of match.indices) {
            indices.push([start, end])
          }
        } else {
          const start = match.index
          const end = match.index + match[0].length
          indices.push([start, end])
        }
        matches.push({ match: match[0], index: match.index, groups, indices })
      }
    } else {
      match = regex.exec(testString)
      if (match) {
        const groups: Record<string, string> = {}
        if (match.groups) {
          for (const [key, value] of Object.entries(match.groups)) {
            groups[key] = value
          }
        }
        const indices: [number, number][] = []
        if (match.indices) {
          for (const [start, end] of match.indices) {
            indices.push([start, end])
          }
        } else {
          const start = match.index
          const end = match.index + match[0].length
          indices.push([start, end])
        }
        matches.push({ match: match[0], index: match.index, groups, indices })
      }
    }
    return { matches, error: null, fullMatch: false }
  } catch (e) {
    return {
      matches: [],
      error: e instanceof Error ? e.message : 'Invalid regular expression',
      fullMatch: false,
    }
  }
}

function replaceRegexLocal(pattern: string, flags: string, testString: string, replacement: string): string {
  if (!pattern || !replacement) return ''
  try {
    const regex = new RegExp(pattern, flags)
    return testString.replace(regex, replacement)
  } catch {
    return ''
  }
}

export function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [replacement, setReplacement] = useState('')
  const [result, setResult] = useState<{
    matches: Array<{ match: string; index: number; groups: Record<string, string>; indices: [number, number][] }>
    error: string | null
    fullMatch: boolean
  }>({ matches: [], error: null, fullMatch: false })
  const [activeTab, setActiveTab] = useState<'test' | 'replace' | 'cheatsheet'>('test')

  const testRegex = useMemo(() => testRegexLocal(pattern, flags, testString), [pattern, flags, testString])
  const replaced = useMemo(() => replaceRegexLocal(pattern, flags, testString, replacement), [pattern, flags, testString, replacement])

  useEffect(() => {
    setTimeout(() => setResult(testRegex), 0)
  }, [testRegex])

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4" />
          Pattern
        </Label>
        <div className="relative">
          <Textarea
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regular expression..."
            className="min-h-24 resize-y font-mono text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FLAG_OPTIONS.map(({ value, label }) => (
            <Label key={value} className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={flags.includes(value)}
                onCheckedChange={(checked) => setFlags(prev => checked ? prev + value : prev.replace(value, ''))}
              />
              <span className="text-sm">{label}</span>
            </Label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          Test String
        </Label>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          className="min-h-24 resize-y font-mono text-sm"
        />
      </div>

      {result.error && (
        <Alert variant="destructive" className="text-sm">
          <X className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="replace">Replace</TabsTrigger>
          <TabsTrigger value="cheatsheet">Cheatsheet</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Matches ({result.matches.length})</Label>
            <div className="flex items-center gap-2">
              <CopyButton value={result.matches.map(m => `${m.match} at ${m.index}`).join('\n')} size="sm">
                Copy
              </CopyButton>
              <button
                onClick={() => {
                  const content = `Pattern: ${pattern}\nFlags: ${flags}\nTest String: ${testString}\n\nMatches:\n${result.matches.map(m => `${m.match} at index ${m.index}`).join('\n')}`
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `regex-matches-${Date.now()}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
          <div className="relative">
            <MatchHighlighter text={testString} matches={result.matches} />
          </div>
          {result.matches.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-auto">
              {result.matches.map((match, i) => (
                <div key={i} className="p-2 bg-muted rounded-lg text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brand">Match {i + 1}</span>
                    <span className="text-muted-foreground">Index: {match.index}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-mono">{match.match}</span>
                  </div>
                  {Object.keys(match.groups).length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Groups: {' '}
                      <span className="font-mono">
                        {Object.entries(match.groups).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="replace" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Replacement</Label>
            <Textarea
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Replacement string (use $1, $2, etc. for groups)..."
              className="min-h-20 resize-y font-mono text-sm"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Result</Label>
            <div className="flex items-center gap-2">
              <CopyButton value={replaced} size="sm">
                Copy
              </CopyButton>
              {replaced && (
                <button
                  onClick={() => {
                    const blob = new Blob([replaced], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `replaced-${Date.now()}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              )}
            </div>
            <Textarea
              readOnly
              value={replaced}
              placeholder="Replaced text will appear here..."
              className="min-h-28 resize-y font-mono text-sm"
            />
          </div>
        </TabsContent>

<TabsContent value="cheatsheet" className="space-y-4 mt-4">
          <div className="space-y-2 max-h-96 overflow-auto">
            {CHEATSHEET.map((item, i) => {
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                    <code className="font-mono text-sm text-brand min-w-[120px]">{item.pattern}</code>
                    <span className="text-sm text-muted-foreground flex-1">{item.description}</span>
                    <button
                      onClick={() => setPattern(prev => prev + item.pattern)}
                      className="text-xs px-2 py-1 rounded bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                      title="Insert pattern"
                    >
                      Insert
                    </button>
                  </div>
                )
              })}
            </div>
          </TabsContent>
      </Tabs>
    </div>
  )
}