'use client'

import { useState, useCallback } from 'react'
import { Loader2, Download, Film, RotateCcw, Copy, Check, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import NextImage from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { extractGifFrames, formatBytes, type GifFrame, type GifExtractorResult } from '../lib/imageGifExtractor'

const steps = [
  { label: 'Upload' },
  { label: 'Extract' },
  { label: 'Download' },
]

interface GifFrameData extends GifFrame {
  dataUrl: string
}

export function ImageGifExtractorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GifExtractorResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const currentStep = result ? 2 : file ? 1 : 0

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      setFile(selected)
      setResult(null)
      setPreviewUrl(URL.createObjectURL(selected))

      const img = new window.Image()
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(img.src)
      }
      img.src = previewUrl!
    },
    [previewUrl]
  )

  const handleClear = useCallback(() => {
    setFile(null)
    setResult(null)
    setDimensions(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }, [previewUrl])

  const handleExtract = async () => {
    if (!file) return
    setIsProcessing(true)
    try {
      const res = await extractGifFrames(file)
      setResult({ ...res, fileSize: file.size })
      toast.success(`Extracted ${res.frames.length} frames!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to extract frames')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadFrame = (frame: GifFrameData) => {
    if (!frame.dataUrl) return
    const a = document.createElement('a')
    a.href = frame.dataUrl
    a.download = `frame-${frame.index}.png`
    a.click()
  }

  const handleDownloadAll = async () => {
    if (!result) return
    for (const frame of result.frames) {
      if (frame.dataUrl) {
        const a = document.createElement('a')
        a.href = frame.dataUrl
        a.download = `frame-${frame.index}.png`
        a.click()
      }
    }
  }

  const handleCopyFrame = async (index: number, dataUrl: string) => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast.success('Frame copied to clipboard!')
    } catch {
      toast.error('Failed to copy frame')
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film />
            GIF Frame Extractor
          </CardTitle>
          <CardDescription>
            Extract individual frames from animated GIFs as PNG images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/gif"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              {result ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative group">
                    <NextImage
                      src={previewUrl!}
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
                      <RotateCcw />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{result.width}×{result.height}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Frames</p>
                      <p className="font-medium">{result.frames.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Loop Count</p>
                      <p className="font-medium">{result.loopCount === 0 ? 'Infinite' : result.loopCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Total Duration</p>
                      <p className="font-medium">{result.totalDuration}ms</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button onClick={handleDownloadAll} className="flex-1" disabled={isProcessing}>
                      <Download aria-hidden="true" />
                      Download All Frames (PNG)
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="flex-1">
                      <RotateCcw />
                      Start Over
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                    {result.frames.map((frame) => (
                      <div
                        key={frame.index}
                        className="group p-3 rounded-lg bg-secondary/50 border border-border text-center"
                      >
                        <div className="relative aspect-square mb-2">
                          <NextImage
                            src={frame.dataUrl!}
                            alt={`Frame ${frame.index}`}
                            width={frame.dims.width}
                            height={frame.dims.height}
                            className="w-full h-full object-contain rounded border border-border"
                          />
                          {copiedIndex === frame.index && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded">
                              <CheckCheck className="size-6 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="font-medium">Frame {frame.index}</p>
                          <p className="text-muted-foreground">{frame.delay}ms</p>
                          <p className="text-muted-foreground">{frame.dims.width}×{frame.dims.height}</p>
                          <div className="flex gap-1 justify-center pt-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(frame.dataUrl!)
                                toast.success('Frame data URL copied!')
                              }}
                              disabled={copiedIndex === frame.index}
                            >
                              <Copy className="size-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const a = document.createElement('a')
                                a.href = frame.dataUrl!
                                a.download = `frame-${frame.index}.png`
                                a.click()
                              }}
                            >
                              <Download className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative group">
                    <NextImage
                      src={previewUrl!}
                      alt="GIF preview"
                      width={dimensions?.width || 400}
                      height={dimensions?.height || 300}
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      <RotateCcw />
                      Remove
                    </Button>
                  </div>

                  {dimensions && (
                    <p className="text-sm text-muted-foreground text-center">
                      {dimensions.width}×{dimensions.height}
                    </p>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={handleExtract}
                      disabled={isProcessing}
                      className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Film aria-hidden="true" />
                          Extract Frames
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      <RotateCcw />
                      Cancel
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