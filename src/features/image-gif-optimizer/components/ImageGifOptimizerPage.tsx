'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Sparkles, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SliderField } from '@/components/form/slider-field'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { optimizeGif, formatBytes, type OptimizeResult, getImageDimensions } from '../lib/imageGifOptimizer'
import { gifOptimizerSchema, type GifOptimizerFormValues } from '../types'
import { UploadSection } from './UploadSection'
import { ControlsSection } from './ControlsSection'
import { PreviewSection } from './PreviewSection'
import { ResultSection } from './ResultSection'
import {
  fileSelected,
  formatSet,
  qualitySet,
  resultSet,
  processingSet,
  clearAll,
} from '../gifOptimizerSlice'

const steps = [
  { label: 'Upload' },
  { label: 'Optimize' },
  { label: 'Download' },
]

export function ImageGifOptimizerPage() {
  const dispatch = useAppDispatch()
  const { item, dimensions, format, quality, result, isProcessing } = useAppSelector(
    (state) => state.imageGifOptimizer
  )

  const currentStep = result ? 2 : item ? 1 : 0

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      const previewUrl = URL.createObjectURL(selected)
      try {
        const d = await getImageDimensions(selected)
        dispatch(fileSelected({ file: selected, previewUrl, dimensions: d }))
      } catch {
        toast.error('Could not read image dimensions')
        URL.revokeObjectURL(previewUrl)
      }
    },
    [dispatch]
  )

  const handleClear = useCallback(() => {
    dispatch(clearAll())
  }, [dispatch])

  const handleOptimize = async (values: GifOptimizerFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await optimizeGif(item.file, {
        maxColors: Number(values.maxColors),
        removeDuplicates: values.removeDuplicates ?? true,
        lossyLevel: Number(values.lossyLevel ?? 10),
        optimizeFrames: values.optimizeFrames ?? true,
      })
      dispatch(resultSet(res))
      toast.success('Optimized! Saved ${res.savings}%')
    } catch {
      toast.error('Error optimizing GIF')
      dispatch(processingSet(false))
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.objectUrl
    a.download = result.file.name
    a.click()
  }

  const handleFormSubmit = (values: GifOptimizerFormValues) => {
    handleOptimize(values)
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles />
            GIF Optimizer
          </CardTitle>
          <CardDescription>
            Reduce GIF file size by optimizing colors and frames.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <UploadSection onFiles={handleFiles} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <PreviewSection
                previewUrl={item.previewUrl}
                dimensions={dimensions}
                onClear={handleClear}
              />

              {result ? (
                <ResultSection
                  result={result}
                  onDownload={() => {
                    const a = document.createElement('a')
                    a.href = result.objectUrl
                    a.download = result.file.name
                    a.click()
                  }}
                  onClear={handleClear}
                />
              ) : (
                <>
                  <ControlsSection
                    onSubmit={handleOptimize}
                    isProcessing={isProcessing}
                  />
                  <PreviewSection
                    previewUrl={item.previewUrl}
                    dimensions={dimensions}
                    onClear={handleClear}
                  />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}