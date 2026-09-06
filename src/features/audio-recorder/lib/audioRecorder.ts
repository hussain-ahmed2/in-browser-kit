export interface Recording {
  id: string
  blob: Blob
  url: string
  duration: number
  size: number
  timestamp: number
}

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let startTime = 0

export async function startRecording(onDataAvailable?: (analyser: AnalyserNode) => void): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
  audioChunks = []
  startTime = Date.now()
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }
  
  mediaRecorder.start(100) // collect data every 100ms
  
  // Set up analyser for waveform visualization
  const audioCtx = new AudioContext()
  const source = audioCtx.createMediaStreamSource(stream)
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 256
  source.connect(analyser)
  onDataAvailable?.(analyser)
  
  return stream
}

export function stopRecording(): Promise<Recording> {
  return new Promise((resolve) => {
    if (!mediaRecorder) throw new Error('Not recording')
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      const duration = (Date.now() - startTime) / 1000
      resolve({
        id: crypto.randomUUID(),
        blob, url: URL.createObjectURL(blob),
        duration, size: blob.size, timestamp: Date.now(),
      })
    }
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(t => t.stop())
  })
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
