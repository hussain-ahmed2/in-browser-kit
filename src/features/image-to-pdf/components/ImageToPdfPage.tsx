'use client'

import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { PointerSensor } from '@dnd-kit/dom'
import { move } from '@dnd-kit/helpers'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Image as ImageIcon, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { SliderField } from '@/components/form/slider-field'
import { SelectField } from '@/components/form/select-field'
import { StepIndicator } from '@/components/StepIndicator'
import { genId } from '@/lib/id'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ImageUploader } from './ImageUploader'
import { ImageFileList } from './ImageFileList'
import { ImageToPdfResult } from './ImageToPdfResult'
import {
    clearItems,
    convertImagesToPdf,
    fileRemoved,
    filesAdded,
    itemsReplaced,
    selectIsProcessing,
    selectItems,
    selectResultUrl,
} from '@/features/image-to-pdf/imageToPdfSlice'
import { PAGE_SIZE_OPTIONS, PAGE_SIZE_LABELS } from '../lib/imageToPdf'

const convertSchema = z.object({
    pageSize: z.enum(PAGE_SIZE_OPTIONS),
    margin: z.number().min(0).max(120),
})

type ConvertFormValues = z.infer<typeof convertSchema>

const steps = [
    { label: 'Upload' },
    { label: 'Arrange' },
    { label: 'Download' },
]

export function ImageToPdfPage() {
    const dispatch = useAppDispatch()
    const items = useAppSelector(selectItems)
    const resultUrl = useAppSelector(selectResultUrl)
    const isProcessing = useAppSelector(selectIsProcessing)

    const currentStep = resultUrl ? 2 : items.length > 0 ? 1 : 0

    const form = useForm<ConvertFormValues>({
        resolver: zodResolver(convertSchema),
        defaultValues: {
            pageSize: 'fit',
            margin: 24,
        },
    })

    const handleFilesSelect = (selectedFiles: File[]) => {
        dispatch(
            filesAdded(
                selectedFiles.map((file) => ({
                    id: genId(),
                    file,
                    previewUrl: URL.createObjectURL(file),
                }))
            )
        )
    }

    const removeFile = (index: number) => {
        const removed = items[index]
        if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
        dispatch(fileRemoved(index))
    }

    const clearAll = () => {
        for (const item of items) {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
        }
        dispatch(clearItems())
    }

    const moveUp = (index: number) => {
        if (index <= 0) return
        dispatch(itemsReplaced(moveInArray(items, index, index - 1)))
    }

    const moveDown = (index: number) => {
        if (index >= items.length - 1) return
        dispatch(itemsReplaced(moveInArray(items, index, index + 1)))
    }

    const handleDragEnd: NonNullable<
        React.ComponentProps<typeof DragDropProvider>['onDragEnd']
    > = (event) => {
        if (event.canceled) return
        const { source, target } = event.operation
        if (!source || !target) return
        dispatch(itemsReplaced(move(items, event)))
    }

    const handleConvert = async (values: ConvertFormValues) => {
        if (items.length === 0) {
            toast.error('Please add at least one image.')
            return
        }

        try {
            await dispatch(convertImagesToPdf(values)).unwrap()
            toast.success('PDF created successfully!')
        } catch (error: unknown) {
            console.error('Image to PDF failed:', error)
            toast.error(
                'Error creating PDF. A file might be corrupt or unsupported.'
            )
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Add Images</CardTitle>
                    <CardDescription>
                        Combine multiple images into a single PDF — one image
                        per page, processed entirely in your browser.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <ImageUploader onFilesSelect={handleFilesSelect} />

                    <DragDropProvider
                        onDragEnd={handleDragEnd}
                        sensors={(defaults) => [
                            ...defaults.filter(
                                (sensor) => sensor !== PointerSensor
                            ),
                            PointerSensor.configure({
                                activationConstraints: () => undefined,
                            }),
                        ]}
                    >
                        <ImageFileList
                            items={items}
                            onRemove={removeFile}
                            onMoveUp={moveUp}
                            onMoveDown={moveDown}
                            onClearAll={clearAll}
                        />
                        <DragOverlay>
                            {(source) => {
                                const name =
                                    (source.data?.name as string | undefined) ??
                                    ''
                                return (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border shadow-xl shadow-brand/10 ring-2 ring-brand/60">
                                        <GripVertical
                                            className="w-3.5 h-3.5 text-muted-foreground/40"
                                            aria-hidden="true"
                                        />
                                        <ImageIcon
                                            className="w-4 h-4 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <p className="font-medium truncate text-sm">
                                            {name}
                                        </p>
                                    </div>
                                )
                            }}
                        </DragOverlay>
                    </DragDropProvider>

                    {resultUrl ? (
                        <div className="animate-fade-in">
                            <ImageToPdfResult
                                url={resultUrl}
                                onStartOver={clearAll}
                            />
                        </div>
                    ) : items.length > 0 ? (
                        <div className="space-y-6">
                            <FormProvider {...form}>
                                <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <SelectField
                                            name="pageSize"
                                            label="Page Size"
                                            options={PAGE_SIZE_OPTIONS.map(
                                                (size) => ({
                                                    label: PAGE_SIZE_LABELS[size],
                                                    value: size,
                                                })
                                            )}
                                        />
                                        <SliderField
                                            name="margin"
                                            label="Margin (pt)"
                                            min={0}
                                            max={120}
                                            step={8}
                                            formatValue={(val) => `${val}pt`}
                                        />
                                    </div>
                                </div>
                            </FormProvider>

                            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                <Button
                                    onClick={form.handleSubmit(handleConvert)}
                                    disabled={isProcessing || items.length === 0}
                                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                            Creating PDF...
                                        </>
                                    ) : (
                                        'Create PDF'
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </>
    )
}

function moveInArray<T>(arr: T[], from: number, to: number): T[] {
    const next = [...arr]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
}