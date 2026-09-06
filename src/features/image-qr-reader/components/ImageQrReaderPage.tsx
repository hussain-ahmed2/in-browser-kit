'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, RotateCcw, QrCode, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { decodeQR } from '../lib/imageQrReader'
import { fileSelected, decodedSet, errorSet, processingSet, clearAll } from '../qrReaderSlice'

const steps = [{ label: 'Upload' }, { label: 'Result' }]

export function ImageQrReaderPage() {
  const dispatch = useAppDispatch()
  const { item, decodedData, isProcessing } = useAppSelector((s) => s.imageQrReader)
  const [copied, setCopied] = useState(false)

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    dispatch(fileSelected({ file: selected, previewUrl }))
    dispatch(processingSet(true))
    try {
      const decoded = await decodeQR(selected)
      dispatch(decodedSet(decoded.data))
      toast.success('QR code decoded!')
    } catch {
      toast.error('No QR code found in image')
      dispatch(processingSet(false))
    }
  }, [dispatch])

  const handleCopy = async () => {
    if (!decodedData) return
    await navigator.clipboard.writeText(decodedData)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={item ? (decodedData ? 1 : 1) : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode /> QR Code Reader</CardTitle>
          <CardDescription>Upload an image to scan and decode QR codes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin" /> Scanning for QR codes...
                </div>
              )}

              {decodedData ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Decoded Text</p>
                    <p className="font-mono text-sm break-all">{decodedData}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleCopy} className="flex-1">
                      {copied ? <><Check /> Copied!</> : <><Copy /> Copy Text</>}
                    </Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Scan Another</Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
