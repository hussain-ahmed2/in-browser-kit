'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, EyeOff, Eye, Copy, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { FileDropzone } from '@/components/FileDropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/form/input-field'
import { encodeMessage, decodeMessage, formatBytes } from '../lib/imageSteganography'
import { steganographySchema, type SteganographyFormValues } from '../types'
import { fileSelected, encodeResultSet, decodeResultSet, progressSet, processingSet, clearAll } from '../steganographySlice'

const steps = [{ label: 'Upload' }, { label: 'Process' }, { label: 'Result' }]

export function ImageSteganographyPage() {
  const dispatch = useAppDispatch()
  const { item, encodeResult, decodeResult, progress, isProcessing } = useAppSelector((s) => s.steganography)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const form = useForm<SteganographyFormValues>({
    resolver: zodResolver(steganographySchema),
    defaultValues: { mode: 'encode', secretMessage: '' },
  })

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    dispatch(fileSelected({ file: selected, previewUrl }))
  }, [dispatch])

  const handleEncode = async (values: SteganographyFormValues) => {
    if (!item) return
    const message = values.secretMessage ?? ''
    if (!message.trim()) {
      toast.error('Please enter a secret message')
      return
    }
    dispatch(processingSet(true))
    try {
      const res = await encodeMessage(item.file, message, (p) => dispatch(progressSet(p)))
      dispatch(encodeResultSet(res))
      toast.success('Message hidden in image!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error encoding message')
      dispatch(processingSet(false))
    }
  }

  const handleDecode = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const res = await decodeMessage(item.file, (p) => dispatch(progressSet(p)))
      dispatch(decodeResultSet(res))
      if (res.success) {
        toast.success('Message decoded successfully!')
      } else {
        toast.warning('No hidden message found in this image')
      }
    } catch {
      toast.error('Error decoding message')
      dispatch(processingSet(false))
    }
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Message copied to clipboard!')
  }

  const hasResult = encodeResult || decodeResult
  const currentStep = hasResult ? 2 : item ? 1 : 0

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><EyeOff /> Steganography</CardTitle>
          <CardDescription>Hide secret messages inside images using LSB encoding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 rounded-lg bg-secondary/50 border border-border">
            <button
              onClick={() => { setMode('encode'); dispatch(clearAll()) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'encode' ? 'bg-brand/10 text-brand ring-1 ring-brand/30' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <EyeOff className="w-4 h-4" /> Encode
            </button>
            <button
              onClick={() => { setMode('decode'); dispatch(clearAll()) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'decode' ? 'bg-brand/10 text-brand ring-1 ring-brand/30' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Eye className="w-4 h-4" /> Decode
            </button>
          </div>

          {!item ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
              label={`Click or drag to ${mode === 'encode' ? 'upload an image to hide a message in' : 'upload a stego image to decode'}`}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodeResult?.objectUrl ?? item.previewUrl} alt="Preview" className="w-full rounded-lg border border-border max-h-64 object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => dispatch(clearAll())}><RotateCcw /></Button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/80 text-xs text-muted-foreground">
                  {formatBytes(item.file.size)}
                </div>
              </div>

              {/* Progress bar */}
              {isProcessing && (
                <div className="space-y-2 animate-fade-in">
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-brand to-glow transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{mode === 'encode' ? 'Encoding' : 'Decoding'}... {Math.round(progress)}%</p>
                </div>
              )}

              {mode === 'encode' ? (
                encodeResult ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">Message hidden successfully! ({encodeResult.messageLength} chars)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">Result Size</p>
                        <p className="font-medium">{formatBytes(encodeResult.file.size)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">Dimensions</p>
                        <p className="font-medium">{encodeResult.width}×{encodeResult.height}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={() => { const a = document.createElement('a'); a.href = encodeResult.objectUrl; a.download = encodeResult.file.name; a.click() }} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"><Download /> Download Stego Image</Button>
                      <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                    </div>
                  </div>
                ) : (
                  <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleEncode)} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                      <InputField name="secretMessage" label="Secret Message" placeholder="Enter the message to hide..." />
                      <Button type="submit" disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                        {isProcessing ? <><Loader2 className="animate-spin" /> Encoding...</> : <><EyeOff /> Hide Message</>}
                      </Button>
                    </form>
                  </FormProvider>
                )
              ) : (
                decodeResult ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className={`p-3 rounded-lg border flex items-center gap-2 ${decodeResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                      {decodeResult.success ? (
                        <><Check className="w-4 h-4 text-green-500" /><span className="text-sm text-green-500">Message found!</span></>
                      ) : (
                        <><X className="w-4 h-4 text-yellow-500" /><span className="text-sm text-yellow-500">No hidden message detected in this image</span></>
                      )}
                    </div>
                    {decodeResult.success && decodeResult.message && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Decoded Message:</p>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border font-mono text-sm break-all">
                          {decodeResult.message}
                        </div>
                        <Button variant="outline" onClick={() => handleCopyMessage(decodeResult.message)} className="w-full"><Copy /> Copy Message</Button>
                      </div>
                    )}
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Start Over</Button>
                  </div>
                ) : (
                  <Button onClick={handleDecode} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                    {isProcessing ? <><Loader2 className="animate-spin" /> Decoding...</> : <><Eye /> Decode Message</>}
                  </Button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
