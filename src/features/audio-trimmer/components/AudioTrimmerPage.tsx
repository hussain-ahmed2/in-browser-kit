'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Scissors, Download, Loader2, RotateCcw, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useRef, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
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
  startTimeSet,
  durationSet,
  outputFormatSet,
  trimmingStarted,
  trimmingDone,
  trimmingError,
  progressSet,
  clearAll,
} from '../audioTrimmerSlice'
import { getTrimArgs, getAudioMimeType } from '../lib/audioTrimmer'

const steps = [{ label: 'Upload' }, { label: 'Trim' }]

export function AudioTrimmerPage() {
  const dispatch = useAppDispatch()
  const { file, startTime, duration, outputFormat, status, progress, resultBlobUrl } = useAppSelector(
    (s) => s.audioTrimmer
  )
  const { isFfmpegLoaded, isConverting, progress: ffmpegProgress, load, convert } = useFFmpegService()
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFile = (files: File[]) => {
    const f = files[0]
    if (f) {
      dispatch(fileSelected(f))
      // Get audio duration
      const audio = new Audio(URL.createObjectURL(f))
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration)
      }
    }
  }

  const handleTrim = useCallback(async () => {
    if (!file) return
    dispatch(trimmingStarted())

    try {
      if (!isFfmpegLoaded) {
        dispatch(progressSet(10))
        await load()
      }

      dispatch(progressSet(30))
      const result = await convert(file, {
        outputFormat: outputFormat as 'mp3' | 'wav',
        quality: 'medium',
        trimStart: startTime,
        trimEnd: undefined,
      })

      if (result) {
        const url = URL.createObjectURL(result.convertedFile)
        dispatch(trimmingDone(url))
        toast.success('Audio trimmed!')
      } else {
        dispatch(trimmingError())
        toast.error('Failed to trim audio.')
      }
    } catch (err) {
      console.error(err)
      dispatch(trimmingError())
      toast.error('Failed to trim audio.')
    }
  }, [file, startTime, outputFormat, isFfmpegLoaded, load, convert, dispatch])

  const handleDownload = () => {
    if (!resultBlobUrl || !file) return
    const a = document.createElement('a')
    a.href = resultBlobUrl
    a.download = `trimmed-${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors /> Audio Trimmer
          </CardTitle>
          <CardDescription>
            Trim audio files by setting start time and duration using FFmpeg.
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

              <audio ref={audioRef} src={URL.createObjectURL(file)} className="w-full" controls />

              {status === 'idle' && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Time (HH:MM:SS)</Label>
                      <Input
                        type="text"
                        value={startTime}
                        onChange={(e) => dispatch(startTimeSet(e.target.value))}
                        placeholder="00:00:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Duration (HH:MM:SS)</Label>
                      <Input
                        type="text"
                        value={duration}
                        onChange={(e) => dispatch(durationSet(e.target.value))}
                        placeholder="00:00:10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(v) => dispatch(outputFormatSet(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp3">MP3</SelectItem>
                          <SelectItem value="wav">WAV</SelectItem>
                          <SelectItem value="ogg">OGG</SelectItem>
                          <SelectItem value="aac">AAC</SelectItem>
                          <SelectItem value="flac">FLAC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleTrim}
                      disabled={isConverting}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <Scissors className="w-4 h-4 mr-2" /> Trim Audio
                    </Button>
                  </div>
                </div>
              )}

              {status === 'trimming' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Trimming Audio...</h3>
                  <p className="text-sm text-muted-foreground">
                    {ffmpegProgress > 0 ? `${ffmpegProgress}%` : 'Loading FFmpeg engine...'}
                  </p>
                </div>
              )}

              {status === 'done' && resultBlobUrl && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">Trim Complete!</p>
                  </div>
                  <audio src={resultBlobUrl} className="w-full" controls />
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Trimmed Audio
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Trimming failed. Try different parameters.</p>
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
