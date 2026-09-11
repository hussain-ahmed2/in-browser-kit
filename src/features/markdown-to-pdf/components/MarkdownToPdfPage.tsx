'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FileCode, Download, Loader2, RotateCcw, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { marked } from 'marked'
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
import { markdownSet, conversionStarted, conversionDone, conversionError, clearAll } from '../markdownToPdfSlice'
import { convertMarkdownToPdf } from '../lib/markdownToPdf'

const steps = [{ label: 'Input' }, { label: 'Convert' }]

export function MarkdownToPdfPage() {
  const dispatch = useAppDispatch()
  const { markdown, status, pdfBlobUrl } = useAppSelector((s) => s.markdownToPdf)
  const [showPreview, setShowPreview] = useState(false)

  const htmlPreview = useMemo(() => {
    if (!markdown.trim()) return ''
    return marked.parse(markdown) as string
  }, [markdown])

  const handleConvert = async () => {
    if (!markdown.trim()) {
      toast.error('Please enter Markdown to convert')
      return
    }
    dispatch(conversionStarted())
    try {
      const blob = await convertMarkdownToPdf(markdown)
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PDF ready! Use the print dialog to save.')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert Markdown to PDF.')
    }
  }

  const handleDownload = () => {
    if (!pdfBlobUrl) return
    const a = document.createElement('a')
    a.href = pdfBlobUrl
    a.download = 'converted.html'
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode /> Markdown to PDF
          </CardTitle>
          <CardDescription>
            Write Markdown and convert it to a downloadable PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                disabled={!markdown.trim()}
              >
                <Eye className="w-4 h-4 mr-1" /> {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                onClick={handleConvert}
                disabled={!markdown.trim() || status === 'converting'}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                {status === 'converting' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
                ) : (
                  <><FileCode className="w-4 h-4 mr-2" /> Print / Save as PDF</>
                )}
              </Button>
              <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!markdown}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && htmlPreview && (
            <div className="border border-border rounded-xl overflow-hidden animate-fade-in">
              <div className="p-2 bg-muted/50 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">HTML Preview</span>
              </div>
              <div
                className="bg-white p-6 prose prose-sm max-w-none min-h-[200px] max-h-[400px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Markdown Input
            </Label>
            <Textarea
              value={markdown}
              onChange={(e) => dispatch(markdownSet(e.target.value))}
              placeholder="# Hello World&#10;&#10;This is **bold** and *italic* text.&#10;&#10;- List item 1&#10;- List item 2"
              className="min-h-[300px] resize-y font-mono text-sm"
            />
          </div>

          {/* Download */}
          {status === 'done' && pdfBlobUrl && (
            <div className="flex flex-col items-center space-y-4 animate-fade-in">
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">PDF Ready!</p>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                <Download className="w-4 h-4 mr-2" /> Download HTML
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
