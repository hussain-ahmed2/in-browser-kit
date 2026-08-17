'use client'

import { Button } from '@/components/ui/button'
import { Loader2, RotateCw, Undo2 } from 'lucide-react'
import { PdfPageGrid } from '@/features/pdf-tools/components/PdfPageGrid'
import { usePdfDocument } from '@/features/pdf-tools/lib/usePdfDocument'
import type { PdfRotateItem } from '../pdfRotateSlice'
import type { RotationAngle } from '@/features/pdf-tools/lib/pdf'

interface RotateWorkspaceProps {
    item: PdfRotateItem
    rotations: Record<number, RotationAngle>
    isProcessing: boolean
    onRotatePage: (page: number) => void
    onRotateAll: (pageCount: number) => void
    onReset: () => void
    onClear: () => void
    onSubmit: () => void
}

export function RotateWorkspace({
    item,
    rotations,
    isProcessing,
    onRotatePage,
    onRotateAll,
    onReset,
    onClear,
    onSubmit
}: RotateWorkspaceProps) {
    const { pdf, error } = usePdfDocument(item.file)

    if (error) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" onClick={onClear}>
                    Choose a Different File
                </Button>
            </div>
        )
    }

    if (!pdf) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-brand" aria-hidden="true" />
            </div>
        )
    }

    const rotatedCount = Object.keys(rotations).length

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {item.file.name}
                    </p>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {pdf.numPages} page{pdf.numPages === 1 ? '' : 's'}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRotateAll(pdf.numPages)}
                    >
                        <RotateCw aria-hidden="true" />
                        Rotate All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        disabled={rotatedCount === 0}
                    >
                        <Undo2 aria-hidden="true" />
                        Reset
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClear}>
                        Change File
                    </Button>
                </div>
            </div>

            <PdfPageGrid
                pdf={pdf}
                getPageRotation={(pageNumber) => rotations[pageNumber] ?? 0}
                renderPageActions={(pageNumber) => {
                    const degrees = rotations[pageNumber] ?? 0
                    return (
                        <>
                            <span className="min-w-8 text-center text-xs text-muted-foreground tabular-nums">
                                {degrees === 0 ? '' : `${degrees}°`}
                            </span>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => onRotatePage(pageNumber)}
                                aria-label={`Rotate page ${pageNumber} by 90°`}
                            >
                                <RotateCw aria-hidden="true" />
                            </Button>
                        </>
                    )
                }}
            />

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isProcessing || rotatedCount === 0}
                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                    {isProcessing ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            Rotating...
                        </>
                    ) : (
                        'Rotate & Download'
                    )}
                </Button>
            </div>
        </div>
    )
}
