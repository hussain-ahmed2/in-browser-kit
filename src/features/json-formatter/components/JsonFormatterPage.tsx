'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Download, ChevronRight, ChevronDown, FileText, Braces } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    formatJson,
    validateJson,
    jsonToTree,
    JsonTreeNode,
    getTypeColor,
    formatValue
} from '../lib/jsonFormatter'

function TreeNode({ node, level = 0 }: { node: JsonTreeNode; level?: number }) {
    const [expanded, setExpanded] = useState(node.expanded ?? true)

    const hasChildren = node.children && node.children.length > 0
    const isPrimitive = node.type !== 'object' && node.type !== 'array'

    const toggleExpanded = () => setExpanded(!expanded)

    const keyDisplay = node.key !== null ? (
        <span className="font-mono text-gray-600 dark:text-gray-300">{node.key}:</span>
    ) : null

    const valueDisplay = isPrimitive ? (
        <span className={cn('font-mono', getTypeColor(node.type))}>
            {formatValue(node.value, node.type)}
        </span>
    ) : (
        <span className={cn('font-mono', getTypeColor(node.type))}>
            {node.type === 'object' ? '{ }' : '[ ]'}
        </span>
    )

    return (
        <div className="select-none">
            <div className="flex items-center gap-1.5 py-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 dark:text-gray-500">{'  '.repeat(level)}</span>
                    {hasChildren && (
                        <button
                            onClick={toggleExpanded}
                            className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                    )}
                    {hasChildren && !expanded && <span className="w-3.5" />}
                    {keyDisplay}
                    {valueDisplay}
                </div>
            </div>
            {hasChildren && expanded && (
                <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-2">
                    {node.children!.map((child, index) => (
                        <TreeNode key={index} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TreeView({ data }: { data: unknown }) {
    const tree = useMemo(() => jsonToTree(data), [data])

    return (
        <div className="font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto font-mono">
            <TreeNode node={tree} />
        </div>
    )
}

export function JsonFormatterPage() {
    const [inputText, setInputText] = useState('')
    const [mode, setMode] = useState<'pretty' | 'minified'>('pretty')
    const [result, setResult] = useState<{ text: string; error: string | null }>({ text: '', error: null })
    const [treeData, setTreeData] = useState<unknown | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFormat = useCallback(() => {
        setError(null)
        const formatted = formatJson(inputText, mode)
        setResult(formatted)
        if (!formatted.error) {
            try {
                setTreeData(JSON.parse(inputText))
            } catch {
                setTreeData(null)
            }
        } else {
            setTreeData(null)
        }
    }, [inputText, mode])

    const handleValidation = useCallback(() => {
        const validation = validateJson(inputText)
        if (!validation.valid) {
            setError(validation.error ?? 'Invalid JSON')
        } else {
            setError(null)
        }
    }, [inputText])

    useEffect(() => {
        setTimeout(() => handleFormat(), 0)
    }, [inputText, mode, handleFormat])

    const handleDownload = () => {
        if (result.text) {
            const blob = new Blob([result.text], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = mode === 'pretty' ? 'formatted.json' : 'minified.json'
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const handleClear = () => {
        setInputText('')
        setResult({ text: '', error: null })
        setTreeData(null)
        setError(null)
    }

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Braces className="h-5 w-5" />
                            JSON Formatter
                        </CardTitle>
                        <CardDescription>
                            Format, validate, and visualize JSON. Runs locally — nothing is uploaded.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs defaultValue="editor" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="tree">Tree View</TabsTrigger>
                        <TabsTrigger value="minified">Minified</TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={mode === 'minified'}
                                    onCheckedChange={(checked) => setMode(checked ? 'minified' : 'pretty')}
                                />
                                Minify
                            </Label>
                        </div>

                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4" />
                            Input JSON
                        </Label>
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste JSON here…"
                            className="min-h-48 resize-y font-mono text-sm"
                        />

                        {error && (
                            <Alert variant="destructive" className="text-sm">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <CopyButton value={result.text} size="sm">
                                    Copy
                                </CopyButton>
                                {result.text && (
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </button>
                                )}
                                <button
                                    onClick={handleClear}
                                    disabled={!inputText && !result.text}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 disabled:opacity-50"
                                >
                                    Clear
                                </button>
                            </div>
                            <button
                                onClick={handleValidation}
                                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80"
                            >
                                Validate
                            </button>
                        </div>

                        <Label className="text-sm">Output</Label>
                        <Textarea
                            readOnly
                            value={result.text || result.error || ''}
                            placeholder="Formatted JSON will appear here…"
                            className="min-h-48 resize-y font-mono text-sm"
                        />
                    </TabsContent>

                    <TabsContent value="tree" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Collapsible tree view of the parsed JSON structure.
                        </p>
                        {treeData ? (
                            <TreeView data={treeData} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Braces className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Valid JSON will show a tree view here.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="minified" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Minified Output</Label>
                            <Textarea
                                readOnly
                                value={result.text}
                                placeholder="Minified JSON will appear here…"
                                className="min-h-48 resize-y font-mono text-sm"
                            />
                            {result.text && (
                                <div className="flex items-center gap-2">
                                    <CopyButton value={result.text} size="sm">
                                        Copy
                                    </CopyButton>
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}