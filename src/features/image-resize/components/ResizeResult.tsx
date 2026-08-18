'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ArrowRight, ImageDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { ResizeResult, ResizeOutputType } from '../lib/imageResize'
import { deriveOutputName } from '../lib/imageResize'

interface ResizeResultProps {
    result: ResizeResult
    originalFile: File
    onStartOver: () => void
}

function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function ResizeResult({
    result,
    originalFile,
    onStartOver,
}: ResizeResultProps) {
    const [showComparison, setShowComparison] = useState(false)

    const originalUrl = URL.createObjectURL(originalFile)
    const outputUrl = URL.createObjectURL(result.file)
    const outputName = deriveOutputName(
        result.file.name,
        result.file.type as ResizeOutputType
    )

    const handleDownload = () => {
        const url = URL.createObjectURL(result.file)
        const link = document.createElement('a')
        link.href = url
        link.download = outputName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <Alert variant={result.skipped ? 'default' : 'success'}>
                <ImageDown className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>
                    {result.skipped ? 'No Changes Needed' : 'Resize Complete!'}
                </AlertTitle>
                <AlertDescription className="mt-1 text-foreground">
                    {result.originalWidth}×{result.originalHeight} →{' '}
                    {result.resizedWidth}×{result.resizedHeight}
                    <span className="ml-2 text-muted-foreground">
                        {formatSize(result.file.size)}
                    </span>
                </AlertDescription>
            </Alert>

            {showComparison ? (
                <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Original
                            </p>
                            <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={originalUrl}
                                    alt="Original image"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Result
                            </p>
                            <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={outputUrl}
                                    alt="Resized image"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowComparison(false)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block"
                    >
                        Hide comparison
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-1.5 text-xs text-brand hover:underline mx-auto block transition-colors"
                >
                    <ArrowRight className="size-3" />
                    Compare before &amp; after
                </button>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={onStartOver}>
                    Start Over
                </Button>
                <Button
                    onClick={handleDownload}
                    variant="success"
                    className="w-full sm:w-auto"
                    aria-label="Download resized image"
                >
                    <Download aria-hidden="true" />
                    Download Image
                </Button>
            </div>
        </div>
    )
}