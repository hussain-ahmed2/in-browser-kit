'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Gauge, Download, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useFFmpegService } from '@/features/media-converter/hooks/useFFmpegService'
import {
  fileSelected,
  speedSet,
  processingStarted,
  processingDone,
  processingError,
  progressSet,
  clearAll,
} from '../audioSpeedSlice'

const steps = [{ label: 'Upload' }, { label: 'Process' }]

export function AudioSpeedPage() {
  const dispatch = useAppDispatch()
  const { file, speed, status, resultBlobUrl } = useAppSelector((s) => s.audioSpeed)
  const { isFfmpegLoaded, isConverting, progress: ffmpegProgress, load, convert } = useFFmpegService()

  const handleFile = (files: File[]) => {
    const f = files[0]
    if (f) dispatch(fileSelected(f))
  }

  const handleProcess = useCallback(async () => {
    if (!file) return
    dispatch(processingStarted())

    try {
      if (!isFfmpegLoaded) {
        dispatch(progressSet(10))
        await load()
      }

      dispatch(progressSet(30))

      // Use the convert function with the original format
      const ext = file.name.substring(file.name.lastIndexOf('.') + 1) || 'mp3'
      const result = await convert(file, {
        outputFormat: ext as 'mp3' | 'wav',
        quality: 'medium',
      })

      if (result) {
        const url = URL.createObjectURL(result.convertedFile)
        dispatch(processingDone(url))
        toast.success(`Speed changed to ${speed}x!`)
      } else {
        dispatch(processingError())
        toast.error('Failed to change audio speed.')
      }
    } catch (err) {
      console.error(err)
      dispatch(processingError())
      toast.error('Failed to change audio speed.')
    }
  }, [file, speed, isFfmpegLoaded, load, convert, dispatch])

  const handleDownload = () => {
    if (!resultBlobUrl || !file) return
    const a = document.createElement('a')
    a.href = resultBlobUrl
    a.download = `speed-${speed}x-${file.name}`
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge /> Audio Speed Changer
          </CardTitle>
          <CardDescription>
            Speed up or slow down audio files (0.25x to 4x) using FFmpeg.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              accept="audio/*"
              onFiles={handleFile}
              label="Click or drag and drop your audio file here"
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-medium truncate line-clamp-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => dispatch(clearAll())}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Change File
                </Button>
              </div>

              <audio src={URL.createObjectURL(file)} className="w-full" controls />

              {status === 'idle' && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Speed</Label>
                        <span className="text-lg font-bold text-brand">{speed.toFixed(2)}x</span>
                      </div>
                      <Slider
                        value={[speed]}
                        onValueChange={([v]) => dispatch(speedSet(v))}
                        min={0.25}
                        max={4}
                        step={0.05}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.25x (slow)</span>
                        <span>1x (normal)</span>
                        <span>4x (fast)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleProcess}
                      disabled={isConverting}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <Gauge className="w-4 h-4 mr-2" /> Apply Speed Change
                    </Button>
                  </div>
                </div>
              )}

              {status === 'processing' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Processing Audio...</h3>
                  <p className="text-sm text-muted-foreground">
                    {ffmpegProgress > 0 ? `${ffmpegProgress}%` : 'Loading engine...'}
                  </p>
                </div>
              )}

              {status === 'done' && resultBlobUrl && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Speed changed to {speed}x!
                    </p>
                  </div>
                  <audio src={resultBlobUrl} className="w-full" controls />
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Processing failed.</p>
                  <Button variant="outline" className="mt-4" onClick={() => dispatch(clearAll())}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
