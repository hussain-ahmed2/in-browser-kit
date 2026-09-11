'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, RotateCcw, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { computeHistogram, normalizeHistogram, getImageDimensions } from '../lib/imageHistogram'
import { fileSelected, histogramSet, processingSet, clearAll } from '../histogramSlice'

const steps = [{ label: 'Upload' }, { label: 'Analyze' }]

function HistogramChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = 'rgba(0,0,0,0.05)'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = color
    ctx.globalAlpha = 0.6
    for (let i = 0; i < data.length; i++) {
      const barH = data[i] * h
      ctx.fillRect((i / data.length) * w, h - barH, w / data.length + 1, barH)
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.font = '11px sans-serif'
    ctx.fillText(label, 4, 14)
  }, [data, color, label])

  useEffect(() => {
    draw()
  }, [draw])

  return <canvas ref={canvasRef} width={256} height={100} className="w-full rounded border border-border" />
}

export function ImageHistogramPage() {
  const dispatch = useAppDispatch()
  const { item, dims, histogram, isProcessing } = useAppSelector((s) => s.imageHistogram)

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(fileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleAnalyze = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await computeHistogram(item.file)
      dispatch(histogramSet(res.histogram))
      toast.success('Histogram computed!')
    } catch {
      toast.error('Error computing histogram')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={histogram ? 1 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 /> Image Histogram</CardTitle>
          <CardDescription>View RGB and luminance channel distributions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-60 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {histogram ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-3">
                    <HistogramChart data={normalizeHistogram(histogram.r)} color="#ff0000" label="Red" />
                    <HistogramChart data={normalizeHistogram(histogram.g)} color="#00ff00" label="Green" />
                    <HistogramChart data={normalizeHistogram(histogram.b)} color="#0000ff" label="Blue" />
                    <HistogramChart data={normalizeHistogram(histogram.luminance)} color="#888888" label="Luminance" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{dims?.width}×{dims?.height}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Total Pixels</p>
                      <p className="font-medium">{histogram.totalPixels.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Analyze Another</Button>
                </div>
              ) : (
                <Button onClick={handleAnalyze} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                  {isProcessing ? <><Loader2 className="animate-spin" /> Analyzing...</> : <><BarChart3 /> Compute Histogram</>}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
