'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Image, Download, Loader2, RotateCcw, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  svgSet,
  scaleSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} from '../svgToPngSlice'
import { convertSvgToPng } from '../lib/svgToPng'

const steps = [{ label: 'Upload' }, { label: 'Convert' }]

export function SvgToPngPage() {
  const dispatch = useAppDispatch()
  const { svgContent, scale, status, resultBlobUrl, fileName } = useAppSelector((s) => s.svgToPng)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      dispatch(svgSet({ content, fileName: file.name }))
    }
    reader.readAsText(file)
  }, [dispatch])

  const handleConvert = useCallback(async () => {
    if (!svgContent.trim()) {
      toast.error('Please provide SVG content')
      return
    }
    dispatch(conversionStarted())
    try {
      const blob = await convertSvgToPng(svgContent, scale)
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PNG created!')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert SVG to PNG.')
    }
  }, [svgContent, scale, dispatch])

  const handleDownload = () => {
    if (!resultBlobUrl) return
    const a = document.createElement('a')
    a.href = resultBlobUrl
    a.download = (fileName?.replace(/\.svg$/i, '') || 'converted') + '.png'
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image /> SVG to PNG
          </CardTitle>
          <CardDescription>
            Convert SVG files or code to high-quality PNG images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload SVG File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* SVG Input */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              SVG Code
            </Label>
            <Textarea
              value={svgContent}
              onChange={(e) => dispatch(svgSet({ content: e.target.value }))}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>'
              className="min-h-[200px] resize-y font-mono text-sm"
            />
          </div>

          {/* Scale & Convert */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scale</Label>
              <Select value={String(scale)} onValueChange={(v) => dispatch(scaleSet(Number(v)))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="3">3x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConvert}
                disabled={!svgContent.trim() || status === 'converting'}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                {status === 'converting' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
                ) : (
                  <><Image className="w-4 h-4 mr-2" /> Convert to PNG</>
                )}
              </Button>
              <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!svgContent}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          {/* Result */}
          {status === 'done' && resultBlobUrl && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">PNG Ready!</p>
              </div>
              <div className="flex justify-center border border-border rounded-xl p-4 bg-white/50">
                <img src={resultBlobUrl} alt="Converted PNG" className="max-w-full max-h-96" />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleDownload}
                  className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                  <Download className="w-4 h-4 mr-2" /> Download PNG
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
              <p className="text-destructive font-medium">Conversion failed. Check your SVG code.</p>
              <Button variant="outline" className="mt-4" onClick={() => dispatch(clearAll())}>
                <RotateCcw className="w-4 h-4 mr-1" /> Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
