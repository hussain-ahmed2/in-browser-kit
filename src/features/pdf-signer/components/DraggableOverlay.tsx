"use client";

import { useRef, useState } from "react";

export interface DraggableOverlayProps {
  position: { x: number; y: number }; // 0 to 1
  onChange: (pos: { x: number; y: number }) => void;
  scale: number;
  imageSrc: string;
}

export function DraggableOverlay({
  position,
  onChange,
  scale,
  imageSrc,
}: DraggableOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Center of the drag handle relative to the container
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;

    // Clamp to 0-1 bounds
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    onChange({ x, y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded"
    >
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto touch-none group cursor-move ${
          isDragging ? "opacity-80" : "hover:opacity-90"
        }`}
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="relative border-2 border-dashed border-brand/0 group-hover:border-brand/50 transition-colors p-1 flex items-center justify-center bg-white/20 backdrop-blur-xs rounded"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Signature Preview"
            className="max-w-none shadow-sm pointer-events-none mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}
