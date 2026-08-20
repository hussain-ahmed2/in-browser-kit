'use client'

import { useState, useCallback, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Download, Minus, Plus, Fingerprint, Loader2, Copy } from 'lucide-react'
import { generateUuids } from '../lib/uuidGenerator'

export function UuidGeneratorPage() {
    const [version, setVersion] = useState<'v1' | 'v4' | 'v7'>('v4')
    const [count, setCount] = useState(10)
    const [uppercase, setUppercase] = useState(false)
    const [includeBraces, setIncludeBraces] = useState(false)
    const [includeHyphens, setIncludeHyphens] = useState(true)
    const [results, setResults] = useState<Array<{ uuid: string; version: 'v1' | 'v4' | 'v7' }>>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generate = useCallback(() => {
        setError(null)
        setIsGenerating(true)
        setResults([])

        const options = {
            version,
            count,
            uppercase,
            includeBraces,
            includeHyphens
        }

        try {
            const uuids = generateUuids(options)
            setResults(uuids)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate UUIDs')
        } finally {
            setIsGenerating(false)
        }
    }, [version, count, uppercase, includeBraces, includeHyphens])

    useEffect(() => {
        setTimeout(() => generate(), 0)
    }, [generate])

    const handleDownload = () => {
        if (results.length > 0) {
            const content = results.map(r => r.uuid).join('\n')
            const blob = new Blob([content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `uuids-${version}-${Date.now()}.txt`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const handleCopyAll = () => {
        if (results.length > 0) {
            const content = results.map(r => r.uuid).join('\n')
            navigator.clipboard.writeText(content)
        }
    }

    const handleClear = () => {
        setResults([])
        setError(null)
    }

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    UUID Generator
                </CardTitle>
                <CardDescription>
                    Generate UUIDs (v1, v4, v7) with customizable formatting. Runs locally — nothing is uploaded.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Label>Version</Label>
                        <Select value={version} onValueChange={setVersion as (value: string) => void}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select version" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="v1">v1 (Time-based)</SelectItem>
                                <SelectItem value="v4">v4 (Random)</SelectItem>
                                <SelectItem value="v7">v7 (Time-ordered)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label>Count</Label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCount(Math.max(1, count - 1))}
                                disabled={count <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={10000}
                                className="w-24 text-center rounded-lg border border-input bg-transparent p-2 text-sm font-mono focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCount(Math.min(10000, count + 1))}
                                disabled={count >= 10000}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={uppercase} onCheckedChange={setUppercase as (checked: boolean) => void} />
                        Uppercase
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={includeHyphens} onCheckedChange={setIncludeHyphens as (checked: boolean) => void} />
                        Hyphens
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={includeBraces} onCheckedChange={setIncludeBraces as (checked: boolean) => void} />
                        Braces
                    </Label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button onClick={generate} disabled={isGenerating} className="flex-1">
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Generating…
                            </>
                        ) : (
                            'Generate'
                        )}
                    </Button>
                    <Button variant="outline" onClick={handleDownload} disabled={results.length === 0}>
                        <Download />
                        Download
                    </Button>
                    <Button variant="outline" onClick={handleCopyAll} disabled={results.length === 0}>
                        <Copy />
                        Copy All
                    </Button>
                    <Button variant="ghost" onClick={handleClear} disabled={results.length === 0}>
                        Clear
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="text-sm">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Generated UUIDs ({results.length})</Label>
                        {results.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleCopyAll}>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                Copy All
                            </Button>
                        )}
                    </div>
                    <Textarea
                        readOnly
                        value={results.map(r => r.uuid).join('\n')}
                        placeholder={isGenerating ? 'Generating UUIDs…' : 'Generated UUIDs will appear here…'}
                        className="min-h-48 resize-y font-mono text-sm"
                    />
                    {results.length > 0 && (
                        <p className="text-xs text-muted-foreground tabular-nums">
                            {results.length} UUIDs generated
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}