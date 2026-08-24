'use client'

import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SliderField } from '@/components/form/slider-field'
import { gifOptimizerSchema, type GifOptimizerFormValues } from '../types'

interface ControlsSectionProps {
  onSubmit: (values: GifOptimizerFormValues) => void
  isProcessing: boolean
}

export function ControlsSection({ onSubmit, isProcessing }: ControlsSectionProps) {
  const form = useForm<GifOptimizerFormValues>({
    resolver: zodResolver(gifOptimizerSchema),
    defaultValues: {
      maxColors: 256,
      removeDuplicates: true,
      lossyLevel: 10,
      optimizeFrames: true,
    },
    mode: 'onChange',
  })

  const watchedDuplicates = useWatch({ control: form.control, name: 'removeDuplicates', defaultValue: true })
  const watchedOptimizeFrames = useWatch({ control: form.control, name: 'optimizeFrames', defaultValue: true })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SliderField
              name="maxColors"
              label="Max Colors"
              min={2}
              max={256}
              step={1}
            />
            <SliderField
              name="lossyLevel"
              label="Lossy Compression"
              min={0}
              max={100}
              step={1}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="removeDuplicates"
                checked={watchedDuplicates}
                onChange={(e) => form.setValue('removeDuplicates', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="removeDuplicates" className="text-sm font-medium">
                Remove duplicate frames
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="optimizeFrames"
                checked={watchedOptimizeFrames}
                onChange={(e) => form.setValue('optimizeFrames', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="optimizeFrames" className="text-sm font-medium">
                Optimize frame disposal
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={false}
              className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60 px-4 py-2 rounded-lg font-medium"
            >
              Optimize GIF
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}