'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from './ImageUploader'
import { ImagePreview } from './ImagePreview'
import { CompressedResult } from './CompressedResult'
import { StepIndicator } from '@/components/StepIndicator'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { InputField } from '@/components/form/input-field'
import { CheckboxField } from '@/components/form/checkbox-field'
import { SelectField } from '@/components/form/select-field'
import { SliderField } from '@/components/form/slider-field'
import { FieldGroup, FieldSet } from '@/components/ui/field'

const compressorSchema = z.object({
    maxSizeMB: z.number().min(0.1, 'Must be at least 0.1 MB'),
    maxWidth: z.number().min(100, 'Must be at least 100px'),
    initialQuality: z.number().min(0.1).max(1.0),
    alwaysKeepResolution: z.boolean(),
    fileType: z.string()
})

type CompressorFormValues = z.infer<typeof compressorSchema>

const steps = [
    { label: 'Upload' },
    { label: 'Configure' },
    { label: 'Download' }
]

export function ImageCompressorPage() {
    const [file, setFile] = useState<File | null>(null)
    const [compressedFile, setCompressedFile] = useState<File | null>(null)
    const [isCompressing, setIsCompressing] = useState<boolean>(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const currentStep = compressedFile ? 2 : file ? 1 : 0

    const form = useForm<CompressorFormValues>({
        resolver: zodResolver(compressorSchema),
        defaultValues: {
            maxSizeMB: 1,
            maxWidth: 1920,
            initialQuality: 0.8,
            alwaysKeepResolution: false,
            fileType: 'keep'
        }
    })

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile)
        setCompressedFile(null)
        setPreviewUrl(URL.createObjectURL(selectedFile))
    }

    const handleClear = () => {
        setFile(null)
        setCompressedFile(null)
        setPreviewUrl(null)
    }

    const compressImage = async (values: CompressorFormValues) => {
        if (!file) return

        setIsCompressing(true)
        const options: Parameters<typeof imageCompression>[1] = {
            maxSizeMB: values.maxSizeMB,
            maxWidthOrHeight: values.maxWidth,
            useWebWorker: true,
            initialQuality: values.initialQuality,
            alwaysKeepResolution: values.alwaysKeepResolution
        }

        if (values.fileType !== 'keep') {
            options.fileType = values.fileType
        }

        try {
            const compressed = await imageCompression(file, options)
            setCompressedFile(compressed)
            toast.success('Image compressed successfully!')
        } catch (error: unknown) {
            console.error('Compression failed:', error)
            toast.error(
                'Error compressing image. It might be corrupt or unsupported.'
            )
        } finally {
            setIsCompressing(false)
        }
    }

    return (
        <main className="max-w-3xl mx-auto space-y-8">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-brand/25 to-glow/15 text-brand ring-1 ring-brand/25 shadow-[0_0_32px_-8px] shadow-brand/50 mb-4 animate-fade-in-up stagger-1">
                    <ImageIcon size={32} aria-hidden="true" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight animate-fade-in-up stagger-2">
                    Image Compressor
                </h1>
                <p className="text-muted-foreground text-lg animate-fade-in-up stagger-3">
                    Reduce image file size without losing quality. 100%
                    processed securely in your browser.
                </p>
            </header>

            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Upload Image</CardTitle>
                    <CardDescription>
                        Select a JPG, PNG, or WebP file to compress.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!file ? (
                        <ImageUploader
                            onFileSelect={handleFileSelect}
                            maxSizeMB={50}
                        />
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <ImagePreview
                                file={file}
                                previewUrl={previewUrl}
                                onClear={handleClear}
                            />

                            {compressedFile ? (
                                <div className="animate-fade-in">
                                    <CompressedResult
                                        originalFile={file}
                                        compressedFile={compressedFile}
                                    />
                                </div>
                            ) : (
                                <FormProvider {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            compressImage
                                        )}
                                        className="space-y-6"
                                    >
                                        <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                                            <FieldGroup>
                                                <FieldSet className="grid grid-cols-1 sm:grid-cols-2">
                                                    <InputField
                                                        name="maxSizeMB"
                                                        label="Max Target Size (MB)"
                                                        type="number"
                                                    />
                                                    <InputField
                                                        name="maxWidth"
                                                        label="Max Width / Height (px)"
                                                        type="number"
                                                    />

                                                    <SliderField
                                                        name="initialQuality"
                                                        label="Quality Tuning"
                                                        min={0.1}
                                                        max={1.0}
                                                        step={0.1}
                                                        formatValue={(val) =>
                                                            `${(val * 100).toFixed(0)}%`
                                                        }
                                                    />

                                                    <SelectField
                                                        name="fileType"
                                                        label="Output Format"
                                                        options={[
                                                            {
                                                                label: 'Keep Original',
                                                                value: 'keep'
                                                            },
                                                            {
                                                                label: 'JPEG',
                                                                value: 'image/jpeg'
                                                            },
                                                            {
                                                                label: 'PNG',
                                                                value: 'image/png'
                                                            },
                                                            {
                                                                label: 'WEBP',
                                                                value: 'image/webp'
                                                            }
                                                        ]}
                                                    />
                                                </FieldSet>

                                                <div className="pt-2">
                                                    <CheckboxField
                                                        name="alwaysKeepResolution"
                                                        label="Maintain Original Image Resolution (Ignores Max Width/Height)"
                                                    />
                                                </div>
                                            </FieldGroup>
                                        </div>

                                        <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                            <Button
                                                type="submit"
                                                disabled={isCompressing}
                                                className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                                            >
                                                {isCompressing ? (
                                                    <>
                                                        <Loader2
                                                            className="animate-spin"
                                                            aria-hidden="true"
                                                        />
                                                        Compressing...
                                                    </>
                                                ) : (
                                                    'Compress Image'
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
        </main>
    )
}
