export interface CaptureResult {
  dataUrl: string
  width: number
  height: number
  timestamp: number
}

export async function captureScreen(): Promise<{ stream: MediaStream; track: MediaStreamTrack }> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  })
  const track = stream.getVideoTracks()[0]
  return { stream, track }
}

export async function captureFrame(stream: MediaStream): Promise<CaptureResult> {
  const track = stream.getVideoTracks()[0]
  // ImageCapture may not be available in all browsers
  const IC = typeof ImageCapture !== 'undefined' ? ImageCapture : null
  if (!IC) throw new Error('ImageCapture API not supported in this browser')
  const imageCapture = new IC(track) as unknown as { grabFrame(): Promise<ImageBitmap> }
  const bitmap = await imageCapture.grabFrame()
  
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: bitmap.width, height: bitmap.height,
    timestamp: Date.now(),
  }
}

export function stopStream(stream: MediaStream) {
  stream.getTracks().forEach(t => t.stop())
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
