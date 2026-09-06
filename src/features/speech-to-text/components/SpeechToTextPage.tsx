'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Mic, Square, Download, Copy, RotateCcw, Loader2 } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  languageSet,
  listeningStarted,
  listeningStopped,
  transcriptUpdated,
  errorOccurred,
  clearAll,
} from '../speechToTextSlice'
import { isSpeechRecognitionSupported, createRecognition, LANGUAGES } from '../lib/speechToText'

export function SpeechToTextPage() {
  const dispatch = useAppDispatch()
  const { language, status, transcript, interimTranscript } = useAppSelector((s) => s.speechToText)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const handleStart = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Speech Recognition is not supported in this browser.')
      return
    }

    const recognition = createRecognition(language)
    if (!recognition) {
      toast.error('Could not initialize Speech Recognition.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalTranscript) {
        dispatch(transcriptUpdated({
          transcript: transcript + finalTranscript,
          interim,
        }))
      } else if (interim) {
        dispatch(transcriptUpdated({
          transcript,
          interim: interim,
        }))
      }
    }

    recognition.onerror = () => {
      dispatch(errorOccurred())
      toast.error('Speech recognition error occurred.')
    }

    recognition.onend = () => {
      dispatch(listeningStopped())
    }

    recognitionRef.current = recognition
    recognition.start()
    dispatch(listeningStarted())
    toast.success('Listening... Speak now!')
  }, [language, transcript, dispatch])

  const handleStop = useCallback(() => {
    recognitionRef.current?.stop()
    dispatch(listeningStopped())
    toast.success('Stopped listening.')
  }, [dispatch])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy.')
    }
  }

  const handleDownload = () => {
    if (!transcript) return
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcription.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic /> Speech to Text
        </CardTitle>
        <CardDescription>
          Transcribe spoken words to text in real-time using Web Speech API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSpeechRecognitionSupported() && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
            <p className="text-destructive font-medium">
              Speech Recognition is not supported in this browser. Please use Chrome or Edge.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="space-y-2 flex-1">
            <Label className="text-sm font-medium">Language</Label>
            <Select value={language} onValueChange={(v) => dispatch(languageSet(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {status === 'listening' ? (
              <Button onClick={handleStop} variant="destructive" size="lg">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={!isSpeechRecognitionSupported()}
                size="lg"
                className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                <Mic className="w-4 h-4 mr-2" /> Start Listening
              </Button>
            )}
            <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!transcript}>
              <RotateCcw /> Clear
            </Button>
          </div>
        </div>

        {/* Listening indicator */}
        {status === 'listening' && (
          <div className="flex items-center justify-center gap-2 p-4 bg-brand/10 border border-brand/30 rounded-xl animate-fade-in">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium text-brand">Listening... Speak now!</span>
          </div>
        )}

        {/* Transcript */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Transcript
            </Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!transcript}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!transcript}>
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
          </div>
          <Textarea
            value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
            onChange={(e) => dispatch(transcriptUpdated({ transcript: e.target.value, interim: '' }))}
            placeholder="Transcribed text will appear here..."
            className="min-h-[300px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  )
}
