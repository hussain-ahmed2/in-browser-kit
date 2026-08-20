'use client'

import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { SliderField } from '@/components/form/slider-field'
import { StepIndicator } from '@/components/StepIndicator'
import { ImagePreview } from './ImagePreview'
import { ImageUploader } from './ImageUploader'
import { ResizeResult } from './ResizeResult'
import {
    computeResizedDimensions,
    getImageDimensions,
    resizeImage,
    type ImageDimensions,
    type ResizeResult as ResizeResultType,
} from '../lib/imageResize'

const resizeSchema = z.object({
    maxDimension: z.coerce
        .number()
        .int()
        .min(32, 'Must be at least 32px')
        .max(8192, 'Must be at most 8192px'),
    outputType: z.enum(['keep', 'image/jpeg', 'image/png', 'image/webp']),
    quality: z.number().min(0.1).max(1),
})

type ResizeFormValues = z.input<typeof resizeSchema>

const steps = [
    { label: 'Upload' },
    { label: 'Configure' },
    { label: 'Download' },
]

export function ImageResizePage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<ResizeResultType | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [originalDims, setOriginalDims] =
        useState<ImageDimensions | null>(null)

    const currentStep = result ? 2 : file ? 1 : 0

    const form = useForm<ResizeFormValues>({
        resolver: zodResolver(resizeSchema),
        defaultValues: {
            maxDimension: 1920,
            outputType: 'keep',
            quality: 0.8,
        },
        mode: 'onChange',
    })

    const watchedOutputType = useWatch({
        control: form.control,
        name: 'outputType',
    })
    const watchedMaxDimension = useWatch({
        control: form.control,
        name: 'maxDimension',
    })

    const isLossyOutput =
        watchedOutputType === 'image/jpeg' ||
        watchedOutputType === 'image/webp' ||
        (watchedOutputType === 'keep' &&
            (file?.type === 'image/jpeg' || file?.type === 'image/webp'))

    const resultDims =
        originalDims && watchedMaxDimension !== undefined
            ? computeResizedDimensions(
                  originalDims.width,
                  originalDims.height,
                  Number(watchedMaxDimension)
              )
            : null

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile)
        setResult(null)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setOriginalDims(null)
        try {
            setOriginalDims(await getImageDimensions(selectedFile))
        } catch {
            toast.error('Could not read image dimensions.')
        }
    }

    const handleClear = () => {
        setFile(null)
        setResult(null)
        setOriginalDims(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const handleResize = async (values: ResizeFormValues) => {
        if (!file) return

        setIsProcessing(true)
        try {
            const resized = await resizeImage(file, {
                maxDimension: Number(values.maxDimension),
                outputType: values.outputType,
                quality: values.quality,
            })
            setResult(resized)
            if (resized.skipped) {
                toast.info(
                    'Image already fits the target size — no changes needed.'
                )
            } else {
                toast.success('Image resized successfully!')
            }
        } catch (error: unknown) {
            console.error('Resize failed:', error)
            toast.error(
                'Error resizing image. It might be corrupt or unsupported.'
            )
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Upload Image</CardTitle>
                    <CardDescription>
                        Resize an image and convert between JPG, PNG, and WebP
                        — entirely in your browser.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!file ? (
                        <ImageUploader onFileSelect={handleFileSelect} />
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <ImagePreview
                                file={file}
                                previewUrl={previewUrl}
                                onClear={handleClear}
                            />

                            {result ? (
                                <div className="animate-fade-in">
                                    <ResizeResult
                                        result={result}
                                        originalFile={file}
                                        onStartOver={handleClear}
                                    />
                                </div>
                            ) : (
                                <FormProvider {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            handleResize
                                        )}
                                        className="space-y-6"
                                    >
                                        <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <InputField
                                                    name="maxDimension"
                                                    label="Max Width / Height (px)"
                                                    type="number"
                                                    description="The longest side of the image; the other side scales to match."
                                                />
                                                <SelectField
                                                    name="outputType"
                                                    label="Output Format"
                                                    options={[
                                                        {
                                                            label: 'Keep Original',
                                                            value: 'keep',
                                                        },
                                                        {
                                                            label: 'JPEG',
                                                            value: 'image/jpeg',
                                                        },
                                                        {
                                                            label: 'PNG',
                                                            value: 'image/png',
                                                        },
                                                        {
                                                            label: 'WebP',
                                                            value: 'image/webp',
                                                        },
                                                    ]}
                                                />
                                                {isLossyOutput && (
                                                    <SliderField
                                                        name="quality"
                                                        label="Quality"
                                                        min={0.1}
                                                        max={1}
                                                        step={0.05}
                                                        formatValue={(val) =>
                                                            `${Math.round(
                                                                val * 100
                                                            )}%`
                                                        }
                                                    />
                                                )}
                                            </div>

                                            {originalDims && resultDims && (
                                                <p className="text-sm text-muted-foreground mt-4">
                                                    {originalDims.width}×
                                                    {originalDims.height} →{' '}
                                                    <span className="text-foreground font-medium">
                                                        {resultDims.width}×
                                                        {resultDims.height}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                            <Button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2
                                                            className="animate-spin"
                                                            aria-hidden="true"
                                                        />
                                                        Resizing...
                                                    </>
                                                ) : (
                                                    'Resize Image'
                                                )}
                                            </Button>
                                        </div>
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