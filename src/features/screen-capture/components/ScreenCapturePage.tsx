'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Monitor, Camera, Download, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { captureScreen, captureFrame, stopStream, formatBytes } from '../lib/screenCapture'
import { captureStarted, screenshotAdded, captureStopped, clearAll } from '../screenCaptureSlice'

const steps = [{ label: 'Start' }, { label: 'Capture' }, { label: 'Gallery' }]

export function ScreenCapturePage() {
  const dispatch = useAppDispatch()
  const { stream, screenshots, isCapturing } = useAppSelector((s) => s.screenCapture)

  const handleStart = useCallback(async () => {
    try {
      const { stream: s } = await captureScreen()
      dispatch(captureStarted(s))
      toast.success('Screen sharing started!')
    } catch {
      toast.error('Screen sharing was cancelled or not supported')
    }
  }, [dispatch])

  const handleCapture = useCallback(async () => {
    if (!stream) return
    try {
      const result = await captureFrame(stream)
      dispatch(screenshotAdded(result))
      toast.success('Screenshot captured!')
    } catch {
      toast.error('Failed to capture frame')
    }
  }, [stream, dispatch])

  const handleStop = useCallback(() => {
    if (stream) stopStream(stream)
    dispatch(captureStopped())
    toast.success('Capture session ended')
  }, [stream, dispatch])

  const downloadScreenshot = (dataUrl: string, index: number) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `screenshot-${index + 1}.png`
    a.click()
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={isCapturing ? 1 : screenshots.length > 0 ? 2 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Monitor /> Screen Capture Tool</CardTitle>
          <CardDescription>Capture screenshots of your screen directly in the browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isCapturing && screenshots.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-border bg-secondary/20">
                <div className="text-center space-y-2">
                  <Monitor className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Click below to share your screen</p>
                </div>
              </div>
              <Button onClick={handleStart} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                <Monitor /> Start Screen Capture
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative rounded-xl border border-border overflow-hidden bg-black">
                {/* Live preview using a hidden video element managed by browser */}
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mx-auto" />
                    <p className="text-sm text-white/80">Screen sharing is active</p>
                    <p className="text-xs text-white/50">Click capture to take a screenshot</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCapture} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                  <Camera /> Capture
                </Button>
                <Button variant="destructive" onClick={handleStop} className="flex-1">
                  <RotateCcw /> Stop
                </Button>
              </div>
            </div>
          )}

          {screenshots.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshots.map((shot, i) => (
                  <div key={shot.timestamp} className="relative group rounded-lg border border-border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shot.dataUrl} alt={`Screenshot ${i + 1}`} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => downloadScreenshot(shot.dataUrl, i)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      {shot.width}×{shot.height}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                {!isCapturing && (
                  <Button onClick={handleStart} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    <Monitor /> New Capture
                  </Button>
                )}
                {isCapturing && (
                  <Button onClick={handleCapture} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    <Camera /> Capture
                  </Button>
                )}
                <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><Trash2 /> Clear All</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
