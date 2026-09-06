'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Layers, Code, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SliderField } from '@/components/form/slider-field'
import { SelectField } from '@/components/form/select-field'
import { createSprite, formatBytes } from '../lib/imageCssSprite'
import { cssSpriteSchema, type CssSpriteFormValues } from '../types'
import { filesAdded, resultSet, processingSet, clearAll } from '../cssSpriteSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

const layoutOptions = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'auto', label: 'Auto (Grid)' },
]

export function ImageCssSpritePage() {
  const dispatch = useAppDispatch()
  const { items, result, isProcessing } = useAppSelector((s) => s.imageCssSprite)
  const [copied, setCopied] = useState(false)

  const form = useForm<CssSpriteFormValues>({
    resolver: zodResolver(cssSpriteSchema),
    defaultValues: { gap: 0, layout: 'horizontal' },
  })

  const handleFiles = useCallback(async (files: File[]) => {
    const entries = await Promise.all(
      files.map(async (file) => {
        const previewUrl = URL.createObjectURL(file)
        return { file, previewUrl }
      })
    )
    dispatch(filesAdded(entries))
  }, [dispatch])

  const handleApply = async (values: CssSpriteFormValues) => {
    if (!items.length) return
    dispatch(processingSet(true))
    try {
      const res = await createSprite(items.map((item) => item.file), {
        gap: Number(values.gap ?? 0),
        layout: values.layout ?? 'auto',
      })
      dispatch(resultSet(res))
      toast.success('Sprite generated!')
    } catch {
      toast.error('Error generating sprite')
      dispatch(processingSet(false))
    }
  }

  const handleCopyCss = async () => {
    if (!result?.cssText) return
    await navigator.clipboard.writeText(result.cssText)
    setCopied(true)
    toast.success('CSS copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : items.length > 0 ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers /> CSS Sprite Generator</CardTitle>
          <CardDescription>Combine multiple images into a CSS sprite sheet with code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!items.length ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={true} />
          ) : (
            <div className="animate-fade-in space-y-6">
              {!result && (
                <div className="flex flex-wrap gap-2">
                  {items.map((item, i) => (
                    <div key={i} className="relative w-16 h-16 rounded border border-border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.imageObjectUrl} alt="Sprite sheet" className="rounded-lg border border-border max-h-64 object-contain" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm">
                    <p className="text-xs text-muted-foreground">Sprite Size</p>
                    <p className="font-medium">{formatBytes(result.imageBlob.size)}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium flex items-center gap-1"><Code /> Generated CSS</p>
                      <Button variant="ghost" size="sm" onClick={handleCopyCss}>
                        {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                      </Button>
                    </div>
                    <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">{result.cssText}</pre>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.imageObjectUrl; a.download = 'sprite.png'; a.click() }} className="flex-1"><Download /> Download Sprite</Button>
                    <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([result.cssText], { type: 'text/css' })); a.download = 'sprite.css'; a.click() }} className="flex-1"><Download /> Download CSS</Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SliderField name="gap" label="Gap (px)" min={0} max={20} />
                      <SelectField name="layout" label="Layout" options={layoutOptions} />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Generating...</> : <><Layers /> Generate Sprite</>}
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
