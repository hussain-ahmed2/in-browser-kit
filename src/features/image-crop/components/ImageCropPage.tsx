'use client'

import { useState, useRef, useCallback } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Crop } from 'lucide-react'
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
  cropImage,
  getImageDimensions,
  constrainCropArea,
  ASPECT_RATIOS,
  type CropArea,
  type CropResult,
} from '../lib/imageCrop'
import { cropSchema, type CropFormValues } from '../types'

const steps = [
  { label: 'Upload' },
  { label: 'Crop' },
  { label: 'Download' },
]

export function ImageCropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<CropResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null
  )
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  )
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const currentStep = result ? 2 : file ? 1 : 0

  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: { aspectRatio: 'free' },
    mode: 'onChange',
  })

  const watchedRatio = useWatch({ control: form.control, name: 'aspectRatio' })

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      setFile(selected)
      setResult(null)
      setCropArea(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(selected))
      try {
        const d = await getImageDimensions(selected)
        setDims(d)
        setCropArea({ x: 0, y: 0, width: d.width, height: d.height })
      } catch {
        toast.error('Could not read image dimensions')
      }
    },
    [previewUrl]
  )

  const handleClear = useCallback(() => {
    setFile(null)
    setResult(null)
    setCropArea(null)
    setDims(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }, [previewUrl])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dims || !imgContainerRef.current) return
      const rect = imgContainerRef.current.getBoundingClientRect()
      const scaleX = dims.width / rect.width
      const scaleY = dims.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      setIsDragging(true)
      setDragStart({ x, y })
      setCropArea({ x, y, width: 0, height: 0 })
    },
    [dims]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStart || !dims || !imgContainerRef.current) return
      const rect = imgContainerRef.current.getBoundingClientRect()
      const scaleX = dims.width / rect.width
      const scaleY = dims.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const rawArea: CropArea = {
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
      }

      const ratio = ASPECT_RATIOS[watchedRatio]
      setCropArea(constrainCropArea(rawArea, dims.width, dims.height, ratio))
    },
    [isDragging, dragStart, dims, watchedRatio]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  const handleCrop = async () => {
    if (!file || !cropArea || cropArea.width < 1 || cropArea.height < 1) return
    setIsProcessing(true)
    try {
      const res = await cropImage(file, cropArea)
      setResult(res)
      toast.success('Image cropped successfully!')
    } catch {
      toast.error('Error cropping image')
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

  const cropOverlayStyle =
    cropArea && dims
      ? {
          left: `${(cropArea.x / dims.width) * 100}%`,
          top: `${(cropArea.y / dims.height) * 100}%`,
          width: `${(cropArea.width / dims.width) * 100}%`,
          height: `${(cropArea.height / dims.height) * 100}%`,
        }
      : null

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Image Crop</CardTitle>
          <CardDescription>
            Visually crop images with free or locked aspect ratios.
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
            <div className="space-y-6 animate-fade-in">
              <FormProvider {...form}>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <SelectField
                    name="aspectRatio"
                    label="Aspect Ratio"
                    options={[
                      { label: 'Free', value: 'free' },
                      { label: '1:1 (Square)', value: '1:1' },
                      { label: '4:3', value: '4:3' },
                      { label: '16:9', value: '16:9' },
                      { label: '3:2', value: '3:2' },
                      { label: '9:16 (Portrait)', value: '9:16' },
                    ]}
                  />
                </div>
              </FormProvider>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.objectUrl}
                    alt="Cropped"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  <div className="flex gap-4">
                    <Button onClick={handleDownload} className="flex-1">
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    ref={imgContainerRef}
                    className="relative inline-block w-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl ?? ''}
                      alt="Crop source"
                      className="w-full rounded-lg border border-border max-h-96 object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                    {cropOverlayStyle && (
                      <div
                        className="absolute border-2 border-white/80 bg-white/10 pointer-events-none"
                        style={cropOverlayStyle}
                      />
                    )}
                  </div>

                  {cropArea && cropArea.width > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selection: {Math.round(cropArea.width)}×
                      {Math.round(cropArea.height)} px
                    </p>
                  )}

                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <Button
                      onClick={handleCrop}
                      disabled={
                        isProcessing ||
                        !cropArea ||
                        cropArea.width < 1 ||
                        cropArea.height < 1
                      }
                      className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" />
                          Cropping...
                        </>
                      ) : (
                        <>
                          <Crop aria-hidden="true" />
                          Crop Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
