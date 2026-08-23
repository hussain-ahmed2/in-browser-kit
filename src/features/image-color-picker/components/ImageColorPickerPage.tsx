'use client'

import { useState, useRef, useCallback } from 'react'
import { Palette } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/FileDropzone'
import { useColorPicker } from '../hooks/useColorPicker'
import { useMagnifier } from '../hooks/useMagnifier'
import { useClipboard } from '../hooks/useClipboard'
import { CursorToolbar } from './CursorToolbar'
import { ColorInfoPanel } from './ColorInfoPanel'
import { ColorHarmony } from './ColorHarmony'
import { ExtractedPalette } from './ExtractedPalette'
import { PalettePanel } from './PalettePanel'
import { ExportPanel } from './ExportPanel'
import { ColorHistory } from './ColorHistory'
import type { CursorMode, HarmonyMode } from '../types'

export function ImageColorPickerPage() {
  const [cursorMode, setCursorMode] = useState<CursorMode>('magnifier')
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary')
  const [exportFormat, setExportFormat] = useState<'css' | 'scss' | 'json'>('css')
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)

  const {
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
  } = useColorPicker()

  const magnifier = useMagnifier()
  const { copiedLabel, copy } = useClipboard()

  const getCursorClass = () => {
    if (cursorMode === 'crosshair') return 'cursor-crosshair'
    if (cursorMode === 'pointer') return 'cursor-pointer'
    return 'cursor-none'
  }

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const result = handleMouseMove(e)
      if (cursorMode === 'magnifier' && result && imgDims) {
        magnifier.draw(imgDims, imageDataRef.current, magnifierCanvasRef.current, result.px, result.py)
      }
    },
    [cursorMode, imgDims, handleMouseMove, magnifier, imageDataRef]
  )

  const onMouseLeave = useCallback(() => {
    magnifier.clear(magnifierCanvasRef.current)
  }, [magnifier])

  return (
    <>
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette />
            Color Picker
          </CardTitle>
          <CardDescription>
            Pick colors from images with precision tools, palettes, and harmony.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              <CursorToolbar
                cursorMode={cursorMode}
                onCursorModeChange={setCursorMode}
                magnifierZoom={magnifier.zoom}
                onMagnifierZoomChange={magnifier.setZoom}
              />

              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? ''}
                    alt="Preview"
                    className={`w-full object-contain ${getCursorClass()}`}
                    onLoad={handleImageLoad}
                    onClick={pickColor}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                  />
                  {cursorMode === 'magnifier' && (
                    <canvas
                      ref={magnifierCanvasRef}
                      width={magnifier.size}
                      height={magnifier.size}
                      className="pointer-events-none absolute top-0 left-0 z-10"
                      style={{
                        transform: displayPos
                          ? `translate(${displayPos.x - magnifier.size / 2}px, ${displayPos.y - magnifier.size / 2}px)`
                          : 'none',
                        display: displayPos ? 'block' : 'none',
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={handleClear}>
                    Remove
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {color && (
                  <ColorInfoPanel
                    color={color}
                    cursorPos={cursorPos}
                    copiedLabel={copiedLabel}
                    onCopy={copy}
                  />
                )}

                {color && (
                  <ColorHarmony
                    hex={color.hex}
                    harmonyMode={harmonyMode}
                    onHarmonyModeChange={setHarmonyMode}
                    onAddToPalette={addToPalette}
                  />
                )}

                <ExtractedPalette
                  colors={extractedColors}
                  onExtract={handleExtractPalette}
                  onAddToPalette={addToPalette}
                />

                <PalettePanel
                  palette={palette}
                  onRemove={removeFromPalette}
                  onClear={clearPalette}
                />

                <ExportPanel
                  palette={palette}
                  exportFormat={exportFormat}
                  onExportFormatChange={setExportFormat}
                />

                <ColorHistory
                  history={history}
                  onClear={clearHistory}
                  onCopy={copy}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
