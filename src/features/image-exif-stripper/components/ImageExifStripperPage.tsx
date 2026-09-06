'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { getExifSummary, stripExif, formatBytes } from '../lib/imageExifStripper'
import { fileSelected, exifSummarySet, resultSet, processingSet, clearAll } from '../exifStripperSlice'

const steps = [{ label: 'Upload' }, { label: 'EXIF Data' }, { label: 'Download' }]

export function ImageExifStripperPage() {
  const dispatch = useAppDispatch()
  const { item, exifSummary, result, isProcessing } = useAppSelector((s) => s.imageExifStripper)

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    dispatch(fileSelected({ file: selected, previewUrl }))
    try {
      const summary = await getExifSummary(selected)
      dispatch(exifSummarySet(summary))
    } catch {
      dispatch(exifSummarySet({ hasData: false }))
      toast.info('No EXIF data found')
    }
  }, [dispatch])

  const handleStrip = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await stripExif(item.file)
      dispatch(resultSet(res))
      toast.success('EXIF data stripped!')
    } catch {
      toast.error('Error stripping EXIF data')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : exifSummary ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldOff /> EXIF Stripper</CardTitle>
          <CardDescription>Remove EXIF metadata from images to protect your privacy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result?.objectUrl ?? item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-medium">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Result</p>
                      <p className="font-medium">{formatBytes(result.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Saved</p>
                      <p className="font-medium text-green-500">{formatBytes(item.file.size - result.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : exifSummary ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm font-medium mb-2">EXIF Summary</p>
                    {exifSummary.hasData ? (
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {Object.entries(exifSummary)
                          .filter(([key, val]) => val !== undefined && key !== 'hasData')
                          .map(([key, val]) => (
                            <li key={key} className="flex justify-between">
                              <span>{key}</span>
                              <span className="font-mono">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No EXIF data found.</p>
                    )}
                  </div>
                  <Button onClick={handleStrip} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    {isProcessing ? <><Loader2 className="animate-spin" /> Stripping...</> : <><ShieldOff /> Strip EXIF Data</>}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
