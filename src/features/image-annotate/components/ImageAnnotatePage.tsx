'use client'

import { useCallback, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader2, Download, RotateCcw, PenTool, Undo2, Trash2 } from 'lucide-react'
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
import { SliderField } from '@/components/form/slider-field'
import { annotateImage, getImageDimensions, formatBytes } from '../lib/imageAnnotate'
import { annotateSchema, type AnnotateFormValues, ANNOTATE_TOOLS, type Annotation, type AnnotateTool } from '../types'
import { fileSelected, toolSet, colorSet, strokeWidthSet, fontSizeSet, annotationAdded, annotationRemoved, annotationsCleared, resultSet, processingSet, clearAll } from '../annotateSlice'

const steps = [{ label: 'Upload' }, { label: 'Annotate' }, { label: 'Download' }]

export function ImageAnnotatePage() {
  const dispatch = useAppDispatch()
  const { item, dims, tool, annotations, color, strokeWidth, fontSize, result, isProcessing } = useAppSelector((s) => s.imageAnnotate)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null)

  const form = useForm<AnnotateFormValues>({
    resolver: zodResolver(annotateSchema),
    defaultValues: { strokeWidth: 3, color: '#ff0000', fontSize: 24 },
  })

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0]
    if (!selected) return
    const previewUrl = URL.createObjectURL(selected)
    try {
      const d = await getImageDimensions(selected)
      dispatch(fileSelected({ file: selected, previewUrl, dims: d }))
    } catch {
      toast.error('Could not read image')
      URL.revokeObjectURL(previewUrl)
    }
  }, [dispatch])

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !dims) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * dims.width,
      y: ((e.clientY - rect.top) / rect.height) * dims.height,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dims) return
    const point = getCanvasPoint(e)
    setDrawing(true)
    setStartPoint(point)

    if (tool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        const id = crypto.randomUUID()
        dispatch(annotationAdded({
          id, type: 'text', x: point.x, y: point.y, x2: point.x, y2: point.y,
          text, color, strokeWidth, fontSize,
        }))
      }
      setDrawing(false)
      return
    }

    if (tool === 'freehand') {
      setCurrentAnnotation({
        id: crypto.randomUUID(), type: 'freehand',
        x: point.x, y: point.y, x2: point.x, y2: point.y,
        color, strokeWidth, points: [point],
      })
    } else {
      setCurrentAnnotation({
        id: crypto.randomUUID(), type: tool,
        x: point.x, y: point.y, x2: point.x, y2: point.y,
        color, strokeWidth,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentAnnotation) return
    const point = getCanvasPoint(e)

    if (currentAnnotation.type === 'freehand' && currentAnnotation.points) {
      setCurrentAnnotation({
        ...currentAnnotation,
        x2: point.x, y2: point.y,
        points: [...currentAnnotation.points, point],
      })
    } else {
      setCurrentAnnotation({ ...currentAnnotation, x2: point.x, y2: point.y })
    }
  }

  const handleMouseUp = () => {
    if (currentAnnotation) {
      dispatch(annotationAdded(currentAnnotation))
      setCurrentAnnotation(null)
    }
    setDrawing(false)
    setStartPoint(null)
  }

  const handleExport = async () => {
    if (!item) return
    dispatch(processingSet(true))
    try {
      const allAnnotations = currentAnnotation ? [...annotations, currentAnnotation] : annotations
      const res = await annotateImage(item.file, allAnnotations)
      dispatch(resultSet(res))
      toast.success('Annotated image exported!')
    } catch {
      toast.error('Error exporting')
      dispatch(processingSet(false))
    }
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PenTool /> Image Annotate</CardTitle>
          <CardDescription>Draw arrows, shapes, and text on images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone onFiles={handleFiles} accept="image/*" multiple={false} />
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-wrap gap-2">
                {ANNOTATE_TOOLS.map((t) => (
                  <Button key={t.value} type="button" variant={tool === t.value ? 'default' : 'outline'} size="sm" onClick={() => dispatch(toolSet(t.value))}>{t.label}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => dispatch(annotationsCleared())}><Trash2 className="size-4" /></Button>
                {annotations.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => dispatch(annotationRemoved(annotations[annotations.length - 1].id))}><Undo2 className="size-4" /></Button>
                )}
              </div>

              <FormProvider {...form}>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border flex flex-wrap gap-4 items-end">
                  <InputField name="color" label="Color" type="color" />
                  <SliderField name="strokeWidth" label="Stroke" min={1} max={20} />
                  {tool === 'text' && <SliderField name="fontSize" label="Font Size" min={8} max={72} />}
                </div>
              </FormProvider>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.objectUrl} alt="Annotated" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                  <div className="flex gap-4">
                    <Button onClick={() => { const a = document.createElement('a'); a.href = result.objectUrl; a.download = result.file.name; a.click() }} className="flex-1"><Download /> Download</Button>
                    <Button variant="outline" onClick={() => dispatch(clearAll())} className="flex-1"><RotateCcw /> Start Over</Button>
                  </div>
                </div>
              ) : (
                <div className="relative border border-border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="Source" className="w-full max-h-96 object-contain pointer-events-none" />
                  <canvas
                    ref={canvasRef}
                    width={dims?.width ?? 0}
                    height={dims?.height ?? 0}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </div>
              )}

              {!result && annotations.length > 0 && (
                <Button onClick={handleExport} disabled={isProcessing} className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60">
                  {isProcessing ? <><Loader2 className="animate-spin" /> Exporting...</> : <><PenTool /> Export Annotated Image</>}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
