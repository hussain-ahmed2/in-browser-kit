'use client'

import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowRight, Download, Copy } from 'lucide-react'
import { SelectField } from '@/components/form/select-field'
import { SliderField } from '@/components/form/slider-field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/CopyButton'
import { cn } from '@/lib/utils'
import {
  QR_EC_LEVELS,
  QR_EC_LABELS,
  generateQrDataUrl,
  generateQrSvg,
  downloadDataUrl,
  validateQrInput,
  getCapacityChars,
} from '../lib/qr'

const qrSchema = z.object({
  text: z.string().min(1, 'Enter text or a URL'),
  ecLevel: z.enum(['L', 'M', 'Q', 'H']),
  size: z.number().min(128).max(1024),
})

type QrFormValues = z.infer<typeof qrSchema>

const textareaClasses =
  'w-full min-h-28 resize-y rounded-lg border border-input bg-transparent p-2.5 text-sm font-mono transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

export function QrGeneratorPage() {
  const [outputDataUrl, setOutputDataUrl] = useState('')
  const [outputSvg, setOutputSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<QrFormValues>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      text: '',
      ecLevel: 'M',
      size: 256,
    },
    mode: 'onChange',
  })

  const watched = useWatch({ control: form.control })
  const text = watched.text ?? ''
  const ecLevel = watched.ecLevel ?? 'M'
  const size = watched.size ?? 256

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!text) {
        setOutputDataUrl('')
        setOutputSvg('')
        setError(null)
        return
      }

      const validationError = validateQrInput(text, ecLevel)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)

      setIsGenerating(true)
      try {
        const [dataUrl, svg] = await Promise.all([
          generateQrDataUrl(text, { size, ecLevel }),
          generateQrSvg(text, { ecLevel }),
        ])
        setOutputDataUrl(dataUrl)
        setOutputSvg(svg)
      } catch {
        setError('Failed to generate QR code. Please try again.')
      } finally {
        setIsGenerating(false)
      }
    }, 120)

    return () => window.clearTimeout(timeout)
  }, [text, ecLevel, size])

  const handleDownloadPng = () => {
    if (!outputDataUrl) return
    downloadDataUrl(outputDataUrl, `qr-code-${Date.now()}.png`)
  }

  const handleDownloadSvg = () => {
    if (!outputSvg) return
    const blob = new Blob([outputSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-code-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const capacityChars = getCapacityChars(ecLevel)
  const showWarning = text.length > capacityChars * 0.8

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Generate QR Code</CardTitle>
        <CardDescription>
          Create a QR code from any text or URL. Runs locally — nothing leaves
          your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormProvider {...form}>
          <div className="space-y-8">
            <Controller
              name="text"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Input text</FieldLabel>
                  <textarea
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type or paste text or a URL…"
                    className={textareaClasses}
                  />
                  <FieldDescription>
                    Generating happens locally in your browser using the{' '}
                    <code>qrcode</code> library.
                  </FieldDescription>
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <SelectField
                name="ecLevel"
                label="Error Correction"
                options={QR_EC_LEVELS.map((level) => ({
                  label: `${level} — ${QR_EC_LABELS[level]}`,
                  value: level,
                }))}
              />
              <div className="sm:pb-1">
                <SliderField
                  name="size"
                  label="Size (px)"
                  min={128}
                  max={1024}
                  step={32}
                  formatValue={(val) => `${val}px`}
                />
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-border">
              {error && (
                <div className="text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}
              <div className="relative aspect-square max-w-xs mx-auto">
                {outputDataUrl && !isGenerating ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={outputDataUrl}
                    alt="Generated QR code"
                    className={cn(
                      'w-full h-full object-contain rounded-lg bg-white ring-2 ring-brand/30 transition-opacity',
                      isGenerating ? 'opacity-50' : 'opacity-100'
                    )}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center rounded-lg bg-muted/50 ring-2 ring-border/50"
                  >
                    {isGenerating ? (
                      <span className="text-muted-foreground">Generating…</span>
                    ) : (
                      <span className="text-muted-foreground/50">
                        The QR code will appear here as you type.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                  {text.length} characters
                  <ArrowRight size={12} aria-hidden="true" className="text-brand" />
                  {capacityChars} max for level {ecLevel}
                  {showWarning && (
                    <>
                      <ArrowRight size={12} aria-hidden="true" className="text-amber-500" />
                      <span className="text-amber-500">Near capacity</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={text} size="xs" aria-label="Copy input text">
                    <Copy className="size-3.5" />
                  </CopyButton>
                </div>
              </div>

              {outputDataUrl && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border animate-fade-in">
                  <Button
                    variant="outline"
                    onClick={handleDownloadSvg}
                    disabled={isGenerating}
                    aria-label="Download as SVG"
                  >
                    <Download className="size-3.5" />
                    Download SVG
                  </Button>
                  <Button
                    onClick={handleDownloadPng}
                    disabled={isGenerating}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    aria-label="Download as PNG"
                  >
                    <Download className="size-3.5" />
                    Download PNG
                  </Button>
                </div>
              )}
            </div>
          </div>
        </FormProvider>
      </CardContent>
    </Card>
  )
}