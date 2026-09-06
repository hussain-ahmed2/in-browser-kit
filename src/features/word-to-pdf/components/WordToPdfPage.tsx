'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FileText, Download, Loader2, RotateCcw } from 'lucide-react'
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
import { fileSelected, conversionStarted, conversionDone, conversionError, clearAll } from '../wordToPdfSlice'
import { convertDocxToPdf } from '../lib/wordToPdf'

const steps = [{ label: 'Upload' }, { label: 'Convert' }]

export function WordToPdfPage() {
  const dispatch = useAppDispatch()
  const { file, status, pdfBlobUrl } = useAppSelector((s) => s.wordToPdf)

  const handleFile = (files: File[]) => {
    const f = files[0]
    if (f) dispatch(fileSelected(f))
  }

  const handleConvert = async () => {
    if (!file) return
    dispatch(conversionStarted())
    try {
      const blob = await convertDocxToPdf(file)
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PDF created successfully!')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert DOCX to PDF.')
    }
  }

  const handleDownload = () => {
    if (!pdfBlobUrl || !file) return
    const a = document.createElement('a')
    a.href = pdfBlobUrl
    a.download = file.name.replace(/\.docx?$/i, '') + '.pdf'
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> Word to PDF
          </CardTitle>
          <CardDescription>
            Convert DOCX documents to PDF locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onFiles={handleFile}
              label="Click or drag and drop your DOCX file here"
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
                  <h3 className="text-xl font-medium">Ready to Convert</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    Your DOCX file will be converted to PDF entirely in your browser.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleConvert}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Convert to PDF
                  </Button>
                </div>
              )}

              {status === 'converting' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Converting...</h3>
                </div>
              )}

              {status === 'done' && pdfBlobUrl && (
                <div className="flex flex-col items-center space-y-4 animate-fade-in">
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">Conversion Complete!</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-[60vh] border border-border rounded-xl"
                    title="PDF Preview"
                  />
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Conversion failed. Please try another file.</p>
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
