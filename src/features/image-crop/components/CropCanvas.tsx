"use client";

import { useRef, useCallback, useState } from "react";
import { CropHandles } from "./CropHandles";
import { CropGridOverlay } from "./CropGridOverlay";
import type { CropArea } from "../lib/imageCrop";
import { HANDLE_HIT } from "../constants";

type DragMode =
  | "none"
  | "create"
  | "move"
  | "resize-nw"
  | "resize-ne"
  | "resize-sw"
  | "resize-se"
  | "resize-n"
  | "resize-s"
  | "resize-w"
  | "resize-e";

function getHandleAtPoint(
  cropArea: CropArea,
  dims: { width: number; height: number },
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
): DragMode {
  const scaleX = dims.width / containerRect.width;
  const scaleY = dims.height / containerRect.height;

  // Convert crop area edges to SCREEN coordinates for hit detection
  const leftScreen = containerRect.left + cropArea.x / scaleX;
  const rightScreen = containerRect.left + (cropArea.x + cropArea.width) / scaleX;
  const topScreen = containerRect.top + cropArea.y / scaleY;
  const bottomScreen = containerRect.top + (cropArea.y + cropArea.height) / scaleY;
  const centerXScreen = containerRect.left + (cropArea.x + cropArea.width / 2) / scaleX;
  const centerYScreen = containerRect.top + (cropArea.y + cropArea.height / 2) / scaleY;

  const nearLeft = Math.abs(clientX - leftScreen) < HANDLE_HIT;
  const nearRight = Math.abs(clientX - rightScreen) < HANDLE_HIT;
  const nearTop = Math.abs(clientY - topScreen) < HANDLE_HIT;
  const nearBottom = Math.abs(clientY - bottomScreen) < HANDLE_HIT;
  const nearCenterX = Math.abs(clientX - centerXScreen) < HANDLE_HIT;
  const nearCenterY = Math.abs(clientY - centerYScreen) < HANDLE_HIT;

  if (nearTop && nearLeft) return "resize-nw";
  if (nearTop && nearRight) return "resize-ne";
  if (nearBottom && nearLeft) return "resize-sw";
  if (nearBottom && nearRight) return "resize-se";
  if (nearTop && nearCenterX) return "resize-n";
  if (nearBottom && nearCenterX) return "resize-s";
  if (nearLeft && nearCenterY) return "resize-w";
  if (nearRight && nearCenterY) return "resize-e";

  // Check if click is inside the crop area (move mode) - use screen coordinates
  if (
    clientX >= leftScreen &&
    clientX <= rightScreen &&
    clientY >= topScreen &&
    clientY <= bottomScreen
  )
    return "move";
  return "none";
}

