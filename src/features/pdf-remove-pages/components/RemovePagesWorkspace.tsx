'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { PdfPageGrid } from '@/features/pdf-tools/components/PdfPageGrid'
import { parsePageRanges } from '@/features/pdf-tools/lib/pdf'
import { usePdfDocument } from '@/features/pdf-tools/lib/usePdfDocument'
import type { PdfRemovePagesItem } from '../pdfRemovePagesSlice'

interface RemovePagesWorkspaceProps {
    item: PdfRemovePagesItem
    pagesToRemove: number[]
    isProcessing: boolean
    onTogglePage: (page: number) => void
    onApplyRanges: (pages: number[]) => void
    onClear: () => void
    onSubmit: () => void
}

export function RemovePagesWorkspace({
    item,
    pagesToRemove,
    isProcessing,
    onTogglePage,
    onApplyRanges,
    onClear,
    onSubmit
}: RemovePagesWorkspaceProps) {
    const { pdf, error } = usePdfDocument(item.file)
    const [rangeInput, setRangeInput] = useState('')

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

    const removedSet = new Set(pagesToRemove)

    const applyRanges = () => {
        const pages = parsePageRanges(rangeInput, pdf.numPages)
        if (pages.length === 0) {
            toast.error(
                'No valid pages in that range. Use formats like 1,3 or 5-8.'
            )
            return
        }
        onApplyRanges(pages)
        setRangeInput('')
    }

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
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Input
                            value={rangeInput}
                            onChange={(event) => setRangeInput(event.target.value)}
                            placeholder="e.g. 1,3,5-7"
                            className="w-40"
                            aria-label="Page numbers to remove"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={applyRanges}
                        >
                            Select
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClear}>
                        Change File
                    </Button>
                </div>
            </div>

            <PdfPageGrid
                pdf={pdf}
                renderPageActions={(pageNumber) => {
                    const removed = removedSet.has(pageNumber)
                    return (
                        <Button
                            variant={removed ? 'destructive' : 'outline'}
                            size="icon-sm"
                            onClick={() => onTogglePage(pageNumber)}
                            aria-label={
                                removed
                                    ? `Restore page ${pageNumber}`
                                    : `Remove page ${pageNumber}`
                            }
                        >
                            {removed ? (
                                <RotateCcw aria-hidden="true" />
                            ) : (
                                <Trash2 aria-hidden="true" />
                            )}
                        </Button>
                    )
                }}
                renderPageOverlay={(pageNumber) =>
                    removedSet.has(pageNumber) ? (
                        <div className="absolute inset-0 grid place-items-center bg-destructive/60 pointer-events-none">
                            <span className="rounded bg-background px-2 py-0.5 text-xs font-semibold text-destructive">
                                Removed
                            </span>
                        </div>
                    ) : null
                }
            />

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isProcessing || pagesToRemove.length === 0}
                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                    {isProcessing ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            Removing...
                        </>
                    ) : (
                        `Remove ${pagesToRemove.length} Page${
                            pagesToRemove.length === 1 ? '' : 's'
                        } & Download`
                    )}
                </Button>
            </div>
        </div>
    )
}
