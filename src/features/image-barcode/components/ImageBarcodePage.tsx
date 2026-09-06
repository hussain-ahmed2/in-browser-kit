'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, Barcode } from 'lucide-react'
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
import { SelectField } from '@/components/form/select-field'
import { generateBarcode, formatBytes } from '../lib/imageBarcode'
import { BARCODE_FORMATS, barcodeSchema, type BarcodeFormValues } from '../types'
import { resultSet, processingSet, clearAll } from '../barcodeSlice'

const steps = [{ label: 'Configure' }, { label: 'Download' }]

export function ImageBarcodePage() {
  const dispatch = useAppDispatch()
  const { result, isProcessing } = useAppSelector((s) => s.imageBarcode)

  const form = useForm<BarcodeFormValues>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: { value: '1234567890', format: 'CODE128', width: 2, height: 100, displayValue: true },
  })

  const handleApply = async (values: BarcodeFormValues) => {
    dispatch(processingSet(true))
    try {
      const res = generateBarcode(values.value ?? '', values.format ?? 'CODE128', {
        width: Number(values.width),
        height: Number(values.height),
        displayValue: values.displayValue,
      })
      dispatch(resultSet(res))
      toast.success('Barcode generated!')
    } catch {
      toast.error('Error generating barcode')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Barcode /> Barcode Generator</CardTitle>
          <CardDescription>Generate barcodes in various formats from text input.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result ? (
            <div className="animate-fade-in space-y-6">
              <div className="relative group flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.dataUrl} alt="Generated barcode" className="rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm">
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="font-medium">{formatBytes(Math.round((result.dataUrl.length - 'data:image/png;base64,'.length) * 3 / 4))}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => { const a = document.createElement('a'); a.href = result.dataUrl; a.download = 'barcode.png'; a.click() }} className="flex-1"><Download /> Download</Button>
                <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
              </div>
            </div>
          ) : (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleApply)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField name="value" label="Barcode Value" placeholder="Enter text or number..." />
                  <SelectField name="format" label="Format" options={BARCODE_FORMATS.map((f) => ({ label: f.label, value: f.value }))} />
                  <SliderField name="width" label="Bar Width" min={1} max={5} />
                  <SliderField name="height" label="Height" min={30} max={300} />
                  <SelectField name="displayValue" label="Show Text" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                  {isProcessing ? <><Loader2 className="animate-spin" /> Generating...</> : <><Barcode /> Generate Barcode</>}
                </Button>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </>
  )
}
