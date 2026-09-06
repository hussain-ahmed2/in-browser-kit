'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, LayoutGrid, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
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
import { InputField } from '@/components/form/input-field'
import { createCollage, getImageDimensions, formatBytes } from '../lib/imageCollage'
import { collageSchema, type CollageFormValues, type CollageLayout, LAYOUT_OPTIONS, MIN_IMAGES } from '../types'
import { filesAdded, fileRemoved, resultSet, processingSet, clearAll } from '../collageSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

export function ImageCollagePage() {
  const dispatch = useAppDispatch()
  const { items, result, isProcessing } = useAppSelector((s) => s.imageCollage)

  const form = useForm<CollageFormValues>({
    resolver: zodResolver(collageSchema),
    defaultValues: { layout: 'grid-2x2', gap: 8, padding: 16, backgroundColor: '#ffffff' },
  })

  const watchedLayout = form.watch('layout')
  const minImages = MIN_IMAGES[watchedLayout as keyof typeof MIN_IMAGES] ?? 2

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const newItems = await Promise.all(
      validFiles.map(async (f) => {
        const previewUrl = URL.createObjectURL(f)
        const dims = await getImageDimensions(f)
        return { file: f, previewUrl, dims }
      })
    )
    dispatch(filesAdded(newItems))
  }, [dispatch])

  const handleCreate = async (values: CollageFormValues) => {
    if (items.length < minImages) {
      toast.error(`Need at least ${minImages} images for this layout`)
      return
    }
    dispatch(processingSet(true))
    try {
      const layout = (values.layout ?? 'grid-2x2') as CollageLayout
      const res = await createCollage(
        items.map((i) => i.file),
        layout,
        { gap: Number(values.gap ?? 8), padding: Number(values.padding ?? 16), backgroundColor: values.backgroundColor ?? '#ffffff' }
      )
      dispatch(resultSet(res))
      toast.success('Collage created!')
    } catch {
      toast.error('Error creating collage')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : items.length > 0 ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutGrid /> Collage Maker</CardTitle>
          <CardDescription>Combine multiple photos into a beautiful collage layout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.length === 0 ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={true} label="Click or drag images to create a collage" />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{items.length} image{items.length !== 1 ? 's' : ''} selected</p>
                <Button variant="outline" size="sm" onClick={() => dispatch(clearAll())}><RotateCcw /> Clear All</Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="relative group">
                    <Image src={item.previewUrl} alt={`Image ${i + 1}`} width={100} height={100} className="w-full h-20 object-cover rounded border border-border" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dispatch(fileRemoved(i))}><X className="size-3" /></Button>
                  </div>
                ))}
              </div>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.objectUrl} alt="Collage" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{result.width}×{result.height}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">File Size</p>
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
                  <form onSubmit={form.handleSubmit(handleCreate)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField name="layout" label="Layout" options={LAYOUT_OPTIONS.map((l) => ({ label: l.label, value: l.value }))} />
                      <InputField name="backgroundColor" label="Background Color" type="color" />
                      <SliderField name="gap" label="Gap" min={0} max={50} />
                      <SliderField name="padding" label="Padding" min={0} max={50} />
                    </div>
                    <Button type="submit" disabled={isProcessing || items.length < minImages} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Creating...</> : <><LayoutGrid /> Create Collage</>}
                    </Button>
                    {items.length < minImages && <p className="text-xs text-muted-foreground text-center">Need at least {minImages} images for this layout</p>}
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
