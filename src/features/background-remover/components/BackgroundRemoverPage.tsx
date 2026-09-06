'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Scissors, Download, RotateCcw } from 'lucide-react'
import { ToolSkeleton } from '@/components/ToolSkeleton'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { removeImageBackground, formatBytes } from '../lib/backgroundRemover'
import { fileSelected, resultSet, statusSet, processingSet, clearAll } from '../backgroundRemoverSlice'

const steps = [{ label: 'Upload' }, { label: 'Remove BG' }, { label: 'Result' }]

export function BackgroundRemoverPage() {
  const dispatch = useAppDispatch()
  const { item, result, status, progress, isProcessing } = useAppSelector((s) => s.backgroundRemover)

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      const previewUrl = URL.createObjectURL(selected)
      dispatch(fileSelected({ file: selected, previewUrl }))
    },
    [dispatch]
  )

  const handleRemove = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await removeImageBackground(item.file, (s, p) => {
        dispatch(statusSet({ status: s, progress: p }))
      })
      dispatch(resultSet(res))
      toast.success('Background removed successfully!')
    } catch {
      toast.error('Error removing background')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scissors /> AI Background Remover</CardTitle>
          <CardDescription>Remove image backgrounds instantly using AI running in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground text-center">AI model downloads once (~25MB) and is cached in your browser.</p>

          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              {isProcessing && (
                <ToolSkeleton status={status || 'Removing background...'} progress={progress} lines={3} />
              )}

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center font-medium">Original</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="Original" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                      <div className="text-center text-xs text-muted-foreground">{formatBytes(result.originalSize)}</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center font-medium">Background Removed</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.objectUrl} alt="No background" className="w-full rounded-lg border border-border max-h-48 object-contain" style={{ backgroundImage: 'repeating-conic-gradient(#80808010 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }} />
                      <div className="text-center text-xs text-muted-foreground">{result.width}×{result.height} · {formatBytes(result.resultSize)}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                  <Button onClick={handleRemove} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    {isProcessing ? <><span className="animate-spin mr-2">⏳</span> {status || 'Processing...'}</> : <><Scissors /> Remove Background</>}
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
