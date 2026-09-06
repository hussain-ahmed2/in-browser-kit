'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Maximize } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { upscaleImage, getImageDimensions, formatBytes } from '../lib/imageAiUpscaler'
import { fileSelected, resultSet, statusSet, processingSet, clearAll } from '../aiUpscalerSlice'

const steps = [{ label: 'Upload' }, { label: 'Upscale' }, { label: 'Result' }]

export function ImageAiUpscalerPage() {
  const dispatch = useAppDispatch()
  const { item, dims, result, status, progress, isProcessing } = useAppSelector((s) => s.aiUpscaler)
  const [scale, setScale] = useState<'2x' | '4x'>('2x')

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(fileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image dimensions')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const handleUpscale = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await upscaleImage(item.file, scale, (statusText, progressVal) => {
        dispatch(statusSet({ status: statusText, progress: progressVal }))
      })
      dispatch(resultSet(res))
      toast.success('Image upscaled successfully!')
    } catch {
      toast.error('Error upscaling image')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Maximize /> AI Image Upscaler</CardTitle>
          <CardDescription>Upscale images using neural network inference in the browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center">AI model (~20MB) downloads once and is cached in your browser.</p>

          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              {/* Status + Progress bar */}
              {isProcessing && (
                <div className="space-y-2 animate-fade-in">
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-brand to-glow transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{status || 'Processing...'} {Math.round(progress)}%</p>
                </div>
              )}

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Before/After comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center font-medium">Original</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="Original" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                      <div className="text-center text-xs text-muted-foreground">
                        {dims?.width}×{dims?.height} · {formatBytes(item.file.size)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center font-medium">Upscaled ({scale})</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.objectUrl} alt="Upscaled" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                      <div className="text-center text-xs text-muted-foreground">
                        {result.width}×{result.height} · {formatBytes(result.file.size)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                  {/* Scale selector */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Scale Factor</p>
                    <div className="flex gap-2">
                      {(['2x', '4x'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setScale(s)}
                          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all border ${scale === s ? 'bg-brand/10 text-brand border-brand/30 ring-1 ring-brand/20' : 'bg-secondary/50 text-muted-foreground border-border hover:border-brand/20'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {dims && (
                    <p className="text-xs text-muted-foreground text-center">
                      Original: {dims.width}×{dims.height} → Output: {dims.width * 2}×{dims.height * 2}
                    </p>
                  )}
                  <Button onClick={handleUpscale} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    {isProcessing ? <><Loader2 className="animate-spin" /> {status || 'Upscaling...'}</> : <><Maximize /> Upscale {scale}</>}
                  </Button>
                  <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Start Over</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
