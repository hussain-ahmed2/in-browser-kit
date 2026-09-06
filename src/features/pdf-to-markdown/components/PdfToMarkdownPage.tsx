'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FileText, Download, Copy, Loader2, RotateCcw } from 'lucide-react'
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
import { FileDropzone } from '@/components/FileDropzone'
import { extractMarkdownFromPdf } from '../lib/extractMarkdown'
import {
  fileSelected,
  extractionStarted,
  extractionDone,
  extractionError,
  markdownSet,
  clearAll,
} from '../pdfToMarkdownSlice'

const steps = [{ label: 'Upload' }, { label: 'Extract' }]

export function PdfToMarkdownPage() {
  const dispatch = useAppDispatch()
  const { file, status, markdown } = useAppSelector((s) => s.pdfToMarkdown)

  const handleFile = (files: File[]) => {
    const f = files[0]
    if (f) dispatch(fileSelected(f))
  }

  const handleExtract = async () => {
    if (!file) return
    dispatch(extractionStarted())
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      }
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const md = await extractMarkdownFromPdf(doc)
      dispatch(extractionDone(md))
      toast.success('Markdown extracted!')
    } catch (err) {
      console.error(err)
      dispatch(extractionError())
      toast.error('Failed to extract markdown from PDF.')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy.')
    }
  }

  const handleDownload = () => {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file?.name.replace(/\.pdf$/i, '') + '.md' || 'converted.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> PDF to Markdown
          </CardTitle>
          <CardDescription>
            Extract text from a PDF and format it as Markdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFile}
              label="Click or drag and drop your PDF here"
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-medium truncate line-clamp-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => dispatch(clearAll())}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Change File
                </Button>
              </div>

              {status === 'idle' && (
                <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-card shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium">Ready to Extract</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    Extract text from your PDF and format it as clean Markdown.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleExtract}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Extract Markdown
                  </Button>
                </div>
              )}

              {status === 'extracting' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Extracting Markdown...</h3>
                </div>
              )}

              {status === 'done' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border">
                    <span className="font-medium pl-2">Markdown Output</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                      <Button size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-1" /> Download .md
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={markdown}
                    onChange={(e) => dispatch(markdownSet(e.target.value))}
                    className="w-full min-h-[50vh] p-6 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-brand focus:outline-none resize-y font-mono text-sm leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Extraction failed. Try another PDF.</p>
                  <Button variant="outline" className="mt-4" onClick={() => dispatch(clearAll())}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
