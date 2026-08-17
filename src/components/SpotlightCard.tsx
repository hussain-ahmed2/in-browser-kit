"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.ComponentProps<"div"> {
  asChild?: never;
}

/**
 * A card with a mouse-tracked radial "flashlight" glow and an animated
 * conic gradient border on hover. Pointer position is written directly
 * to CSS custom properties on the DOM node — no React re-renders.
 */
export function SpotlightCard({ className, ...props }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        "spotlight border-conic rounded-xl bg-card ring-1 ring-foreground/10 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10",
        className
      )}
      {...props}
    />
  );
}
