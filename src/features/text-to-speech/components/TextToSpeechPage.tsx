'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Volume2, Play, Square, RotateCcw } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
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
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  textSet,
  voiceSet,
  rateSet,
  pitchSet,
  speakingStarted,
  speakingStopped,
  clearAll,
} from '../textToSpeechSlice'
import { getAvailableVoices, speak, stopSpeaking, type SpeechVoice } from '../lib/textToSpeech'

export function TextToSpeechPage() {
  const dispatch = useAppDispatch()
  const { text, voice, rate, pitch, status } = useAppSelector((s) => s.textToSpeech)
  const [voices, setVoices] = useState<SpeechVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      setVoices(getAvailableVoices())
    }
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const handleSpeak = useCallback(() => {
    if (!text.trim()) {
      toast.error('Please enter text to speak')
      return
    }
    dispatch(speakingStarted())
    speak(text, {
      voice,
      rate,
      pitch,
      onEnd: () => dispatch(speakingStopped()),
      onError: () => {
        dispatch(speakingStopped())
        toast.error('Speech synthesis failed')
      },
    })
  }, [text, voice, rate, pitch, dispatch])

  const handleStop = useCallback(() => {
    stopSpeaking()
    dispatch(speakingStopped())
  }, [dispatch])

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 /> Text to Speech
        </CardTitle>
        <CardDescription>
          Convert text to natural-sounding speech using Web Speech API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Text
          </Label>
          <Textarea
            value={text}
            onChange={(e) => dispatch(textSet(e.target.value))}
            placeholder="Type or paste text to convert to speech..."
            className="min-h-[200px] resize-y"
          />
        </div>

        {/* Voice & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Voice</Label>
            <Select value={voice} onValueChange={(v) => dispatch(voiceSet(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Default Voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Speed</Label>
                <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={([v]) => dispatch(rateSet(v))}
                min={0.1}
                max={3}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Pitch</Label>
                <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={([v]) => dispatch(pitchSet(v))}
                min={0}
                max={2}
                step={0.1}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {status === 'speaking' ? (
            <Button
              onClick={handleStop}
              variant="destructive"
              size="lg"
            >
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          ) : (
            <Button
              onClick={handleSpeak}
              disabled={!text.trim()}
              size="lg"
              className="bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
            >
              <Play className="w-4 h-4 mr-2" /> Speak
            </Button>
          )}
          <Button variant="outline" onClick={() => dispatch(clearAll())} disabled={!text}>
            <RotateCcw /> Clear
          </Button>
        </div>

        {status === 'speaking' && (
          <div className="p-4 bg-brand/10 border border-brand/30 rounded-xl text-center animate-fade-in">
            <p className="text-brand font-medium">Speaking... 🔊</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
