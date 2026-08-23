'use client'

import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SelectField } from '@/components/form/select-field'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import {
  rotateImage,
  flipImage,
  type RotateResult,
} from '../lib/imageRotate'
import { rotateSchema, type RotateFormValues } from '../types'

const steps = [
  { label: 'Upload' },
  { label: 'Configure' },
  { label: 'Download' },
]

function getPreviewTransform(degrees: number, flip: string): string {
  const parts: string[] = []
  if (degrees) parts.push(`rotate(${degrees}deg)`)
  if (flip === 'horizontal') parts.push('scaleX(-1)')
  if (flip === 'vertical') parts.push('scaleY(-1)')
  return parts.join(' ') || 'none'
}

export function ImageRotatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<RotateResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const currentStep = result ? 2 : file ? 1 : 0

  const form = useForm<RotateFormValues>({
    resolver: zodResolver(rotateSchema),
    defaultValues: { degrees: '0', flip: 'none' },
    mode: 'onChange',
  })

  const watchedDegrees = useWatch({ control: form.control, name: 'degrees' })
  const watchedFlip = useWatch({ control: form.control, name: 'flip' })

  const degrees = Number(watchedDegrees ?? 0)
  const flip = String(watchedFlip ?? 'none')

  const previewTransform = getPreviewTransform(degrees, flip)

  const handleFiles = (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    setFile(selected)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleClear = () => {
    setFile(null)
    setResult(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const handleRotate = async (values: RotateFormValues) => {
    if (!file) return
    setIsProcessing(true)
    try {
      const deg = Number(values.degrees)
      let res: RotateResult
      if (values.flip && values.flip !== 'none') {
        res = await flipImage(file, values.flip)
      } else {
        res = await rotateImage(file, { degrees: deg })
      }
      setResult(res)
      toast.success('Image processed successfully!')
    } catch (err) {
      console.error('Rotate failed:', err)
      toast.error('Error processing image.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.objectUrl
    a.download = result.file.name
    a.click()
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Rotate & Flip</CardTitle>
          <CardDescription>
            Rotate images by any angle and flip horizontally or vertically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in lg:grid lg:grid-cols-2 lg:gap-8">
              {/* Preview */}
              <div className="relative group mb-6 lg:mb-0">
                <div
                  className="relative flex items-center justify-center overflow-hidden rounded-lg border border-border w-full"
                  style={{ aspectRatio: '1' }}
                >
                  {result ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={result.objectUrl}
                      alt="Rotated result"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl ?? ''}
                      alt="Preview"
                      className="w-full h-full object-contain transition-transform duration-200 ease-out"
                      style={{ transform: previewTransform }}
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleClear}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {result ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Result: {result.width}×{result.height}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={handleDownload} className="flex-1">
                        Download
                      </Button>
                      <Button variant="outline" onClick={handleClear} className="flex-1">
                        Start Over
                      </Button>
                    </div>
                  </div>
                ) : (
                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleRotate)}
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-xl bg-secondary/30 border border-border space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <SelectField
                            name="degrees"
                            label="Rotation"
                            options={[
                              { label: '0°', value: '0' },
                              { label: '90°', value: '90' },
                              { label: '180°', value: '180' },
                              { label: '270°', value: '270' },
                            ]}
                          />
                          <SelectField
                            name="flip"
                            label="Flip"
                            options={[
                              { label: 'None', value: 'none' },
                              { label: 'Horizontal', value: 'horizontal' },
                              { label: 'Vertical', value: 'vertical' },
                            ]}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {degrees}° rotation
                          {flip !== 'none' ? ` + ${flip} flip` : ''}
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" aria-hidden="true" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <RotateCw aria-hidden="true" />
                            Apply
                          </>
                        )}
                      </Button>
                    </form>
                  </FormProvider>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
