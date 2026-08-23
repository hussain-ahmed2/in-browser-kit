'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export function useClipboard(resetMs = 5000) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)

  const copy = useCallback(
    (label: string, value: string) => {
      navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard!')
      setCopiedLabel(label)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiedLabel(null), resetMs)
    },
    [resetMs]
  )

  return { copiedLabel, copy }
}
