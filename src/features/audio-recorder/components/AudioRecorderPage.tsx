'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Mic, Square, Download, Trash2, Play, Pause, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { startRecording, stopRecording, formatDuration, formatBytes } from '../lib/audioRecorder'
import { recordingStarted, recordingStopped, durationTicked, recordingDeleted, clearAll } from '../audioRecorderSlice'

const steps = [{ label: 'Record' }, { label: 'Review' }]

export function AudioRecorderPage() {
  const dispatch = useAppDispatch()
  const { isRecording, recordings, duration } = useAppSelector((s) => s.audioRecorder)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Duration tick
  useEffect(() => {
    if (!isRecording) return
    const id = setInterval(() => dispatch(durationTicked()), 1000)
    return () => clearInterval(id)
  }, [isRecording, dispatch])

  // Waveform animation
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    let running = true
    const analyserRef: { current: AnalyserNode | null } = { current: null }

    startRecording((analyser) => { analyserRef.current = analyser })
      .then((stream) => {
        dispatch(recordingStarted(stream))
        const analyser = analyserRef.current
        if (!analyser) return

        const bufLen = analyser.frequencyBinCount
        const dataArr = new Uint8Array(bufLen)

        const draw = () => {
          if (!running) return
          animRef.current = requestAnimationFrame(draw)
          analyser.getByteFrequencyData(dataArr)

          canvas.width = canvas.offsetWidth * 2
          canvas.height = canvas.offsetHeight * 2
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          const barW = (canvas.width / bufLen) * 2.5
          let x = 0
          for (let i = 0; i < bufLen; i++) {
            const barH = (dataArr[i] / 255) * canvas.height * 0.8
            const hue = (i / bufLen) * 60 + 200
            ctx.fillStyle = `hsl(${hue}, 80%, 55%)`
            ctx.fillRect(x, canvas.height - barH, barW, barH)
            x += barW + 1
          }
        }
        draw()
      })
      .catch(() => {
        toast.error('Microphone access denied')
      })

    return () => {
      running = false
      cancelAnimationFrame(animRef.current)
    }
  }, [isRecording, dispatch])

  const handleStop = async () => {
    try {
      const recording = await stopRecording()
      dispatch(recordingStopped(recording))
      toast.success('Recording saved!')
    } catch {
      toast.error('Failed to stop recording')
    }
  }

  const togglePlay = (rec: { id: string; url: string }) => {
    if (playingId === rec.id) {
      setPlayingId(null)
      return
    }
    const audio = new Audio(rec.url)
    audio.onended = () => setPlayingId(null)
    audio.play()
    setPlayingId(rec.id)
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={recordings.length > 0 ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic /> Audio Recorder</CardTitle>
          <CardDescription>Record audio from your microphone with live waveform visualization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Waveform / idle state */}
          <div className="rounded-xl border border-border overflow-hidden bg-secondary/20">
            <canvas ref={canvasRef} className="w-full h-32" style={{ display: isRecording ? 'block' : 'none' }} />
            {!isRecording && (
              <div className="flex items-center justify-center h-32">
                <div className="text-center space-y-2">
                  <Mic className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Click record to start</p>
                </div>
              </div>
            )}
          </div>

          {/* Timer + controls */}
          <div className="flex items-center justify-center gap-6">
            <span className="text-3xl font-mono font-bold tabular-nums">{formatDuration(duration)}</span>
          </div>
          <div className="flex gap-4">
            {!isRecording ? (
              <Button onClick={() => { /* start is triggered in useEffect */ }} className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                <Mic /> Record
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="flex-1">
                <Square /> Stop
              </Button>
            )}
          </div>

          {/* Recordings list */}
          {recordings.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Recordings ({recordings.length})</p>
              {recordings.map((rec) => (
                <div key={rec.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                  <Button size="icon" variant="ghost" onClick={() => togglePlay(rec)}>
                    {playingId === rec.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{formatDuration(rec.duration)}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(rec.size)}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { const a = document.createElement('a'); a.href = rec.url; a.download = `recording-${rec.id.slice(0, 8)}.webm`; a.click() }}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => dispatch(recordingDeleted(rec.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => dispatch(clearAll())} className="w-full"><RotateCcw /> Clear All</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
