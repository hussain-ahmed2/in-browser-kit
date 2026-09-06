'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Globe, Download, Loader2, RotateCcw, Eye } from 'lucide-react'
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
import { htmlSet, pageSizeSet, conversionStarted, conversionDone, conversionError, clearAll } from '../htmlToPdfSlice'
import { convertHtmlToPdf } from '../lib/htmlToPdf'

const steps = [{ label: 'Input' }, { label: 'Convert' }]

export function HtmlToPdfPage() {
  const dispatch = useAppDispatch()
  const { html, pageSize, status, pdfBlobUrl } = useAppSelector((s) => s.htmlToPdf)
  const [showPreview, setShowPreview] = useState(false)

  const handleConvert = async () => {
    if (!html.trim()) {
      toast.error('Please enter HTML to convert')
      return
    }
    dispatch(conversionStarted())
    try {
      const blob = await convertHtmlToPdf(html, pageSize)
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PDF created! Use the print dialog to save it.')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert HTML to PDF.')
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
            <Globe /> HTML to PDF
          </CardTitle>
          <CardDescription>
            Convert HTML code to PDF using the browser print API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Page Size</Label>
              <Select value={pageSize} onValueChange={(v) => dispatch(pageSizeSet(v as 'a4' | 'letter'))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                disabled={!html.trim()}
              >
                <Eye className="w-4 h-4 mr-1" /> Preview
              </Button>
              <Button
                onClick={handleConvert}
                disabled={!html.trim() || status === 'converting'}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                {status === 'converting' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
                ) : (
                  <><Globe className="w-4 h-4 mr-2" /> Convert to PDF</>
                )}
              </Button>
              <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!html}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && html.trim() && (
            <div className="border border-border rounded-xl overflow-hidden animate-fade-in">
              <div className="p-2 bg-muted/50 border-b border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>Close</Button>
              </div>
              <div
                className="bg-white p-4 min-h-[300px] max-h-[500px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              HTML Input
            </Label>
            <Textarea
              value={html}
              onChange={(e) => dispatch(htmlSet(e.target.value))}
              placeholder="<h1>Hello World</h1><p>This will be converted to PDF.</p>"
              className="min-h-[300px] resize-y font-mono text-sm"
            />
          </div>

          {/* Download */}
          {status === 'done' && (
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
