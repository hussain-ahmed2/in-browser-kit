'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Square, Copy, Check, RotateCcw } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  offsetXSet,
  offsetYSet,
  blurSet,
  spreadSet,
  colorSet,
  insetSet,
  clearAll,
} from '../boxShadowSlice'
import { generateBoxShadow, generateCssBlock } from '../lib/boxShadow'

export function BoxShadowPage() {
  const dispatch = useAppDispatch()
  const { offsetX, offsetY, blur, spread, color, inset } = useAppSelector((s) => s.boxShadow)
  const [isCopied, setIsCopied] = useState(false)

  const shadow = useMemo(
    () => generateBoxShadow(offsetX, offsetY, blur, spread, color, inset),
    [offsetX, offsetY, blur, spread, color, inset]
  )
  const cssBlock = useMemo(
    () => generateCssBlock(offsetX, offsetY, blur, spread, color, inset),
    [offsetX, offsetY, blur, spread, color, inset]
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(cssBlock)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square /> CSS Box Shadow Generator
        </CardTitle>
        <CardDescription>
          Create custom box shadows with live preview and copy-ready CSS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl border border-border">
          <div
            className="w-48 h-48 bg-white dark:bg-gray-800 rounded-xl border border-border transition-all duration-200"
            style={{ boxShadow: shadow }}
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          {/* Offset X */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Offset X</Label>
              <span className="text-xs text-muted-foreground">{offsetX}px</span>
            </div>
            <Slider
              value={[offsetX]}
              onValueChange={([v]) => dispatch(offsetXSet(v))}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          {/* Offset Y */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Offset Y</Label>
              <span className="text-xs text-muted-foreground">{offsetY}px</span>
            </div>
            <Slider
              value={[offsetY]}
              onValueChange={([v]) => dispatch(offsetYSet(v))}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          {/* Blur */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Blur</Label>
              <span className="text-xs text-muted-foreground">{blur}px</span>
            </div>
            <Slider
              value={[blur]}
              onValueChange={([v]) => dispatch(blurSet(v))}
              min={0}
              max={200}
              step={1}
            />
          </div>

          {/* Spread */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Spread</Label>
              <span className="text-xs text-muted-foreground">{spread}px</span>
            </div>
            <Slider
              value={[spread]}
              onValueChange={([v]) => dispatch(spreadSet(v))}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          {/* Color */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => dispatch(colorSet(e.target.value))}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0"
            />
            <div className="space-y-1">
              <Label className="text-sm font-medium">Color</Label>
              <input
                type="text"
                value={color}
                onChange={(e) => dispatch(colorSet(e.target.value))}
                className="bg-transparent text-xs font-mono w-24 border-0 p-0"
              />
            </div>
          </div>

          {/* Inset */}
          <div className="flex items-center gap-3">
            <Switch
              checked={inset}
              onCheckedChange={(v) => dispatch(insetSet(v))}
            />
            <Label className="text-sm font-medium">Inset</Label>
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
