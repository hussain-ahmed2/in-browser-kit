'use client'

import { useState, useCallback } from 'react'

const MAGNIFIER_SIZE = 140

export function useMagnifier() {
  const [zoom, setZoom] = useState(6)

  const draw = useCallback(
    (
      imgDims: { width: number; height: number },
      imageData: ImageData | null,
      canvas: HTMLCanvasElement | null,
      px: number,
      py: number
    ) => {
      if (!imageData || !canvas) return

      const ctx = canvas.getContext('2d')!
      const size = MAGNIFIER_SIZE
      const radius = size / 2
      const srcW = imageData.width
      const srcH = imageData.height
      const sampleR = Math.floor(radius / zoom)
      const srcX = px - sampleR
      const srcY = py - sampleR

      ctx.clearRect(0, 0, size, size)
      ctx.save()
      ctx.beginPath()
      ctx.arc(radius, radius, radius, 0, Math.PI * 2)
      ctx.clip()

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = sampleR * 2
      tempCanvas.height = sampleR * 2
      const tempCtx = tempCanvas.getContext('2d')!
      const imgData = tempCtx.createImageData(sampleR * 2, sampleR * 2)

      for (let ty = 0; ty < sampleR * 2; ty++) {
        for (let tx = 0; tx < sampleR * 2; tx++) {
          const sx = srcX + tx
          const sy = srcY + ty
          if (sx >= 0 && sx < srcW && sy >= 0 && sy < srcH) {
            const srcIdx = (sy * srcW + sx) * 4
            const dstIdx = (ty * sampleR * 2 + tx) * 4
            imgData.data[dstIdx] = imageData.data[srcIdx]
            imgData.data[dstIdx + 1] = imageData.data[srcIdx + 1]
            imgData.data[dstIdx + 2] = imageData.data[srcIdx + 2]
            imgData.data[dstIdx + 3] = imageData.data[srcIdx + 3]
          }
        }
      }
      tempCtx.putImageData(imgData, 0, 0)

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tempCanvas, 0, 0, size, size)

      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(radius, size)
      ctx.moveTo(0, radius)
      ctx.lineTo(size, radius)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    },
    [zoom]
  )

  const clear = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE)
    }
  }, [])

  return { zoom, setZoom, draw, clear, size: MAGNIFIER_SIZE }
}
