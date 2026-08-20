'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Download, FileText, X, Loader2, Settings, Image as ImageIcon } from 'lucide-react'
import {
  convertPdfToImages,
  getPdfPageCount,
  parsePageRange,
  getPageRangeString,
  FORMAT_OPTIONS,
  DPI_OPTIONS,
  QUALITY_OPTIONS,
} from '../lib/pdfToImages'

interface PageImageData {
  pageNumber: number
  blob: Blob
  width: number
  height: number
  url: string
}

export function PdfToImagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pageRange, setPageRange] = useState('')
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [dpi, setDpi] = useState(150)
  const [quality, setQuality] = useState(0.85)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<PageImageData[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (file) {
      setTimeout(() => setPageRange(''), 0)
      let cancelled = false
      getPdfPageCount(file)
        .then((count) => {
          if (!cancelled) setTotalPages(count)
        })
        .catch(() => {
          if (!cancelled) {
            setTotalPages(0)
            setError('Failed to read PDF. The file may be corrupted or encrypted.')
          }
        })
      return () => {
        cancelled = true
      }
    }
  }, [file])

  useEffect(() => {
    if (totalPages > 0 && !pageRange) {
      const allPages = Array.from({ length: totalPages }, (_, i) => i + 1)
      setTimeout(() => {
        setSelectedPages(allPages)
        setPageRange(getPageRangeString(allPages))
      }, 0)
    } else if (pageRange) {
      setTimeout(() => {
        setSelectedPages(parsePageRange(pageRange, totalPages))
      }, 0)
    }
  }, [pageRange, totalPages])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
      setResults([])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setError(null)
      setResults([])
    }
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
    setTotalPages(0)
    setPageRange('')
    setSelectedPages([])
    setResults([])
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleConvert = useCallback(async () => {
    if (!file || selectedPages.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResults([])

    try {
      const result = await convertPdfToImages(file, {
        format,
        quality,
        dpi,
        pages: selectedPages,
      })

      const images: PageImageData[] = []
      for (let i = 0; i < result.images.length; i++) {
        const img = result.images[i]
        const url = URL.createObjectURL(img.blob)
        images.push({
          pageNumber: img.pageNumber,
          blob: img.blob,
          width: img.width,
          height: img.height,
          url,
        })
        setProgress(Math.round(((i + 1) / result.images.length) * 100))
      }

      setResults(images)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert PDF')
    } finally {
      setIsProcessing(false)
    }
  }, [file, format, dpi, quality, selectedPages])

  const handleDownloadAll = useCallback(() => {
    if (!results.length) return

    results.forEach((img) => {
      const a = document.createElement('a')
      a.href = img.url
      a.download = `${file?.name.replace(/\.pdf$/i, '')}-page-${img.pageNumber}.${format}`
      a.click()
    })
  }, [results, format, file])

  const handleDownloadZip = useCallback(async () => {
    if (!results.length) return

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      results.forEach((img) => {
        zip.file(`${file?.name.replace(/\.pdf$/i, '')}-page-${img.pageNumber}.${format}`, img.blob)
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file?.name.replace(/\.pdf$/i, '')}-images.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to create ZIP. Try downloading individually.')
    }
  }, [results, format, file])

  const handleDownloadSingle = useCallback((url: string, pageNumber: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.pdf$/i, '')}-page-${pageNumber}.${format}`
    a.click()
  }, [format, file])

  const clearResults = useCallback(() => {
    results.forEach(img => URL.revokeObjectURL(img.url))
    setResults([])
    setProgress(0)
  }, [results])

  if (!file) {
    return (
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            PDF to Images
          </CardTitle>
          <CardDescription>
            Convert PDF pages to images (PNG, JPEG, WebP). Runs locally — nothing is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl hover:border-brand/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Choose PDF file"
            />
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <p className="text-lg font-medium">Drop a PDF file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 100MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          PDF to Images
        </CardTitle>
        <CardDescription>
          Convert PDF pages to images. {totalPages} page{totalPages !== 1 ? 's' : ''} detected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Info & Remove */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {totalPages} page{totalPages !== 1 ? 's' : ''} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>

        {/* Page Range Input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Pages to Convert
          </Label>
          <div className="relative">
            <Input
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder={totalPages > 0 ? `e.g., 1-3, 5, 7-10 (1-${totalPages})` : 'Select a PDF first'}
              disabled={totalPages === 0}
              className="font-mono text-sm"
            />
            {pageRange && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPageRange(getPageRangeString(Array.from({ length: totalPages }, (_, i) => i + 1)))
                  }}
                  className="text-xs"
                >
                  All
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedPages.length > 0
              ? `${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''} selected: ${getPageRangeString(selectedPages)}`
              : 'No pages selected'}
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat as (value: string) => void}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>DPI</Label>
            <Select value={String(dpi)} onValueChange={(v) => setDpi(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select DPI" />
              </SelectTrigger>
              <SelectContent>
                {DPI_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quality</Label>
            <Select value={String(quality)} onValueChange={(v) => setQuality(parseFloat(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={isProcessing || !file || selectedPages.length === 0}
          className="w-full py-3 text-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" />
              Converting... {progress}%
            </>
          ) : (
            <>
              <ImageIcon />
              Convert {selectedPages.length} Page{selectedPages.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {isProcessing && progress > 0 && (
          <Progress value={progress} className="h-2" />
        )}

        {error && (
          <Alert variant="destructive" className="text-sm">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Results ({results.length} image{results.length !== 1 ? 's' : ''})</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadAll}
                  className="text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download All
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadZip}
                  className="text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download ZIP
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResults}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((img) => (
                <div key={img.pageNumber} className="group relative bg-muted/50 rounded-lg overflow-hidden border border-border">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Page ${img.pageNumber}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Page {img.pageNumber}</span>
                      <span className="text-muted-foreground text-xs">
                        {img.width} × {img.height}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadSingle(img.url, img.pageNumber)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          All processing happens in your browser. No files are uploaded.
        </p>
      </CardContent>
    </Card>
  )
}