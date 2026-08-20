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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from './ImageUploader'
import { ImageBatchPreview } from './ImageBatchPreview'
import { CompressedBatchResult } from './CompressedBatchResult'
import { StepIndicator } from '@/components/StepIndicator'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/form/input-field'
import { CheckboxField } from '@/components/form/checkbox-field'
import { SelectField } from '@/components/form/select-field'
import { SliderField } from '@/components/form/slider-field'
import { FieldGroup, FieldSet } from '@/components/ui/field'
import { compressorSchema, CompressorFormValues, CompressionResult } from '../types'
import { COMPRESSOR_DEFAULTS, MAX_BATCH_SIZE } from '../constants'

const steps = [
    { label: 'Upload' },
    { label: 'Configure' },
    { label: 'Download' }
]

export function ImageCompressorPage() {
    const [files, setFiles] = useState<File[]>([])
    const [results, setResults] = useState<CompressionResult[]>([])
    const [isCompressing, setIsCompressing] = useState<boolean>(false)

    const currentStep = results.length > 0 ? 2 : files.length > 0 ? 1 : 0

    const form = useForm<CompressorFormValues>({
        resolver: zodResolver(compressorSchema),
        defaultValues: COMPRESSOR_DEFAULTS
    })

    const handleFilesSelect = (selectedFiles: File[]) => {
        setFiles(prev => {
            const combined = [...prev, ...selectedFiles];
            if (combined.length > MAX_BATCH_SIZE) {
                toast.error(`You can only process up to ${MAX_BATCH_SIZE} images at a time.`);
                return combined.slice(0, MAX_BATCH_SIZE);
            }
            return combined;
        })
        setResults([])
    }

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setResults([])
    }

    const handleClearAll = () => {
        setFiles([])
        setResults([])
    }

    const compressImages = async (values: CompressorFormValues) => {
        if (files.length === 0) return

        setIsCompressing(true)
        const options: Parameters<typeof imageCompression>[1] = {
            maxSizeMB: Number(values.maxSizeMB),
            maxWidthOrHeight: Number(values.maxWidth),
            useWebWorker: true,
            initialQuality: Number(values.initialQuality),
            alwaysKeepResolution: Boolean(values.alwaysKeepResolution)
        }

        if (values.fileType !== 'keep') {
            options.fileType = values.fileType
        }

        try {
            const compressionPromises = files.map(async (file) => {
                let compressed = await imageCompression(file, options)

                // If the user requested a format change, ensure the file extension matches the new MIME type
                if (values.fileType !== 'keep' && compressed.type === values.fileType) {
                    const ext = values.fileType === 'image/jpeg' ? '.jpg' 
                              : values.fileType === 'image/png' ? '.png' 
                              : '.webp';
                              
                    const lastDot = file.name.lastIndexOf('.');
                    const nameWithoutExt = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
                    const newName = `${nameWithoutExt}${ext}`;
                    
                    if (compressed.name !== newName) {
                        compressed = new File([compressed], newName, { type: compressed.type });
                    }
                }

                return { originalFile: file, compressedFile: compressed }
            })

            const completedResults = await Promise.all(compressionPromises)
            setResults(completedResults)
            toast.success(`Successfully compressed ${completedResults.length} image(s)!`)
        } catch (error: unknown) {
            console.error('Compression failed:', error)
            toast.error(
                'Error compressing images. Some might be corrupt or unsupported.'
            )
        } finally {
            setIsCompressing(false)
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Batch Image Compressor</CardTitle>
                    <CardDescription>
                        Select multiple JPG, PNG, or WebP files to compress simultaneously.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {files.length === 0 ? (
                        <ImageUploader onFilesSelect={handleFilesSelect} />
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <ImageBatchPreview
                                files={files}
                                onRemove={handleRemoveFile}
                                onClearAll={handleClearAll}
                            />

                            {results.length > 0 ? (
                                <div className="animate-fade-in">
                                    <CompressedBatchResult 
                                        results={results} 
                                        onTweakSettings={() => setResults([])} 
                                    />
                                </div>
                            ) : (
                                <FormProvider {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(compressImages)}
                                        className="space-y-6"
                                    >
                                        <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                                            <FieldGroup>
                                                <FieldSet className="grid grid-cols-1 sm:grid-cols-2">
                                                    <InputField
                                                        name="maxSizeMB"
                                                        label="Max Target Size (MB)"
                                                        type="number"
                                                        step={0.1}
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
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const fileInput = document.createElement("input");
                                                    fileInput.type = "file";
                                                    fileInput.multiple = true;
                                                    fileInput.accept = "image/*";
                                                    fileInput.onchange = (e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        if (target.files) {
                                                            const newFiles = Array.from(target.files);
                                                            handleFilesSelect(newFiles);
                                                        }
                                                    };
                                                    fileInput.click();
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                Add More Files
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isCompressing || files.length === 0}
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
                                                    `Compress ${files.length} Image${files.length > 1 ? 's' : ''}`
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