function applyResize(
  mode: DragMode,
  cropArea: CropArea,
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  dims: { width: number; height: number },
  aspectRatio: number | null,
): CropArea {
  const scaleX = dims.width / containerRect.width;
  const scaleY = dims.height / containerRect.height;

  const x = (clientX - containerRect.left) * scaleX;
  const y = (clientY - containerRect.top) * scaleY;

  let { x: ax, y: ay, width, height } = cropArea;
  const right = ax + width;
  const bottom = ay + height;

  let fixedX = ax, fixedY = ay;

  switch (mode) {
    case "resize-nw":
      fixedX = right; fixedY = bottom;
      ax = x; ay = y;
      width = fixedX - ax; height = fixedY - ay;
      break;
    case "resize-ne":
      fixedX = ax; fixedY = bottom;
      width = x - ax; ay = y; height = fixedY - ay;
      break;
    case "resize-sw":
      fixedX = right; fixedY = ay;
      ax = x; width = fixedX - ax; height = y - ay;
      break;
    case "resize-se":
      fixedX = ax; fixedY = ay;
      width = x - ax; height = y - ay;
      break;
    case "resize-n":
      fixedX = ax + width / 2; fixedY = bottom;
      ay = y; height = fixedY - ay;
      break;
    case "resize-s":
      fixedX = ax + width / 2; fixedY = ay;
      height = y - ay;
      break;
    case "resize-w":
      fixedX = right; fixedY = ay + height / 2;
      ax = x; width = fixedX - ax;
      break;
    case "resize-e":
      fixedX = ax; fixedY = ay + height / 2;
      width = x - ax;
      break;
  }

  // Apply aspect ratio constraint if needed
  if (aspectRatio !== null && width > 0 && height > 0) {
    // Compute the largest dimensions that fit BOTH the image bounds and the aspect ratio
    const maxW = Math.min(dims.width, dims.height * aspectRatio);
    const maxH = maxW / aspectRatio;

    // Use the aspect-ratio-constrained dimension from the drag, clamped to max
    const currentRatio = width / height;
    if (currentRatio > aspectRatio) {
      // Drag made it too wide — derive height from clamped width
      width = Math.min(width, maxW);
      height = width / aspectRatio;
    } else {
      // Drag made it too tall — derive width from clamped height
      height = Math.min(height, maxH);
      width = height * aspectRatio;
    }

    // Recalculate position based on which edge was fixed
    if (mode.includes("n")) ay = fixedY - height;
    if (mode.includes("w")) ax = fixedX - width;
    if (mode === "resize-n" || mode === "resize-s") {
      ax = fixedX - width / 2;
    }
    if (mode === "resize-w" || mode === "resize-e") {
      ay = fixedY - height / 2;
    }
  } else {
    // Free mode: clamp dimensions to image bounds
    width = Math.min(width, dims.width);
    height = Math.min(height, dims.height);
  }

  // Clamp to image bounds
  ax = Math.max(0, Math.min(ax, dims.width - width));
  ay = Math.max(0, Math.min(ay, dims.height - height));

  return { x: ax, y: ay, width, height };
}

function applyMove(
  cropArea: CropArea,
  deltaX: number,
  deltaY: number,
  dims: { width: number; height: number },
): CropArea {
  const x = Math.max(
    0,
    Math.min(cropArea.x + deltaX, dims.width - cropArea.width),
  );
  const y = Math.max(
    0,
    Math.min(cropArea.y + deltaY, dims.height - cropArea.height),
  );
  return { ...cropArea, x, y };
}

interface CropCanvasProps {
  previewUrl: string | null;
  cropArea: CropArea | null;
  dims: { width: number; height: number } | null;
  gridType: "none" | "thirds" | "golden" | "center";
  aspectRatio: number | null;
  onCropAreaChange: (area: CropArea) => void;
}

