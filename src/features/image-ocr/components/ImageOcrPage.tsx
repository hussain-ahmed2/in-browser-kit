'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, RotateCcw, FileText, Copy } from 'lucide-react'
import { ToolSkeleton } from '@/components/ToolSkeleton'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectField } from '@/components/form/select-field'
import { performOcr, OCR_LANGUAGES, formatBytes } from '../lib/imageOcr'
import { ocrSchema, type OcrFormValues } from '../types'
import { fileSelected, resultSet, statusSet, processingSet, clearAll } from '../ocrSlice'

const steps = [{ label: 'Upload' }, { label: 'Recognize' }, { label: 'Result' }]

export function ImageOcrPage() {
  const dispatch = useAppDispatch()
  const { item, result, status, progress, isProcessing } = useAppSelector((s) => s.ocr)

  const form = useForm<OcrFormValues>({
    resolver: zodResolver(ocrSchema),
    defaultValues: { language: 'eng' },
  })

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    dispatch(fileSelected({ file: selected, previewUrl }))
  }, [dispatch])

  const handleRecognize = async (values: OcrFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await performOcr(item.file, values.language, (statusText, progressVal) => {
        dispatch(statusSet({ status: statusText, progress: progressVal }))
      })
      dispatch(resultSet(res))
      toast.success('Text extracted successfully!')
    } catch {
      toast.error('Error performing OCR')
      dispatch(processingSet(false))
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.text)
    toast.success('Text copied to clipboard!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText /> OCR Text Recognition</CardTitle>
          <CardDescription>Extract text from images in 10+ languages using Tesseract.js.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-64 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/80 text-xs text-muted-foreground">
                  {formatBytes(item.file.size)}
                </div>
              </div>

              {/* Skeleton loader while processing */}
              {isProcessing && (
                <ToolSkeleton
                  status={status || 'Processing...'}
                  progress={progress}
                  lines={3}
                />
              )}

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Words</p>
                      <p className="font-medium text-lg">{result.words}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Lines</p>
                      <p className="font-medium text-lg">{result.lines}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-medium text-lg">{result.confidence}%</p>
                    </div>
                  </div>

                  {/* Extracted text */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Extracted Text:</p>
                    <textarea
                      readOnly
                      value={result.text}
                      className="w-full h-48 p-3 rounded-lg bg-secondary/50 border border-border text-sm font-mono resize-y focus:outline-none"
                    />
                  </div>

                  <Button onClick={handleCopy} className="w-full"><Copy /> Copy Text</Button>
                  <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Start Over</Button>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleRecognize)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <SelectField
                      name="language"
                      label="Language"
                      options={OCR_LANGUAGES.map(l => ({ label: l.label, value: l.value }))}
                      description="First-time language download may take a moment. Cached after that."
                    />
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> {status || 'Processing...'}</> : <><FileText /> Extract Text</>}
                    </Button>
                  </form>
                </FormProvider>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
