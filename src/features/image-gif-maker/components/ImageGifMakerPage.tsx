'use client'

import { useState, useCallback, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Download, Film, RotateCcw, Plus, X } from 'lucide-react'
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
import { InputField } from '@/components/form/input-field'
import { SelectField } from '@/components/form/select-field'
import { SliderField } from '@/components/form/slider-field'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { createGif, formatBytes, type GifMakerResult } from '../lib/imageGifMaker'
import { gifMakerSchema, type GifMakerFormValues } from '../types'

const steps = [
  { label: 'Upload' },
  { label: 'Configure' },
  { label: 'Download' },
]

export function ImageGifMakerPage() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<GifMakerResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentStep = result ? 2 : files.length > 0 ? 1 : 0

  const form = useForm<GifMakerFormValues>({
    resolver: zodResolver(gifMakerSchema),
    defaultValues: {
      frameDelay: 100,
      loopCount: 0,
      backgroundColor: '#ffffff',
    },
    mode: 'onChange',
  })

  const watchedDelay = useWatch({ control: form.control, name: 'frameDelay' })
  const watchedLoop = useWatch({ control: form.control, name: 'loopCount' })
  const watchedBgColor = useWatch({ control: form.control, name: 'backgroundColor' })

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = Array.from(newFiles).filter(
        (f) => f.type.startsWith('image/')
      )
      if (validFiles.length === 0) return

      const allFiles = [...files, ...validFiles]
      setFiles(allFiles)

      const newUrls = validFiles.map((f) => URL.createObjectURL(f))
      setPreviewUrls((prev) => [...prev, ...newUrls])
    },
    [files]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleClear = () => {
    setFiles([])
    setPreviewUrls([])
    setResult(null)
    form.reset({ frameDelay: 100, loopCount: 0, backgroundColor: '#ffffff' })
  }

  const handleCreate = async (values: GifMakerFormValues) => {
    if (files.length === 0) return
    setIsProcessing(true)
    try {
      const res = await createGif({
        frames: files,
        frameDelay: Number(values.frameDelay),
        loopCount: Number(values.loopCount),
        backgroundColor: values.backgroundColor ?? '#ffffff',
      })
      setResult(res)
      toast.success('GIF created successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create GIF')
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

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      const [removed] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, removed)
      return newFiles
    })
    setPreviewUrls((prev) => {
      const newUrls = [...prev]
      const [removed] = newUrls.splice(fromIndex, 1)
      newUrls.splice(toIndex, 0, removed)
      return newUrls
    })
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film />
            GIF Maker
          </CardTitle>
          <CardDescription>
            Create animated GIFs from a sequence of images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!files.length ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={true}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              {/* Frame list with reordering */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Frames ({files.length}) - Drag to reorder
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="mr-1" />
                    Add More
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {}}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                      <Image
                        src={url}
                        alt={`Frame ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Frame {index + 1}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SliderField
                      name="frameDelay"
                      label="Frame Delay (ms)"
                      min={10}
                      max={5000}
                      step={10}
                    />
                    <SelectField
                      name="loopCount"
                      label="Loop Count"
                      options={[
                        { label: 'Infinite (0)', value: '0' },
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '5', value: '5' },
                        { label: '10', value: '10' },
                      ]}
                    />
                    <InputField
                      name="backgroundColor"
                      label="Background Color"
                      type="color"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button variant="outline" type="button" onClick={handleClear} className="flex-1">
                      <RotateCcw />
                      Clear All
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" />
                          Creating GIF...
                        </>
                      ) : (
                        <>
                          <Film aria-hidden="true" />
                          Create GIF
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>

              {result && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    <Image
                      src={result.objectUrl}
                      alt="GIF preview"
                      width={result.width}
                      height={result.height}
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      <X />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Frames</p>
                      <p className="font-medium">{result.frameCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{result.totalDuration}ms</p>
                    </div>
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
                    <Button onClick={handleDownload} className="flex-1">
                      <Download aria-hidden="true" />
                      Download GIF
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="flex-1">
                      <RotateCcw />
                      Start Over
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