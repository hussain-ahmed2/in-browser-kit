"use client"

interface ToolSkeletonProps {
  status?: string
  progress?: number
  lines?: number
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div className="h-4 rounded-md bg-secondary/70 animate-pulse" style={{ width }} />
  )
}

export function ToolSkeleton({ status, progress, lines = 4 }: ToolSkeletonProps) {
  const widths = ['100%', '85%', '92%', '60%', '78%', '95%', '70%', '88%']
  const visibleLines = widths.slice(0, lines)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card skeleton */}
      <div className="rounded-xl border border-border bg-secondary/20 p-5 space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-secondary/60 animate-pulse" />
          <div className="h-5 w-40 rounded bg-secondary/60 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2.5 pt-2">
          {visibleLines.map((w, i) => (
            <SkeletonLine key={i} width={w} />
          ))}
        </div>

        {/* Button skeletons */}
        <div className="flex gap-3 pt-2">
          <div className="h-10 flex-1 rounded-lg bg-secondary/60 animate-pulse" />
          <div className="h-10 flex-1 rounded-lg bg-secondary/40 animate-pulse" />
        </div>
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand to-glow transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center font-medium">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Status text */}
      {status && (
        <p className="text-sm text-muted-foreground text-center">
          {status}
        </p>
      )}
    </div>
  )
}
