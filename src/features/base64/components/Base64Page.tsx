'use client'

import { useState, useCallback, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CopyButton } from '@/components/CopyButton'
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
import { FileType, Download, Loader2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { encodeText, decodeText, encodeFile, decodeFile, validateBase64 } from '../lib/base64'

export function Base64Page() {
    const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
    const [inputText, setInputText] = useState('')
    const [inputFile, setInputFile] = useState<File | null>(null)
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleEncode = useCallback(async () => {
        setError(null)
        setOutput('')
        if (inputFile) {
            setIsProcessing(true)
            try {
                const base64 = await encodeFile(inputFile)
                setOutput(base64)
            } catch {
                setError('Failed to encode file')
            } finally {
                setIsProcessing(false)
            }
        } else if (inputText) {
            setOutput(encodeText(inputText))
        }
    }, [inputText, inputFile])

    const handleDecode = useCallback(async () => {
        setError(null)
        setOutput('')
        if (!inputText.trim()) return

        if (!validateBase64(inputText)) {
            setError('Invalid Base64 string')
            return
        }

        try {
            const text = decodeText(inputText)
            setOutput(text)
        } catch {
            setError('Failed to decode Base64')
        }
    }, [inputText])

    useEffect(() => {
        if (activeTab === 'encode') {
            setTimeout(() => handleEncode(), 0)
        } else {
            setTimeout(() => handleDecode(), 0)
        }
    }, [inputText, inputFile, activeTab, handleEncode, handleDecode])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setInputFile(file)
            setInputText('')
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value)
        setInputFile(null)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text')
        setInputText(text)
        setInputFile(null)
    }

    const handleDownload = async () => {
        if (activeTab === 'encode' && output) {
            const blob = new Blob([output], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = inputFile ? `${inputFile.name}.b64` : 'encoded.b64'
            a.click()
            URL.revokeObjectURL(url)
        } else if (activeTab === 'decode' && output && inputFile) {
            try {
                const file = await decodeFile(output, inputFile.name.replace(/\.b64$/, ''))
                const url = URL.createObjectURL(file)
                const a = document.createElement('a')
                a.href = url
                a.download = file.name
                a.click()
                URL.revokeObjectURL(url)
            } catch {
                setError('Failed to create download')
            }
        } else if (activeTab === 'decode' && output) {
            const blob = new Blob([output], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'decoded.txt'
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const clearAll = () => {
        setInputText('')
        setInputFile(null)
        setOutput('')
        setError(null)
    }

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle>Base64 Encode / Decode</CardTitle>
                <CardDescription>
                    Convert between text/files and Base64. Runs locally — nothing is
                    uploaded.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                    </TabsList>

                    <TabsContent value="encode" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <FileType className="h-4 w-4" />
                                Input (Text or File)
                            </Label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="encode-file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Choose file to encode"
                                />
                                <Textarea
                                    value={inputText}
                                    onChange={handleTextChange}
                                    onPaste={handlePaste}
                                    placeholder={
                                        inputFile
                                            ? `File selected: ${inputFile.name} (${(inputFile.size / 1024).toFixed(1)} KB) — click "Remove file" to type text`
                                            : 'Type or paste text to encode…'
                                    }
                                    className={cn(inputFile && 'text-muted-foreground')}
                                    disabled={!!inputFile}
                                />
                                {inputFile && (
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <Label
                                            htmlFor="encode-file"
                                            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors"
                                        >
                                            <FileType className="h-3.5 w-3.5" />
                                            Change file
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInputFile(null)
                                                const input = document.getElementById('encode-file') as HTMLInputElement
                                                if (input) input.value = ''
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Remove file
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Output</Label>
                                <div className="flex items-center gap-2">
                                    <CopyButton value={output} size="sm">
                                        Copy
                                    </CopyButton>
                                    {output && (
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </button>
                                    )}
                                    <button
                                        onClick={clearAll}
                                        disabled={!inputText && !inputFile && !output}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 disabled:opacity-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <Textarea
                                readOnly
                                value={output}
                                placeholder="Base64 output will appear here…"
                                className="text-sm"
                            />
                            {output && (
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    {output.length} characters
                                </p>
                            )}
                            {isProcessing && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing…
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="decode" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Base64 Input</Label>
                            <Textarea
                                value={inputText}
                                onChange={handleTextChange}
                                onPaste={handlePaste}
                                placeholder="Paste Base64 string to decode…"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive" className="text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Output</Label>
                                <div className="flex items-center gap-2">
                                    <CopyButton value={output} size="sm">
                                        Copy
                                    </CopyButton>
                                    {output && (
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </button>
                                    )}
                                    <button
                                        onClick={clearAll}
                                        disabled={!inputText && !output}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 disabled:opacity-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <Textarea
                                readOnly
                                value={output}
                                placeholder="Decoded text will appear here…"
                                className="text-sm"
                            />
                            {output && (
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    {output.length} characters
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}