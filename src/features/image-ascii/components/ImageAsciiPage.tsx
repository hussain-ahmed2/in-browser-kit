'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Terminal, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SliderField } from '@/components/form/slider-field'
import { SelectField } from '@/components/form/select-field'
import { CheckboxField } from '@/components/form/checkbox-field'
import { imageToAscii, formatBytes } from '../lib/imageAscii'
import { ASCII_CHARSETS, asciiSchema, type AsciiFormValues } from '../types'
import { fileSelected, resultSet, progressSet, processingSet, clearAll } from '../asciiSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Result' }]

export function ImageAsciiPage() {
  const dispatch = useAppDispatch()
  const { item, result, progress, isProcessing } = useAppSelector((s) => s.ascii)

  const form = useForm<AsciiFormValues>({
    resolver: zodResolver(asciiSchema),
    defaultValues: { width: 100, charset: ' .:-=+*#%@', colored: false },
  })

  const watchedCharset = useWatch({ control: form.control, name: 'charset' })
  const watchedWidth = useWatch({ control: form.control, name: 'width' })
  const watchedColored = useWatch({ control: form.control, name: 'colored' })

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    dispatch(fileSelected({ file: selected, previewUrl }))
    // Auto-generate ASCII with defaults
    dispatch(processingSet(true))
    try {
      const res = await imageToAscii(selected, { width: 100, charset: ' .:-=+*#%@', colored: false }, (p) => dispatch(progressSet(p)))
      dispatch(resultSet(res))
      toast.success('ASCII art generated!')
    } catch {
      toast.error('Error converting image')
      dispatch(processingSet(false))
    }
  }, [dispatch])

  const handleConvert = useCallback(async (values: AsciiFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await imageToAscii(item.file, {
        width: Number(values.width),
        charset: values.charset ?? ' .:-=+*#%@',
        colored: values.colored ?? false,
      }, (p) => dispatch(progressSet(p)))
      dispatch(resultSet(res))
      toast.success('ASCII art generated!')
    } catch {
      toast.error('Error converting image')
      dispatch(processingSet(false))
    }
  }, [item, dispatch])

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.text)
    toast.success('ASCII text copied to clipboard!')
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-art.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded ASCII art!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Terminal /> Image to ASCII</CardTitle>
          <CardDescription>Convert any image into text-based ASCII art.</CardDescription>
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
              </div>

              {/* Progress bar */}
              {isProcessing && (
                <div className="space-y-2 animate-fade-in">
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-brand to-glow transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Converting... {Math.round(progress)}%</p>
                </div>
              )}

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* ASCII preview */}
                  <div className="rounded-lg border border-border bg-secondary/30 p-4 overflow-auto max-h-[500px]">
                    {result.html ? (
                      <div dangerouslySetInnerHTML={{ __html: result.html }} className="overflow-auto" />
                    ) : (
                      <pre className="text-xs leading-none overflow-auto whitespace-pre">{result.text}</pre>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-medium">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">ASCII Lines</p>
                      <p className="font-medium">{result.lines} lines × {result.width} chars</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleCopy} className="flex-1"><Copy /> Copy Text</Button>
                    <Button onClick={handleDownload} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"><Download /> Download .txt</Button>
                  </div>
                  <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Start Over</Button>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleConvert)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SliderField name="width" label="Width (chars)" min={20} max={300} formatValue={(v) => `${v}`} />
                      <SelectField name="charset" label="Charset" options={ASCII_CHARSETS.map(c => ({ label: c.label, value: c.value }))} />
                      <CheckboxField name="colored" label="Colored output" description="Preserve original colors" />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Converting...</> : <><Terminal /> Generate ASCII</>}
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
