'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Table, Download, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { csvSet, pageSizeSet, conversionStarted, conversionDone, conversionError, clearAll } from '../csvToPdfSlice'
import { convertCsvToPdf } from '../lib/csvToPdf'

const steps = [{ label: 'Input' }, { label: 'Convert' }]

export function CsvToPdfPage() {
  const dispatch = useAppDispatch()
  const { csv, pageSize, status, pdfBlobUrl } = useAppSelector((s) => s.csvToPdf)

  const parsed = useMemo(() => {
    if (!csv.trim()) return { headers: [], rows: [] as Record<string, string>[] }
    const result = Papa.parse(csv, { header: true, skipEmptyLines: true })
    return { headers: result.meta.fields ?? [], rows: result.data as Record<string, string>[] }
  }, [csv])

  const handleConvert = async () => {
    if (!csv.trim()) {
      toast.error('Please enter CSV data')
      return
    }
    dispatch(conversionStarted())
    try {
      const blob = await convertCsvToPdf(csv, pageSize)
      const url = URL.createObjectURL(blob)
      dispatch(conversionDone(url))
      toast.success('PDF created!')
    } catch (err) {
      console.error(err)
      dispatch(conversionError())
      toast.error('Failed to convert CSV to PDF.')
    }
  }

  const handleDownload = () => {
    if (!pdfBlobUrl) return
    const a = document.createElement('a')
    a.href = pdfBlobUrl
    a.download = 'converted.pdf'
    a.click()
    toast.success('Downloaded!')
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={status === 'done' ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table /> CSV to PDF
          </CardTitle>
          <CardDescription>
            Convert CSV data into a formatted PDF table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Page Size</Label>
              <Select value={pageSize} onValueChange={(v) => dispatch(pageSizeSet(v as 'a4' | 'letter'))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConvert}
                disabled={!csv.trim() || status === 'converting'}
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                {status === 'converting' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
                ) : (
                  <><Table className="w-4 h-4 mr-2" /> Convert to PDF</>
                )}
              </Button>
              <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!csv}>
                <RotateCcw /> Clear
              </Button>
            </div>
          </div>

          {/* Table Preview */}
          {parsed.headers.length > 0 && (
            <div className="border border-border rounded-xl overflow-auto max-h-64 animate-fade-in">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {parsed.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {parsed.headers.map((h) => (
                        <td key={h} className="px-3 py-1.5 text-muted-foreground">{String(row[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 20 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Showing 20 of {parsed.rows.length} rows
                </p>
              )}
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              CSV Input
            </Label>
            <Textarea
              value={csv}
              onChange={(e) => dispatch(csvSet(e.target.value))}
              placeholder="Name,Age,City&#10;Alice,30,NYC&#10;Bob,25,LA"
              className="min-h-[200px] resize-y font-mono text-sm"
            />
          </div>

          {/* Download */}
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
        </CardContent>
      </Card>
    </>
  )
}
