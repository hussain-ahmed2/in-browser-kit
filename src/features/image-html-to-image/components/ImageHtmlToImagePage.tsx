'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, FileImage } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/form/input-field'
import { SliderField } from '@/components/form/slider-field'
import { renderHtmlToImage, formatBytes } from '../lib/imageHtmlToImage'
import { htmlToImageSchema, type HtmlToImageFormValues } from '../types'
import { resultSet, processingSet, clearAll } from '../htmlToImageSlice'

const steps = [{ label: 'Configure' }, { label: 'Download' }]

export function ImageHtmlToImagePage() {
  const dispatch = useAppDispatch()
  const { result, isProcessing } = useAppSelector((s) => s.imageHtmlToImage)
  const [htmlInput, setHtmlInput] = useState(
    '<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; text-align: center;">\n  <h1 style="color: white; font-family: sans-serif; font-size: 32px; margin: 0;">Hello World</h1>\n  <p style="color: rgba(255,255,255,0.8); font-family: sans-serif;">Rendered from HTML</p>\n</div>'
  )

  const form = useForm<HtmlToImageFormValues>({
    resolver: zodResolver(htmlToImageSchema),
    defaultValues: { width: 800, height: 600, backgroundColor: '#ffffff' },
  })

  const handleApply = async (values: HtmlToImageFormValues) => {
    if (!htmlInput.trim()) {
      toast.error('Please enter some HTML')
      return
    }
    dispatch(processingSet(true))
    try {
      const res = await renderHtmlToImage(htmlInput, {
        width: Number(values.width ?? 800),
        height: Number(values.height ?? 600),
        backgroundColor: values.backgroundColor ?? '#ffffff',
      })
      dispatch(resultSet(res))
      toast.success('Image rendered from HTML!')
    } catch {
      toast.error('Error rendering HTML to image')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileImage /> HTML to Image</CardTitle>
          <CardDescription>Convert HTML and CSS code into downloadable images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result ? (
            <div className="animate-fade-in space-y-6">
              <div className="relative group flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.objectUrl} alt="Rendered image" className="rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm">
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="font-medium">{formatBytes(result.file.size)}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
              </div>
            </div>
          ) : (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleApply)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">HTML Code</label>
                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    className="w-full min-h-[200px] p-3 rounded-lg border border-border bg-secondary/30 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter HTML code..."
                  />
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SliderField name="width" label="Width (px)" min={100} max={2000} />
                    <SliderField name="height" label="Height (px)" min={100} max={2000} />
                    <InputField name="backgroundColor" label="Background" type="color" />
                  </div>
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                  {isProcessing ? <><Loader2 className="animate-spin" /> Rendering...</> : <><FileImage /> Render to Image</>}
                </Button>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </>
  )
}
