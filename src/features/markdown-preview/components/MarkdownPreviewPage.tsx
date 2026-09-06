'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FileCode, RotateCcw, Copy, Check } from 'lucide-react'
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
import { parseMarkdown } from '../lib/markdownPreview'
import { markdownSet, htmlSet, clearAll } from '../markdownPreviewSlice'

const steps = [{ label: 'Write' }, { label: 'Preview' }]

export function MarkdownPreviewPage() {
  const dispatch = useAppDispatch()
  const { markdown, html } = useAppSelector((s) => s.markdownPreview)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (markdown.trim()) {
      const rendered = parseMarkdown(markdown)
      dispatch(htmlSet(rendered))
    } else {
      dispatch(htmlSet(''))
    }
  }, [markdown, dispatch])

  const handleCopy = () => {
    if (!html) return
    navigator.clipboard.writeText(html)
    setIsCopied(true)
    toast.success('HTML copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleClear = () => {
    dispatch(clearAll())
    toast.success('Cleared!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={markdown.trim() ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode /> Markdown Preview
          </CardTitle>
          <CardDescription>
            Write Markdown on the left and see a live-rendered HTML preview on the
            right.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2 flex flex-col">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Markdown Input
              </Label>
              <Textarea
                value={markdown}
                onChange={(e) => dispatch(markdownSet(e.target.value))}
                placeholder="# Hello World&#10;&#10;Write your **markdown** here..."
                className="flex-1 min-h-96 resize-y font-mono text-sm"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  HTML Preview
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!html}
                  title="Copy HTML"
                  className={`h-7 w-7 transition-all duration-300 ${isCopied ? 'text-green-500 bg-green-500/10' : ''}`}
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div
                className="flex-1 min-h-96 rounded-md border border-border bg-background p-4 overflow-auto prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html || '' }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!markdown}
            className="w-full"
          >
            <RotateCcw /> Clear
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
