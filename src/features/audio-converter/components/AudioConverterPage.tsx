'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ArrowLeftRight, Download, Loader2, RotateCcw } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFFmpegService } from '@/features/media-converter/hooks/useFFmpegService'
import {
  fileSelected,
  outputFormatSet,
  conversionStarted,
  conversionDone,
  conversionError,
  progressSet,
  clearAll,
} from '../audioConverterSlice'
import { AUDIO_FORMATS } from '../lib/audioConverter'

const steps = [{ label: 'Upload' }, { label: 'Convert' }]

export function AudioConverterPage() {
  const dispatch = useAppDispatch()
  const { file, outputFormat, status, progress, resultBlobUrl } = useAppSelector(
    (s) => s.audioConverter
  )
  const { isFfmpegLoaded, isConverting, progress: ffmpegProgress, load, convert } = useFFmpegService()

  const handleFile = (files: File[]) => {
    const f = files[0]
    if (f) dispatch(fileSelected(f))
  }

  const handleConvert = useCallback(async () => {
    if (!file) return
    dispatch(conversionStarted())

    try {
      if (!isFfmpegLoaded) {
        dispatch(progressSet(10))
        await load()
      }

      dispatch(progressSet(30))
      const result = await convert(file, {
        outputFormat: outputFormat as 'mp3' | 'wav',
        quality: 'medium',
      })

      if (result) {
        const url = URL.createObjectURL(result.convertedFile)
        dispatch(conversionDone(url))
        toast.success('Conversion complete!')
      } else {
        dispatch(conversionError())
        toast.error('Failed to convert audio.')
      }
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert audio.')
    }
  }, [file, outputFormat, isFfmpegLoaded, load, convert, dispatch])

  const handleDownload = () => {
    if (!resultBlobUrl || !file) return
    const a = document.createElement('a')
    a.href = resultBlobUrl
    a.download = file.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight /> Audio Format Converter
          </CardTitle>
          <CardDescription>
            Convert between MP3, WAV, OGG, AAC, and FLAC audio formats.
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
                  <div className="max-w-xs mx-auto space-y-2">
                    <Label className="text-sm font-medium">Output Format</Label>
                    <Select value={outputFormat} onValueChange={(v) => dispatch(outputFormatSet(v as typeof outputFormat))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIO_FORMATS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" /> Convert
                    </Button>
                  </div>
                </div>
              )}

              {status === 'converting' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Converting Audio...</h3>
                  <p className="text-sm text-muted-foreground">
                    {ffmpegProgress > 0 ? `${ffmpegProgress}%` : 'Loading engine...'}
                  </p>
                </div>
              )}

              {status === 'done' && resultBlobUrl && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">Conversion Complete!</p>
                  </div>
                  <audio src={resultBlobUrl} className="w-full" controls />
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Converted Audio
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Conversion failed.</p>
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
