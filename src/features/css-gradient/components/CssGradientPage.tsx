'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Palette, Copy, Check, RotateCcw, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
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
  typeSet,
  angleSet,
  colorAdded,
  colorRemoved,
  colorUpdated,
  clearAll,
} from '../cssGradientSlice'
import { generateGradient, generateCssBlock } from '../lib/cssGradient'

export function CssGradientPage() {
  const dispatch = useAppDispatch()
  const { type, colors, angle } = useAppSelector((s) => s.cssGradient)
  const [isCopied, setIsCopied] = useState(false)

  const gradient = useMemo(() => generateGradient(type, colors, angle), [type, colors, angle])
  const cssBlock = useMemo(() => generateCssBlock(type, colors, angle), [type, colors, angle])

  const handleCopy = () => {
    navigator.clipboard.writeText(cssBlock)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleAddColor = () => {
    if (colors.length >= 10) {
      toast.error('Maximum 10 colors allowed')
      return
    }
    dispatch(colorAdded('#ffffff'))
  }

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette /> CSS Gradient Generator
        </CardTitle>
        <CardDescription>
          Create beautiful CSS gradients with live preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div
          className="w-full h-48 rounded-xl border border-border shadow-inner"
          style={{ background: gradient }}
        />

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={type} onValueChange={(v) => dispatch(typeSet(v as 'linear' | 'radial'))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'linear' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Angle</Label>
                <span className="text-xs text-muted-foreground">{angle}°</span>
              </div>
              <Slider
                value={[angle]}
                onValueChange={([v]) => dispatch(angleSet(v))}
                min={0}
                max={360}
                step={1}
              />
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Colors
            </Label>
            <Button variant="outline" size="sm" onClick={handleAddColor}>
              <Plus className="w-4 h-4 mr-1" /> Add Color
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => dispatch(colorUpdated({ index: i, color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => dispatch(colorUpdated({ index: i, color: e.target.value }))}
                  className="flex-1 bg-transparent text-xs font-mono min-w-0"
                />
                {colors.length > 2 && (
                  <button
                    onClick={() => dispatch(colorRemoved(i))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              CSS Output
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`transition-all duration-300 ${isCopied ? 'text-green-500' : ''}`}
            >
              {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {isCopied ? 'Copied!' : 'Copy CSS'}
            </Button>
          </div>
          <Textarea
            readOnly
            value={cssBlock}
            className="font-mono text-sm bg-secondary/20 resize-none"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
