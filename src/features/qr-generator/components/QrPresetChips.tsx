'use client'

import { Bitcoin, Contact, Link, Mail, MessageSquare, Phone, Type, Wifi } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QR_PRESETS, type QrPreset } from '../lib/qr'

const PRESET_ICONS: Record<string, LucideIcon> = {
  text: Type,
  url: Link,
  wifi: Wifi,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  vcard: Contact,
  bitcoin: Bitcoin,
}

interface QrPresetChipsProps {
  activeSlug: string | null
  onSelect: (preset: QrPreset) => void
}

export function QrPresetChips({ activeSlug, onSelect }: QrPresetChipsProps) {
  const activePreset = QR_PRESETS.find((p) => p.slug === activeSlug) ?? null

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-muted-foreground">
        Start from a template
      </span>
      <div className="flex flex-wrap gap-2">
        {QR_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.slug] ?? Type
          const isActive = activeSlug === preset.slug
          return (
            <Button
              key={preset.slug}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelect(preset)}
              title={preset.description}
              aria-pressed={isActive}
              className={cn(
                'text-muted-foreground hover:text-foreground',
                isActive &&
                  'bg-accent text-foreground ring-1 ring-brand/60'
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {preset.label}
            </Button>
          )
        })}
      </div>
      {activePreset && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm animate-fade-in">
          <p className="font-medium text-foreground">
            {activePreset.description}
          </p>
          <ul className="mt-2 space-y-1 pl-4 list-disc text-muted-foreground">
            {activePreset.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}