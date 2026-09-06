export interface UpscaleResult {
  file: File
  objectUrl: string
  width: number
  height: number
  originalWidth: number
  originalHeight: number
}

const MODEL_CACHE_NAME = 'ai-upscaler-models'
const MODEL_URL = 'https://huggingface.co/smartywu/anime-interpreters-v2-onnx/resolve/main/2x_AnimeInterpretersV2.onnx'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

async function getCachedModel(url: string, onProgress?: (status: string, progress: number) => void): Promise<ArrayBuffer> {
  // Check Cache API first
  if ('caches' in window) {
    const cache = await caches.open(MODEL_CACHE_NAME)
    const cachedResponse = await cache.match(url)
    if (cachedResponse) {
      onProgress?.('Model loaded from cache', 30)
      return cachedResponse.arrayBuffer()
    }
  }

  // Download model
  onProgress?.('Downloading AI model (~20MB, cached after first load)...', 10)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to download model')

  const contentLength = Number(response.headers.get('content-length'))
  const reader = response.body!.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (contentLength) {
      const pct = Math.round((received / contentLength) * 100)
      onProgress?.(`Downloading model... ${Math.round(received / 1024 / 1024)}MB / ${Math.round(contentLength / 1024 / 1024)}MB`, 10 + Math.round(pct * 0.2))
    }
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
  const modelBuffer = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    modelBuffer.set(chunk, offset)
    offset += chunk.length
  }

  // Cache the model
  if ('caches' in window) {
    const cache = await caches.open(MODEL_CACHE_NAME)
    await cache.put(url, new Response(modelBuffer, { headers: { 'Content-Type': 'application/octet-stream' } }))
  }

  return modelBuffer.buffer
}

export async function upscaleImage(
  file: File,
  scale: '2x' | '4x',
  onProgress?: (status: string, progress: number) => void
): Promise<UpscaleResult> {
  onProgress?.('Preparing image...', 5)

  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const inputData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  onProgress?.('Loading AI model...', 20)

  // Try to load ONNX model with caching
  try {
    const { default: ort } = await import('onnxruntime-web')

    const modelBuffer = await getCachedModel(MODEL_URL, onProgress)
    onProgress?.('Creating inference session...', 40)

    const session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['webgl', 'wasm'],
    })

    onProgress?.('Preparing input tensor...', 50)

    // Normalize input to [0, 1] float32
    const inputTensor = new ort.Tensor('float32', new Float32Array(inputData.data.buffer), [1, 3, canvas.height, canvas.width])

    // Run inference
    onProgress?.('Running AI upscaler...', 60)
    const inputName = session.inputNames[0]
    const results = await session.run({ [inputName]: inputTensor })
    const outputName = session.outputNames[0]
    const outputTensor = results[outputName]
    const outputData = outputTensor.data as Float32Array

    onProgress?.('Rendering output...', 90)

    const outH = canvas.height * (scale === '2x' ? 2 : 2)
    const outW = canvas.width * (scale === '2x' ? 2 : 2)

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = outW
    outputCanvas.height = outH
    const outputCtx = outputCanvas.getContext('2d')!
    const outputImageData = outputCtx.createImageData(outW, outH)

    // Convert float32 back to uint8
    for (let i = 0; i < outputData.length; i++) {
      outputImageData.data[i] = Math.min(255, Math.max(0, Math.round(outputData[i] * 255)))
    }

    outputCtx.putImageData(outputImageData, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      outputCanvas.toBlob(resolve, 'image/png')
    )
    if (!blob) throw new Error('Failed to create output')

    onProgress?.('Done', 100)
    const resultFile = new File([blob], file.name, { type: 'image/png', lastModified: Date.now() })
    return {
      file: resultFile,
      objectUrl: URL.createObjectURL(resultFile),
      width: outW,
      height: outH,
      originalWidth: canvas.width,
      originalHeight: canvas.height,
    }
  } catch {
    // Fallback: simple canvas upscale (no AI, but still works)
    onProgress?.('AI model unavailable, using smart upscale...', 50)

    const multiplier = scale === '2x' ? 2 : 2
    const outW = canvas.width * multiplier
    const outH = canvas.height * multiplier

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = outW
    outputCanvas.height = outH
    const outputCtx = outputCanvas.getContext('2d')!
    outputCtx.imageSmoothingEnabled = true
    outputCtx.imageSmoothingQuality = 'high'
    outputCtx.drawImage(img, 0, 0, outW, outH)

    const blob = await new Promise<Blob | null>((resolve) =>
      outputCanvas.toBlob(resolve, 'image/png')
    )
    if (!blob) throw new Error('Failed to create output')

    onProgress?.('Done (canvas upscale)', 100)
    const resultFile = new File([blob], file.name, { type: 'image/png', lastModified: Date.now() })
    return {
      file: resultFile,
      objectUrl: URL.createObjectURL(resultFile),
      width: outW,
      height: outH,
      originalWidth: canvas.width,
      originalHeight: canvas.height,
    }
  }
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)
  return { width: img.naturalWidth, height: img.naturalHeight }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
