'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, SmilePlus } from 'lucide-react'
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
import { SliderField } from '@/components/form/slider-field'
import { SelectField } from '@/components/form/select-field'
import { createMeme, getImageDimensions, formatBytes } from '../lib/imageMeme'
import { MEME_FONTS, memeSchema, type MemeFormValues } from '../types'
import { fileSelected, resultSet, processingSet, clearAll } from '../memeSlice'

const steps = [{ label: 'Upload' }, { label: 'Configure' }, { label: 'Download' }]

export function ImageMemePage() {
  const dispatch = useAppDispatch()
  const { item, dims, result, isProcessing } = useAppSelector((s) => s.imageMeme)

  const form = useForm<MemeFormValues>({
    resolver: zodResolver(memeSchema),
    defaultValues: {
      topText: '',
      bottomText: '',
      fontSize: 48,
      fontFamily: 'Impact',
      textColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 3,
    },
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

  const handleApply = async (values: MemeFormValues) => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await createMeme(item.file, {
        topText: values.topText ?? '',
        bottomText: values.bottomText ?? '',
        fontSize: Number(values.fontSize ?? 48),
        fontFamily: values.fontFamily ?? 'Impact',
        textColor: values.textColor ?? '#ffffff',
        strokeColor: values.strokeColor ?? '#000000',
        strokeWidth: Number(values.strokeWidth ?? 3),
      })
      dispatch(resultSet(res))
      toast.success('Meme created!')
    } catch {
      toast.error('Error creating meme')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SmilePlus /> Meme Generator</CardTitle>
          <CardDescription>Add top and bottom text to create memes from any image.</CardDescription>
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
                      <InputField name="topText" label="Top Text" placeholder="Top text..." />
                      <InputField name="bottomText" label="Bottom Text" placeholder="Bottom text..." />
                      <SliderField name="fontSize" label="Font Size" min={12} max={120} />
                      <SliderField name="strokeWidth" label="Stroke Width" min={0} max={10} />
                      <SelectField name="fontFamily" label="Font" options={MEME_FONTS.map((f) => ({ value: f, label: f }))} />
                      <InputField name="textColor" label="Text Color" type="color" />
                      <InputField name="strokeColor" label="Stroke Color" type="color" />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                      {isProcessing ? <><Loader2 className="animate-spin" /> Generating...</> : <><SmilePlus /> Generate Meme</>}
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
