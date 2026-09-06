"use client"

interface ProgressOverlayProps {
  status: string
  progress: number
  visible: boolean
}

export function ProgressOverlay({ status, progress, visible }: ProgressOverlayProps) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 max-w-xs w-full animate-fade-in">
        {/* Spinning indicator */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand to-glow transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="truncate mr-2">{status || 'Processing...'}</span>
            <span className="shrink-0 font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
