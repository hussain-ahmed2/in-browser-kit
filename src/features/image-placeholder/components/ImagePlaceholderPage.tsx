'use client'

import { useState, useEffect, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InputField } from '@/components/form/input-field'
import { SelectField } from '@/components/form/select-field'
import { StepIndicator } from '@/components/StepIndicator'
import {
  generatePlaceholder,
  type PlaceholderResult,
  type GradientStop,
} from '../lib/imagePlaceholder'
import {
  placeholderSchema,
  type PlaceholderFormValues,
} from '../types'

const steps = [
  { label: 'Configure' },
  { label: 'Download' },
]

const SOLID_STYLES = ['solid', 'noise'] as const
const DEFAULT_STOPS: GradientStop[] = [
  { color: '#cccccc', position: 0 },
  { color: '#999999', position: 100 },
]

export function ImagePlaceholderPage() {
  const [result, setResult] = useState<PlaceholderResult | null>(null)

  const currentStep = result ? 1 : 0

  const form = useForm<PlaceholderFormValues>({
    resolver: zodResolver(placeholderSchema),
    defaultValues: {
      width: 400,
      height: 300,
      style: 'text',
      color: '#cccccc',
      color2: '#999999',
      text: '400×300',
      textColor: '#666666',
      fontSize: 24,
      gradientType: 'linear',
      gradientAngle: 0,
      gradientStops: DEFAULT_STOPS,
    },
    mode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control })

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const values = form.getValues()
      const w = Number(values.width) || 100
      const h = Number(values.height) || 100
      generatePlaceholder({
        width: w,
        height: h,
        style: values.style,
        color: values.color,
        color2: values.color2,
        text: values.text,
        textColor: values.textColor,
        fontSize: values.fontSize ? Number(values.fontSize) : undefined,
        gradientType: values.gradientType,
        gradientAngle: values.gradientAngle ? Number(values.gradientAngle) : 0,
        gradientStops: values.gradientStops as GradientStop[] | undefined,
      }).then(setResult)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watchedValues, form])

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result.file)
    const a = document.createElement('a')
    a.href = url
    a.download = result.file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const gradientStops = (watchedValues.gradientStops as GradientStop[]) || DEFAULT_STOPS
  const isGradient = watchedValues.style === 'gradient'

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Placeholder Generator</CardTitle>
          <CardDescription>
            Generate colored or textured placeholder images at any size.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <FormProvider {...form}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6"
            >
              <div className="p-8 rounded-xl bg-secondary/30 border border-border space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <InputField name="width" label="Width (px)" type="number" />
                  <InputField name="height" label="Height (px)" type="number" />
                  <SelectField
                    name="style"
                    label="Style"
                    options={[
                      { label: 'Solid Color', value: 'solid' },
                      { label: 'Gradient', value: 'gradient' },
                      { label: 'Checkerboard', value: 'pattern' },
                      { label: 'Text Label', value: 'text' },
                      { label: 'Noise', value: 'noise' },
                    ]}
                  />
                </div>

                {/* Solid / Noise */}
                {(SOLID_STYLES as readonly string[]).includes(watchedValues.style ?? '') && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <InputField name="color" label="Color" type="color" />
                  </div>
                )}

                {/* Pattern */}
                {watchedValues.style === 'pattern' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <InputField name="color" label="Color 1" type="color" />
                    <InputField name="color2" label="Color 2" type="color" />
                  </div>
                )}

                {/* Text */}
                {watchedValues.style === 'text' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <InputField name="color" label="Background" type="color" />
                    <InputField name="textColor" label="Text Color" type="color" />
                    <InputField name="text" label="Text" type="text" />
                    <InputField name="fontSize" label="Font Size" type="number" />
                  </div>
                )}

                {/* Gradient */}
                {isGradient && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <SelectField
                        name="gradientType"
                        label="Gradient Type"
                        options={[
                          { label: 'Linear', value: 'linear' },
                          { label: 'Radial', value: 'radial' },
                          { label: 'Conic', value: 'conic' },
                        ]}
                      />
                      {(watchedValues.gradientType === 'linear' ||
                        watchedValues.gradientType === 'conic') && (
                        <InputField name="gradientAngle" label="Angle (°)" type="number" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Color Stops</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const stops = [...gradientStops]
                            const lastPos = stops[stops.length - 1]?.position ?? 100
                            stops.push({ color: '#888888', position: Math.min(lastPos, 100) })
                            form.setValue('gradientStops', stops)
                          }}
                          disabled={gradientStops.length >= 8}
                        >
                          <Plus />
                          Add Stop
                        </Button>
                      </div>

                      {gradientStops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input
                            type="color"
                            value={stop.color}
                            className="w-10 h-10 rounded border border-border cursor-pointer"
                            onChange={(e) => {
                              const stops = [...gradientStops]
                              stops[i] = { ...stops[i], color: e.target.value }
                              form.setValue('gradientStops', stops)
                            }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={stop.position}
                            className="flex-1"
                            onChange={(e) => {
                              const stops = [...gradientStops]
                              stops[i] = { ...stops[i], position: Number(e.target.value) }
                              form.setValue('gradientStops', stops)
                            }}
                          />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {stop.position}%
                          </span>
                          {gradientStops.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const stops = gradientStops.filter((_, j) => j !== i)
                                form.setValue('gradientStops', stops)
                              }}
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                      ))}

                      {/* Preview gradient bar */}
                      <div
                        className="h-6 rounded border border-border"
                        style={{
                          background: `linear-gradient(to right, ${gradientStops
                            .map((s) => `${s.color} ${s.position}%`)
                            .join(', ')})`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt="Generated placeholder"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  <Button type="button" onClick={handleDownload} className="w-full">
                    <Download aria-hidden="true" />
                    Download Placeholder
                  </Button>
                </div>
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  )
}
