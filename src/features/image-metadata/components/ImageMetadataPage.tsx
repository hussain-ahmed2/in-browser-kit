'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Upload,
    Loader2,
    AlertCircle,
    X,
    MapPin,
    ExternalLink,
    Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { extractImageMetadata, type ImageMetadata, type MetadataGroup } from '../lib/imageMetadata'

function MetadataGrid({ group }: { group: MetadataGroup }) {
    return (
        <div className="rounded-lg border border-border bg-muted/30">
            <div className="px-3 py-2 border-b border-border">
                <h3 className="text-sm font-semibold">{group.title}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50">
                {group.rows.map((row) => (
                    <div key={`${group.title}-${row.label}`} className="flex items-start gap-3 bg-card px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                {row.label}
                            </div>
                            <div className="text-sm font-medium break-all">{row.value}</div>
                        </div>
                        <CopyButton value={row.value} size="icon-xs" aria-label={`Copy ${row.label}`} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function Histogram({ imageUrl, width, height }: { imageUrl: string; width: number; height: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            const size = 256
            canvas.width = size
            canvas.height = size
            ctx.drawImage(img, 0, 0, size, size)
            const data = ctx.getImageData(0, 0, size, size).data

            const counts = {
                r: new Array(256).fill(0),
                g: new Array(256).fill(0),
                b: new Array(256).fill(0)
            }
            for (let i = 0; i < data.length; i += 4) {
                counts.r[data[i]]++
                counts.g[data[i + 1]]++
                counts.b[data[i + 2]]++
            }

            const max = Math.max(
                ...counts.r,
                ...counts.g,
                ...counts.b,
                1
            )

            ctx.clearRect(0, 0, size, size)
            const barWidth = size / 256
            const drawChannel = (channel: number[], color: string) => {
                ctx.fillStyle = color
                for (let i = 0; i < 256; i++) {
                    const h = (channel[i] / max) * size
                    ctx.fillRect(i * barWidth, size - h, Math.max(barWidth, 1), h)
                }
            }
            drawChannel(counts.r, 'rgba(239,68,68,0.85)')
            drawChannel(counts.g, 'rgba(34,197,94,0.85)')
            drawChannel(counts.b, 'rgba(59,130,246,0.85)')
        }
        img.src = imageUrl
    }, [imageUrl])

    return (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold mb-1">RGB Histogram</h3>
            <p className="text-xs text-muted-foreground mb-3">
                {width} × {height}px sampled to 256×256
            </p>
            <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-md bg-card ring-1 ring-border"
                aria-label="RGB histogram of the image"
            />
        </div>
    )
}

export function ImageMetadataPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(async (selected: File) => {
        setError(null)
        setMetadata(null)
        setPreviewUrl(null)

        if (!selected.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG, WebP, TIFF, HEIC…)')
            return
        }

        setFile(selected)
        setPreviewUrl(URL.createObjectURL(selected))
        setIsLoading(true)
        try {
            const meta = await extractImageMetadata(selected)
            setMetadata(meta)
        } catch {
            setError('Failed to read image metadata. The file may be unsupported or corrupted.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selected = e.target.files?.[0]
            if (selected) handleFile(selected)
            if (inputRef.current) inputRef.current.value = ''
        },
        [handleFile]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setDragActive(false)
            const dropped = e.dataTransfer.files[0]
            if (dropped) handleFile(dropped)
        },
        [handleFile]
    )

    const clearAll = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setFile(null)
        setPreviewUrl(null)
        setMetadata(null)
        setError(null)
    }, [previewUrl])

    const hasGps = metadata?.gps != null
    const osmUrl = hasGps
        ? `https://www.openstreetmap.org/?mlat=${metadata.gps!.latitude}&mlon=${metadata.gps!.longitude}#map=14/${metadata.gps!.latitude}/${metadata.gps!.longitude}`
        : null

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle>Image Metadata</CardTitle>
                <CardDescription>
                    Inspect EXIF, IPTC, ICC, and GPS data embedded in your images. Runs
                    locally — nothing is uploaded.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!file ? (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        className={cn(
                            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors cursor-pointer',
                            dragActive ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/50'
                        )}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleInputChange}
                        />
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Drop an image here or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, TIFF, HEIC</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-4 min-w-0">
                                {previewUrl && (
                                    <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-secondary ring-1 ring-border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={previewUrl}
                                            alt={`Preview of ${file.name}`}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-medium truncate" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {metadata?.sizeLabel ?? (file.size / 1024 / 1024).toFixed(2) + ' MB'}
                                        {metadata?.width ? ` • ${metadata.width} × ${metadata.height} px` : ''}
                                        {metadata?.type ? ` • ${metadata.type.split('/')[1]?.toUpperCase() ?? ''}` : ''}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive shrink-0">
                                <X className="size-4" />
                                <span className="hidden sm:inline">Change</span>
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Reading metadata…
                            </div>
                        )}

                        {metadata && !isLoading && (
                            <>
                                {hasGps && osmUrl && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin className="h-5 w-5 text-brand mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    GPS Coordinates Detected
                                                </div>
                                                <div className="text-sm text-muted-foreground tabular-nums">
                                                    {metadata.gps!.latitude.toFixed(6)}°, {metadata.gps!.longitude.toFixed(6)}°
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={osmUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open in OpenStreetMap
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {previewUrl && metadata.width && metadata.height && (
                                        <Histogram
                                            imageUrl={previewUrl}
                                            width={metadata.width}
                                            height={metadata.height}
                                        />
                                    )}
                                    <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={previewUrl!}
                                            alt={file.name}
                                            className="max-h-52 rounded-md object-contain"
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Info className="h-3.5 w-3.5" />
                                            {metadata.groups.reduce((acc, g) => acc + g.rows.length, 0)} metadata
                                            fields found
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {metadata.groups.map((group) => (
                                        <MetadataGrid key={group.title} group={group} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}