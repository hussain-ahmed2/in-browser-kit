'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Table, Download, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { fileSelected, conversionStarted, conversionDone, conversionError, clearAll } from '../excelToPdfSlice'
import { convertExcelToPdf } from '../lib/excelToPdf'

const steps = [{ label: 'Upload' }, { label: 'Convert' }]

export function ExcelToPdfPage() {
  const dispatch = useAppDispatch()
  const { file, headers, rows, status, pdfBlobUrl } = useAppSelector((s) => s.excelToPdf)

  const handleFile = async (files: File[]) => {
    const f = files[0]
    if (!f) return
    try {
      const text = await f.text()
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      dispatch(fileSelected({
        file: f,
        csvText: text,
        headers: parsed.meta.fields ?? [],
        rows: parsed.data as Record<string, string>[],
      }))
    } catch {
      toast.error('Failed to parse file. Please upload a valid CSV file.')
    }
  }

  const handleConvert = async () => {
    if (!file) return
    dispatch(conversionStarted())
    try {
      const blob = await convertExcelToPdf(
        await file.text()
      )
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PDF created!')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert to PDF.')
    }
  }

  const handleDownload = () => {
    if (!pdfBlobUrl || !file) return
    const a = document.createElement('a')
    a.href = pdfBlobUrl
    a.download = file.name.replace(/\.[^/.]+$/, '') + '.pdf'
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table /> Excel to PDF
          </CardTitle>
          <CardDescription>
            Convert CSV/Excel files to formatted PDF tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              accept=".csv,.tsv,.txt"
              onFiles={handleFile}
              label="Click or drag and drop your CSV file here"
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-medium truncate line-clamp-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => dispatch(clearAll())}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Change File
                </Button>
              </div>

              {/* Table Preview */}
              {headers.length > 0 && (
                <div className="border border-border rounded-xl overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold border-b border-border">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          {headers.map((h) => (
                            <td key={h} className="px-3 py-1.5 text-muted-foreground">{String(row[h] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Showing 20 of {rows.length} rows
                    </p>
                  )}
                </div>
              )}

              {/* Convert */}
              {status === 'idle' && (
                <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-card shadow-sm text-center space-y-4">
                  <Button
                    size="lg"
                    onClick={handleConvert}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    <Table className="w-4 h-4 mr-2" /> Convert to PDF
                  </Button>
                </div>
              )}

              {status === 'converting' && (
                <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Converting...</h3>
                </div>
              )}

              {status === 'done' && pdfBlobUrl && (
                <div className="flex flex-col items-center space-y-4 animate-fade-in">
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">PDF Ready!</p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                  <iframe src={pdfBlobUrl} className="w-full h-[50vh] border border-border rounded-xl" title="PDF Preview" />
                </div>
              )}

              {status === 'error' && (
                <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                  <p className="text-destructive font-medium">Conversion failed. Try another file.</p>
                  <Button variant="outline" className="mt-4" onClick={() => dispatch(clearAll())}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
