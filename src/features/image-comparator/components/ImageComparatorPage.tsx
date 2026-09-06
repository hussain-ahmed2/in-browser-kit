'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, RotateCcw, GitCompare } from 'lucide-react'
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
import { compareImages, getImageDimensions } from '../lib/imageComparator'
import { compareSchema, type CompareFormValues } from '../types'
import { imageASelected, imageBSelected, resultSet, processingSet, clearAll } from '../comparatorSlice'

const steps = [{ label: 'Upload' }, { label: 'Compare' }, { label: 'Result' }]

export function ImageComparatorPage() {
  const dispatch = useAppDispatch()
  const { imageA, imageB, result, isProcessing } = useAppSelector((s) => s.imageComparator)

  const form = useForm<CompareFormValues>({
    resolver: zodResolver(compareSchema),
    defaultValues: { mode: 'side-by-side', overlayOpacity: 50, diffThreshold: 0 },
  })

  const handleFilesA = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(imageASelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleFilesB = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(imageBSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleCompare = async (values: CompareFormValues) => {
    if (!imageA || !imageB) return
    dispatch(processingSet(true))
    try {
      const res = await compareImages(imageA.file, imageB.file, values.mode as 'side-by-side' | 'overlay' | 'diff', {
        overlayOpacity: Number(values.overlayOpacity),
        diffThreshold: Number(values.diffThreshold),
      })
      dispatch(resultSet(res))
      toast.success('Comparison complete!')
    } catch {
      toast.error('Error comparing images')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : imageA ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitCompare /> Image Diff</CardTitle>
          <CardDescription>Compare two images side-by-side, overlay, or pixel diff.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!imageA ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the first image:</p>
              <FileDropzone onFiles={handleFilesA} accept="image/*" multiple={false} />
            </div>
          ) : !imageB ? (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageA.previewUrl} alt="Image A" className="w-full rounded-lg border border-border max-h-48 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground">Select the second image:</p>
              <FileDropzone onFiles={handleFilesB} accept="image/*" multiple={false} />
              <Button variant="outline" onClick={() => dispatch(clearAll())}><RotateCcw /> Cancel</Button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.diffDataUrl} alt="Comparison" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                  {result.diffPercentage > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">Different Pixels</p>
                        <p className="font-medium">{result.pixelCount.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">Difference</p>
                        <p className="font-medium">{result.diffPercentage}%</p>
                      </div>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Compare Again</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageA.previewUrl} alt="Image A" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageB.previewUrl} alt="Image B" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                </div>
              )}

              {!result && (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleCompare)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SelectField name="mode" label="Mode" options={[
                        { label: 'Side by Side', value: 'side-by-side' },
                        { label: 'Overlay', value: 'overlay' },
                        { label: 'Pixel Diff', value: 'diff' },
                      ]} />
                      <SliderField name="overlayOpacity" label="Overlay Opacity %" min={0} max={100} />
                      <SliderField name="diffThreshold" label="Diff Threshold" min={0} max={255} />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Comparing...</> : <><GitCompare /> Compare Images</>}
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
