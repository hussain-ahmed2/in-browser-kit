'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Layers } from 'lucide-react'
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
import { SliderField } from '@/components/form/slider-field'
import { overlayImages, getImageDimensions, formatBytes } from '../lib/imageOverlay'
import { overlaySchema, type OverlayFormValues, BLEND_MODES, POSITION_OPTIONS } from '../types'
import { baseFileSelected, overlayFileSelected, resultSet, processingSet, clearAll } from '../overlaySlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

export function ImageOverlayPage() {
  const dispatch = useAppDispatch()
  const { baseItem, overlayItem, result, isProcessing } = useAppSelector((s) => s.imageOverlay)

  const form = useForm<OverlayFormValues>({
    resolver: zodResolver(overlaySchema),
    defaultValues: { opacity: 80, blendMode: 'source-over', position: 'center', scale: 100 },
  })

  const handleBaseFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(baseFileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image dimensions')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleOverlayFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(overlayFileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image dimensions')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleApply = async (values: OverlayFormValues) => {
    if (!baseItem || !overlayItem) return
    dispatch(processingSet(true))
    try {
      const res = await overlayImages(baseItem.file, overlayItem.file, {
        opacity: Number(values.opacity ?? 80),
        blendMode: values.blendMode ?? 'source-over',
        position: (values.position ?? 'center') as 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile',
        scale: Number(values.scale ?? 100),
      })
      dispatch(resultSet(res))
      toast.success('Overlay applied!')
    } catch {
      toast.error('Error applying overlay')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : baseItem ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers /> Image Overlay</CardTitle>
          <CardDescription>Layer one image on another with opacity and blend modes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!baseItem ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the base (background) image:</p>
              <FileDropzone onFiles={handleBaseFiles} accept="image/*" multiple={false} />
            </div>
          ) : !overlayItem ? (
            <div className="animate-fade-in space-y-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={baseItem.previewUrl} alt="Base" className="w-full rounded-lg border border-border max-h-60 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground">Select the overlay image:</p>
              <FileDropzone onFiles={handleOverlayFiles} accept="image/*" multiple={false} />
              <Button variant="outline" onClick={() => dispatch(clearAll())}><RotateCcw /> Cancel</Button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result?.objectUrl ?? baseItem.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Base</p>
                      <p className="font-medium">{formatBytes(baseItem.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Result</p>
                      <p className="font-medium">{formatBytes(result.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SliderField name="opacity" label="Opacity %" min={0} max={100} />
                      <SliderField name="scale" label="Scale %" min={10} max={200} />
                      <SelectField name="blendMode" label="Blend Mode" options={BLEND_MODES.map((m) => ({ label: m.label, value: m.value }))} />
                      <SelectField name="position" label="Position" options={POSITION_OPTIONS.map((p) => ({ label: p.label, value: p.value }))} />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Applying...</> : <><Layers /> Apply Overlay</>}
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
