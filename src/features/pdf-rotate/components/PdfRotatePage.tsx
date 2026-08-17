'use client'

import { toast } from 'sonner'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { PdfResult } from '@/features/pdf-tools/components/PdfResult'
import { PdfUploader } from '@/features/pdf-tools/components/PdfUploader'
import { genId } from '@/lib/id'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
    clearAll,
    fileSelected,
    resetRotations,
    rotateAllPages,
    rotatePdf,
    rotationSet,
    selectRotateIsProcessing,
    selectRotateItem,
    selectRotateResultUrl,
    selectRotations
} from '../pdfRotateSlice'
import { RotateWorkspace } from './RotateWorkspace'
import type { RotationAngle } from '@/features/pdf-tools/lib/pdf'

const steps = [{ label: 'Upload' }, { label: 'Rotate' }, { label: 'Download' }]

export function PdfRotatePage() {
    const dispatch = useAppDispatch()
    const item = useAppSelector(selectRotateItem)
    const rotations = useAppSelector(selectRotations)
    const resultUrl = useAppSelector(selectRotateResultUrl)
    const isProcessing = useAppSelector(selectRotateIsProcessing)

    const currentStep = resultUrl ? 2 : item ? 1 : 0

    const handleFileSelect = (file: File) => {
        dispatch(fileSelected({ id: genId(), file }))
    }

    const rotatePage = (page: number) => {
        const current = rotations[page] ?? 0
        dispatch(
            rotationSet({
                page,
                degrees: ((current + 90) % 360) as RotationAngle
            })
        )
    }

    const handleRotateAll = (pageCount: number) => {
        dispatch(rotateAllPages({ by: 90, pageCount }))
    }

    const handleReset = () => {
        dispatch(resetRotations())
    }

    const handleSubmit = async () => {
        if (Object.keys(rotations).length === 0) {
            toast.error('Rotate at least one page first.')
            return
        }
        try {
            await dispatch(rotatePdf()).unwrap()
            toast.success('Pages rotated successfully!')
        } catch (error: unknown) {
            console.error('Rotate failed:', error)
            toast.error(
                'Error rotating the PDF. It might be corrupt or password-protected.'
            )
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Rotate PDF Pages</CardTitle>
                    <CardDescription>
                        Rotate individual pages by 90° increments, or all pages
                        at once. Everything happens on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!item ? (
                        <PdfUploader
                            onFileSelect={handleFileSelect}
                            hint="Choose a PDF to preview its pages"
                        />
                    ) : resultUrl ? (
                        <PdfResult
                            url={resultUrl}
                            title="Rotation Complete!"
                            description="Your rotated PDF is ready to download."
                            defaultFilename="Rotated_PDF"
                            buttonLabel="Download Rotated PDF"
                            onStartOver={() => dispatch(clearAll())}
                        />
                    ) : (
                        <RotateWorkspace
                            item={item}
                            rotations={rotations}
                            isProcessing={isProcessing}
                            onRotatePage={rotatePage}
                            onRotateAll={handleRotateAll}
                            onReset={handleReset}
                            onClear={() => dispatch(clearAll())}
                            onSubmit={handleSubmit}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    )
}
