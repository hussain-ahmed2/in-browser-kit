'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Scissors } from 'lucide-react'
import { PdfPageGrid } from '@/features/pdf-tools/components/PdfPageGrid'
import { usePdfDocument } from '@/features/pdf-tools/lib/usePdfDocument'
import type { PdfSplitItem } from '../pdfSplitSlice'

interface SplitWorkspaceProps {
    item: PdfSplitItem
    config: { mode: string; ranges: string; every: number }
    isProcessing: boolean
    onModeChange: (mode: string) => void
    onRangesChange: (ranges: string) => void
    onEveryChange: (every: number) => void
    onClear: () => void
    onSubmit: () => void
}

const modes = [
    { value: 'ranges', label: 'Extract by ranges', hint: 'e.g. 1,3,5-7' },
    { value: 'every', label: 'Split every N pages', hint: 'e.g. every 2 pages' },
    { value: 'all', label: 'Split all pages', hint: 'Each page as a separate PDF' }
] as const

export function SplitWorkspace({
    item,
    config,
    isProcessing,
    onModeChange,
    onRangesChange,
    onEveryChange,
    onClear,
    onSubmit
}: SplitWorkspaceProps) {
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

    const hasConfig = config.mode === 'ranges' ? config.ranges.trim() : config.every > 0

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
                <Button variant="ghost" size="sm" onClick={onClear}>
                    Change File
                </Button>
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/20">
                <p className="text-sm font-medium">Split mode</p>
                <RadioGroup
                    value={config.mode}
                    onValueChange={onModeChange}
                    className="grid grid-cols-3 gap-3"
                >
                    {modes.map((mode) => (
                        <label
                            key={mode.value}
                            className="flex flex-col gap-1.5 p-3 rounded-lg border border-border bg-background hover:bg-accent cursor-pointer transition-colors"
                        >
                            <RadioGroupItem value={mode.value} className="sr-only" />
                            <span className="font-medium">{mode.label}</span>
                            <span className="text-xs text-muted-foreground">{mode.hint}</span>
                        </label>
                    ))}
                </RadioGroup>

                {config.mode === 'ranges' && (
                    <div className="space-y-2">
                        <Label htmlFor="ranges" className="text-sm font-medium">
                            Page ranges
                        </Label>
                        <Input
                            id="ranges"
                            value={config.ranges}
                            onChange={(e) => onRangesChange(e.target.value)}
                            placeholder="e.g. 1,3,5-7"
                            className="w-full"
                            aria-describedby="ranges-hint"
                        />
                        <p id="ranges-hint" className="text-xs text-muted-foreground">
                            Comma-separated page numbers or ranges (e.g. 1,3,5-7).
                            Invalid pages are ignored.
                        </p>
                    </div>
                )}

                {config.mode === 'every' && (
                    <div className="space-y-2">
                        <Label htmlFor="every" className="text-sm font-medium">
                            Pages per split
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="every"
                                type="number"
                                min="1"
                                max={pdf.numPages}
                                value={config.every}
                                onChange={(e) => onEveryChange(parseInt(e.target.value) || 1)}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                                (1-{pdf.numPages})
                            </span>
                        </div>
                    </div>
                )}

                {config.mode === 'all' && (
                    <p className="text-sm text-muted-foreground">
                        Will create {pdf.numPages} individual PDF files in a ZIP archive.
                    </p>
                )}
            </div>

            <PdfPageGrid
                pdf={pdf}
                renderPageActions={(pageNumber) => (
                    <span className="min-w-8 text-center text-xs text-muted-foreground tabular-nums">
                        {pageNumber}
                    </span>
                )}
            />

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isProcessing || !hasConfig}
                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" aria-hidden="true" />
                            Splitting...
                        </>
                    ) : (
                        <>
                            <Scissors aria-hidden="true" />
                            Split & Download
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}