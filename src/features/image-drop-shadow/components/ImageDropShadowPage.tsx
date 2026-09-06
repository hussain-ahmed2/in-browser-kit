'use client'

import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Droplet, Share2 } from 'lucide-react'
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
import { applyDropShadow, getImageDimensions, formatBytes } from '../lib/imageDropShadow'
import { dropShadowSchema, type DropShadowFormValues } from '../types'
import { fileSelected, resultSet, processingSet, clearAll } from '../dropShadowSlice'
import { encodeToolConfig, copyShareableUrl, decodeToolConfig } from '@/lib/shareableUrl'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

export function ImageDropShadowPage() {
  const dispatch = useAppDispatch()
  const { item, dims, result, isProcessing } = useAppSelector((s) => s.imageDropShadow)

  const form = useForm<DropShadowFormValues>({
    resolver: zodResolver(dropShadowSchema),
    defaultValues: { offsetX: 4, offsetY: 4, blur: 10, color: '#000000', opacity: 50, spread: 0 },
  })

  // Load config from URL hash on mount
  useEffect(() => {
    const config = decodeToolConfig('image-drop-shadow')
    if (config) {
      form.reset(config as Partial<DropShadowFormValues>)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShare = async () => {
    const config = form.getValues()
    try {
      await copyShareableUrl('image-drop-shadow', config as unknown as Record<string, unknown>)
      toast.success('Link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

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

  const handleApply = async (values: DropShadowFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await applyDropShadow(item.file, {
        offsetX: Number(values.offsetX ?? 4),
        offsetY: Number(values.offsetY ?? 4),
        blur: Number(values.blur ?? 10),
        color: values.color ?? '#000000',
        opacity: Number(values.opacity ?? 50),
        spread: Number(values.spread ?? 0),
      })
      dispatch(resultSet(res))
      toast.success('Drop shadow applied!')
    } catch {
      toast.error('Error applying drop shadow')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplet /> Drop Shadow</CardTitle>
          <CardDescription>Add configurable drop shadows to images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result?.objectUrl ?? item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-medium">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Result</p>
                      <p className="font-medium">{formatBytes(result.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={handleShare} className="flex-1"><Share2 /> Share</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SliderField name="offsetX" label="Offset X" min={-100} max={100} />
                      <SliderField name="offsetY" label="Offset Y" min={-100} max={100} />
                      <SliderField name="blur" label="Blur" min={0} max={50} />
                      <SliderField name="opacity" label="Opacity %" min={0} max={100} />
                      <SliderField name="spread" label="Spread" min={0} max={50} />
                      <InputField name="color" label="Color" type="color" />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Applying...</> : <><Droplet /> Apply Shadow</>}
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
