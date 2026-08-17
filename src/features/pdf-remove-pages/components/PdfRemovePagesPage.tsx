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
    pageToggled,
    pagesReplaced,
    removePages,
    selectPagesToRemove,
    selectRemoveIsProcessing,
    selectRemoveItem,
    selectRemoveResultUrl
} from '../pdfRemovePagesSlice'
import { RemovePagesWorkspace } from './RemovePagesWorkspace'

const steps = [{ label: 'Upload' }, { label: 'Remove' }, { label: 'Download' }]

export function PdfRemovePagesPage() {
    const dispatch = useAppDispatch()
    const item = useAppSelector(selectRemoveItem)
    const pagesToRemove = useAppSelector(selectPagesToRemove)
    const resultUrl = useAppSelector(selectRemoveResultUrl)
    const isProcessing = useAppSelector(selectRemoveIsProcessing)

    const currentStep = resultUrl ? 2 : item ? 1 : 0

    const handleFileSelect = (file: File) => {
        dispatch(fileSelected({ id: genId(), file }))
    }

    const handleSubmit = async () => {
        if (pagesToRemove.length === 0) {
            toast.error('Select at least one page to remove.')
            return
        }
        try {
            await dispatch(removePages()).unwrap()
            toast.success('Pages removed successfully!')
        } catch (error: unknown) {
            console.error('Remove pages failed:', error)
            toast.error(
                'Error processing the PDF. It might be corrupt or password-protected.'
            )
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Remove Pages from PDF</CardTitle>
                    <CardDescription>
                        Delete unwanted pages by clicking them or entering page
                        ranges. Everything happens on your device.
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
                            title="Pages Removed!"
                            description="Your updated PDF is ready to download."
                            defaultFilename="Reduced_PDF"
                            buttonLabel="Download Updated PDF"
                            onStartOver={() => dispatch(clearAll())}
                        />
                    ) : (
                        <RemovePagesWorkspace
                            item={item}
                            pagesToRemove={pagesToRemove}
                            isProcessing={isProcessing}
                            onTogglePage={(page) =>
                                dispatch(pageToggled(page))
                            }
                            onApplyRanges={(pages) =>
                                dispatch(pagesReplaced(pages))
                            }
                            onClear={() => dispatch(clearAll())}
                            onSubmit={handleSubmit}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    )
}
