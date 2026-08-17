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
    everySet,
    fileSelected,
    modeSet,
    rangesSet,
    selectSplitConfig,
    selectSplitIsProcessing,
    selectSplitItem,
    selectSplitResultUrls,
    splitPdf
} from '../pdfSplitSlice'
import { SplitWorkspace } from './SplitWorkspace'

const steps = [
    { label: 'Upload' },
    { label: 'Configure' },
    { label: 'Download' }
]

export function PdfSplitPage() {
    const dispatch = useAppDispatch()
    const item = useAppSelector(selectSplitItem)
    const config = useAppSelector(selectSplitConfig)
    const resultUrls = useAppSelector(selectSplitResultUrls)
    const isProcessing = useAppSelector(selectSplitIsProcessing)

    const currentStep = resultUrls.length > 0 ? 2 : item ? 1 : 0

    const handleFileSelect = (file: File) => {
        dispatch(fileSelected({ id: genId(), file }))
    }

    const handleModeChange = (mode: string) => {
        dispatch(modeSet(mode as 'ranges' | 'every' | 'all'))
    }

    const handleRangesChange = (ranges: string) => {
        dispatch(rangesSet(ranges))
    }

    const handleEveryChange = (every: number) => {
        dispatch(everySet(every))
    }

    const handleSubmit = async () => {
        if (!hasConfig(config)) {
            toast.error('Please configure the split options.')
            return
        }
        try {
            await dispatch(splitPdf()).unwrap()
            toast.success(
                resultUrls.length === 1
                    ? 'PDF split successfully!'
                    : `PDF split into ${resultUrls.length} file(s)!`
            )
        } catch (error: unknown) {
            console.error('Split failed:', error)
            toast.error(
                'Error splitting the PDF. It might be corrupt or password-protected.'
            )
        }
    }

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Split PDF</CardTitle>
                    <CardDescription>
                        Extract pages, split by ranges, or burst into individual files.
                        Everything happens on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!item ? (
                        <PdfUploader
                            onFileSelect={handleFileSelect}
                            hint="Choose a PDF to preview its pages"
                        />
                    ) : resultUrls.length > 0 ? (
                        <PdfResult
                            url={resultUrls[0]}
                            title="Split Complete!"
                            description={
                                resultUrls.length === 1
                                    ? 'Your split PDF is ready to download.'
                                    : `Your split PDFs ({resultUrls.length} files) are ready as a ZIP.`
                            }
                            defaultFilename="Split_PDF"
                            buttonLabel={
                                resultUrls.length === 1
                                    ? 'Download Split PDF'
                                    : 'Download ZIP Archive'
                            }
                            onStartOver={() => dispatch(clearAll())}
                        />
                    ) : (
                        <SplitWorkspace
                            item={item}
                            config={config}
                            isProcessing={isProcessing}
                            onModeChange={handleModeChange}
                            onRangesChange={handleRangesChange}
                            onEveryChange={handleEveryChange}
                            onClear={() => dispatch(clearAll())}
                            onSubmit={handleSubmit}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    )
}

function hasConfig(config: { mode: string; ranges: string; every: number }): boolean {
    if (config.mode === 'ranges') return config.ranges.trim() !== ''
    if (config.mode === 'every') return config.every > 0
    if (config.mode === 'all') return true
    return false
}