export function CropCanvas({
  previewUrl,
  cropArea,
  dims,
  gridType,
  aspectRatio,
  onCropAreaChange,
}: CropCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    imageX: number;
    imageY: number;
  } | null>(null);

  const cropOverlayStyle =
    cropArea && dims
      ? {
          left: `${(cropArea.x / dims.width) * 100}%`,
          top: `${(cropArea.y / dims.height) * 100}%`,
          width: `${(cropArea.width / dims.width) * 100}%`,
          height: `${(cropArea.height / dims.height) * 100}%`,
        }
      : null;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dims || !containerRef.current || !cropArea) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mode = getHandleAtPoint(cropArea, dims, e.clientX, e.clientY, rect);
      if (mode === "none") {
        if (dims && cropArea) {
          const scaleX = dims.width / rect.width;
          const scaleY = dims.height / rect.height;
          const imageX = (e.clientX - rect.left) * scaleX;
          const imageY = (e.clientY - rect.top) * scaleY;
          setDragMode("create");
          setDragStart({ clientX: e.clientX, clientY: e.clientY, imageX, imageY });
        }
        return;
      }
      setDragMode(mode);
      setDragStart({ clientX: e.clientX, clientY: e.clientY, imageX: 0, imageY: 0 });
    },
    [dims, cropArea],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        dragMode === "none" ||
        !dragStart ||
        !dims ||
        !cropArea ||
        !containerRef.current
      )
        return;

      const rect = containerRef.current.getBoundingClientRect();

      let newArea: CropArea;

      if (dragMode === "create") {
        const scaleX = dims.width / rect.width;
        const scaleY = dims.height / rect.height;
        const currentImageX = (e.clientX - rect.left) * scaleX;
        const currentImageY = (e.clientY - rect.top) * scaleY;

        // Selection extends from initial click point to current mouse position
        const x = Math.min(dragStart.imageX, currentImageX);
        const y = Math.min(dragStart.imageY, currentImageY);
        const width = Math.abs(currentImageX - dragStart.imageX);
        const height = Math.abs(currentImageY - dragStart.imageY);

        if (width < 1 || height < 1) return;

        let newArea: CropArea = { x, y, width, height };

        // Apply aspect ratio constraint anchored at the initial click point
        if (aspectRatio !== null) {
          // Compute max dimensions that fit the image with this ratio
          const maxW = Math.min(dims.width, dims.height * aspectRatio);
          const maxH = maxW / aspectRatio;

          const currentRatio = width / height;
          if (currentRatio > aspectRatio) {
            // Too wide - expand height, anchored at initial click
            const clampedW = Math.min(width, maxW);
            const newHeight = clampedW / aspectRatio;
            if (dragStart.imageY < currentImageY) {
              newArea = { x, y, width: clampedW, height: newHeight };
            } else {
              newArea = { x, y: dragStart.imageY - newHeight, width: clampedW, height: newHeight };
            }
          } else {
            // Too tall - expand width
            const clampedH = Math.min(height, maxH);
            const newWidth = clampedH * aspectRatio;
            if (dragStart.imageX < currentImageX) {
              newArea = { x, y, width: newWidth, height: clampedH };
            } else {
              newArea = { x: dragStart.imageX - newWidth, y, width: newWidth, height: clampedH };
            }
          }
        }

        // Clamp to image bounds
        newArea.width = Math.min(newArea.width, dims.width);
        newArea.height = Math.min(newArea.height, dims.height);
        newArea.x = Math.max(0, Math.min(newArea.x, dims.width - newArea.width));
        newArea.y = Math.max(0, Math.min(newArea.y, dims.height - newArea.height));

        onCropAreaChange(newArea);
      } else if (dragMode.startsWith("resize")) {
        newArea = applyResize(
          dragMode,
          cropArea,
          e.clientX,
          e.clientY,
          rect,
          dims,
          aspectRatio,
        );
        onCropAreaChange(newArea);
      } else if (dragMode === "move") {
        const scaleX = dims.width / rect.width;
        const scaleY = dims.height / rect.height;
        const deltaX = (e.clientX - dragStart.clientX) * scaleX;
        const deltaY = (e.clientY - dragStart.clientY) * scaleY;
        newArea = applyMove(cropArea, deltaX, deltaY, dims);
        onCropAreaChange(newArea);
        setDragStart({ ...dragStart, clientX: e.clientX, clientY: e.clientY });
      }
    },
    [dragMode, dragStart, dims, cropArea, aspectRatio, onCropAreaChange],
  );

  const handleMouseUp = useCallback(() => {
    setDragMode("none");
    setDragStart(null);
  }, []);

  const handleHandleMouseDown = useCallback(
    (pos: string, e: React.MouseEvent<HTMLDivElement>) => {
      if (!dims || !containerRef.current || !cropArea) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mode = getHandleAtPoint(cropArea, dims, e.clientX, e.clientY, rect);
      if (mode === "none") return;
      setDragMode(mode);
      setDragStart({ clientX: e.clientX, clientY: e.clientY, imageX: 0, imageY: 0 });
    },
    [dims, cropArea],
  );

  return (
    <div
      ref={containerRef}
      className="relative inline-block w-full cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl ?? ""}
        alt="Crop source"
        className="w-full rounded-lg border border-border max-h-150 object-contain pointer-events-none select-none"
        draggable={false}
      />

      <CropGridOverlay gridType={gridType} dims={dims} />

      {cropOverlayStyle && (
        <div
          className="absolute border-2 border-white/90 bg-white/10 pointer-events-none"
          style={cropOverlayStyle}
        >
          <CropHandles
            cropArea={cropArea}
            dims={dims}
            onMouseDown={handleHandleMouseDown}
          />
        </div>
      )}
    </div>
  );
}