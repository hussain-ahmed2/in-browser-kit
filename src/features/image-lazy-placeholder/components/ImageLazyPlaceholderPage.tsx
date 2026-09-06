'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, ImageOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/form/input-field'
import { SliderField } from '@/components/form/slider-field'
import { SelectField } from '@/components/form/select-field'
import { createPlaceholder, getImageDimensions, formatBytes } from '../lib/imageLazyPlaceholder'
import { lazyPlaceholderSchema, type LazyPlaceholderFormValues } from '../types'
import { fileSelected, resultSet, processingSet, clearAll } from '../lazyPlaceholderSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

const formatOptions = [
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
]

export function ImageLazyPlaceholderPage() {
  const dispatch = useAppDispatch()
  const { item, dims, result, isProcessing } = useAppSelector((s) => s.imageLazyPlaceholder)
  const [copied, setCopied] = useState(false)

  const form = useForm<LazyPlaceholderFormValues>({
    resolver: zodResolver(lazyPlaceholderSchema),
    defaultValues: { targetWidth: 20, format: 'webp', quality: 40 },
  })

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(fileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image dimensions')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleApply = async (values: LazyPlaceholderFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await createPlaceholder(item.file, {
        targetWidth: Number(values.targetWidth ?? 20),
        format: (values.format ?? 'webp') as 'webp' | 'png' | 'jpeg',
        quality: Number(values.quality ?? 0.6),
      })
      dispatch(resultSet(res))
      toast.success('Placeholder created!')
    } catch {
      toast.error('Error creating placeholder')
      dispatch(processingSet(false))
    }
  }

  const handleCopy = async () => {
    if (!result?.base64) return
    await navigator.clipboard.writeText(result.base64)
    setCopied(true)
    toast.success('Base64 code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageOff /> Lazy Load Placeholder</CardTitle>
          <CardDescription>Generate tiny blurred placeholders for lazy loading images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.objectUrl} alt="Placeholder" className="rounded-lg border border-border" style={{ width: 200 }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-medium">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Placeholder</p>
                      <p className="font-medium">{formatBytes(result.file.size)}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Base64 Code</p>
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                      </Button>
                    </div>
                    <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-32">{result.base64}</pre>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SliderField name="targetWidth" label="Target Width (px)" min={4} max={100} />
                      <SelectField name="format" label="Format" options={formatOptions} />
                      <SliderField name="quality" label="Quality" min={10} max={100} />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Generating...</> : <><ImageOff /> Create Placeholder</>}
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
