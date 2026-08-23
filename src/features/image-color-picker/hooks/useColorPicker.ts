'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { getColorAtPixel, type ColorInfo } from '../lib/imageColorPicker'
import { extractPalette, type ExtractedColor } from '../lib/paletteExtractor'
import type { PaletteColor } from '../lib/colorExport'

export function useColorPicker() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [color, setColor] = useState<ColorInfo | null>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [displayPos, setDisplayPos] = useState<{ x: number; y: number } | null>(null)
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null)
  const [history, setHistory] = useState<ColorInfo[]>([])
  const [palette, setPalette] = useState<PaletteColor[]>([])
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const imageDataRef = useRef<ImageData | null>(null)

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      setFile(selected)
      setColor(null)
      setCursorPos(null)
      setDisplayPos(null)
      setImgDims(null)
      setHistory([])
      setPalette([])
      setExtractedColors([])
      imageDataRef.current = null
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(selected))
    },
    [previewUrl]
  )

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImgDims({ width: img.naturalWidth, height: img.naturalHeight })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  }, [])

  const handleClear = useCallback(() => {
    setFile(null)
    setColor(null)
    setCursorPos(null)
    setDisplayPos(null)
    setImgDims(null)
    setHistory([])
    setPalette([])
    setExtractedColors([])
    imageDataRef.current = null
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }, [previewUrl])

  const pickColor = useCallback(
    async (e: React.MouseEvent<HTMLImageElement>) => {
      if (!file || !imgDims) return
      const img = e.currentTarget
      const rect = img.getBoundingClientRect()
      const scaleX = imgDims.width / rect.width
      const scaleY = imgDims.height / rect.height
      const px = Math.floor((e.clientX - rect.left) * scaleX)
      const py = Math.floor((e.clientY - rect.top) * scaleY)

      try {
        const picked = await getColorAtPixel(file, px, py)
        setColor(picked)
        setCursorPos({ x: px, y: py })
        setHistory((prev) => {
          const next = [picked, ...prev.filter((c) => c.hex !== picked.hex)]
          return next.slice(0, 30)
        })
      } catch {
        toast.error('Failed to pick color')
      }
    },
    [file, imgDims]
  )

  const handleExtractPalette = useCallback(() => {
    if (!imageDataRef.current) {
      toast.error('Image not loaded yet')
      return
    }
    const colors = extractPalette(imageDataRef.current, 8)
    setExtractedColors(colors)
    toast.success(`Extracted ${colors.length} dominant colors`)
  }, [])

  const addToPalette = useCallback((hex: string) => {
    setPalette((prev) => {
      if (prev.some((c) => c.hex === hex)) return prev
      return [...prev, { hex }]
    })
    toast.success('Added to palette')
  }, [])

  const removeFromPalette = useCallback((hex: string) => {
    setPalette((prev) => prev.filter((c) => c.hex !== hex))
  }, [])

  const clearPalette = useCallback(() => setPalette([]), [])
  const clearHistory = useCallback(() => setHistory([]), [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!imgDims) return
      const img = e.currentTarget
      const rect = img.getBoundingClientRect()
      const scaleX = imgDims.width / rect.width
      const scaleY = imgDims.height / rect.height
      const px = Math.floor((e.clientX - rect.left) * scaleX)
      const py = Math.floor((e.clientY - rect.top) * scaleY)
      const dx = e.clientX - rect.left
      const dy = e.clientY - rect.top
      setDisplayPos({ x: dx, y: dy })
      return { px, py, dx, dy }
    },
    [imgDims]
  )

  return {
    file,
    previewUrl,
    color,
    cursorPos,
    displayPos,
    imgDims,
    history,
    palette,
    extractedColors,
    imageDataRef,
    handleFiles,
    handleImageLoad,
    handleClear,
    pickColor,
    handleMouseMove,
    handleExtractPalette,
    addToPalette,
    removeFromPalette,
    clearPalette,
    clearHistory,
  }
}
