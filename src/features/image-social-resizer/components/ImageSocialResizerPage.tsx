'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/form/input-field'
import { SelectField } from '@/components/form/select-field'
import { resizeForSocial, getImageDimensions, formatBytes } from '../lib/imageSocialResizer'
import { SOCIAL_PRESETS, socialResizerSchema, type SocialResizerFormValues } from '../types'
import { fileSelected, resultSet, processingSet, clearAll } from '../socialResizerSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

const fitOptions = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'stretch', label: 'Stretch' },
]

export function ImageSocialResizerPage() {
  const dispatch = useAppDispatch()
  const { item, dims, result, isProcessing } = useAppSelector((s) => s.imageSocialResizer)

  const form = useForm<SocialResizerFormValues>({
    resolver: zodResolver(socialResizerSchema),
    defaultValues: { preset: 'instagram-post', fit: 'cover' },
  })

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

  const handleApply = async (values: SocialResizerFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const preset = SOCIAL_PRESETS.find((p) => p.value === values.preset)
      if (!preset) throw new Error('Invalid preset')
      const res = await resizeForSocial(item.file, preset, values.fit)
      dispatch(resultSet(res))
      toast.success('Image resized for social media!')
    } catch {
      toast.error('Error resizing image')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 /> Social Media Resizer</CardTitle>
          <CardDescription>Resize images to fit popular social media dimensions.</CardDescription>
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-medium">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Result</p>
                      <p className="font-medium">{formatBytes(result.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField name="preset" label="Platform Preset" options={SOCIAL_PRESETS.map((p) => ({ value: p.value, label: `${p.label} (${p.width}×${p.height})` }))} />
                      <SelectField name="fit" label="Fit Mode" options={fitOptions} />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Resizing...</> : <><Share2 /> Resize</>}
                    </Button>
                  </form>
                </FormProvider>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
