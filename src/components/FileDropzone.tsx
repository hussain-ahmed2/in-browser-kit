"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  dropLabel?: string;
  hint?: React.ReactNode;
}

/**
 * Shared click / drag-and-drop / keyboard file picker with an animated
 * marching-dash border. Validation is left to the caller via `onFiles`.
 */
export function FileDropzone({
  onFiles,
  accept,
  multiple = true,
  label = "Click or drag and drop to add files",
  dropLabel = "Drop your files here",
  hint,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: File[]) => {
      if (list.length > 0) onFiles(list);
    },
    [onFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) handleFiles(selected);
    e.target.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(Array.from(e.dataTransfer.files || []));
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        "group relative rounded-xl p-10 text-center cursor-pointer bg-secondary/30 transition-all duration-200",
        isDragOver
          ? "bg-brand/10 scale-[1.02] shadow-[0_0_40px_-12px] shadow-brand/50"
          : "hover:bg-secondary/50"
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      aria-label={label}
    >
      {/* Animated marching-dash border */}
      <svg
        className={cn(
          "absolute inset-0 w-full h-full pointer-events-none transition-colors duration-200",
          isDragOver ? "text-brand" : "text-border group-hover:text-brand/60"
        )}
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 10"
          className="animate-dash-march"
        />
      </svg>

      <UploadCloud
        className={cn(
          "w-10 h-10 mx-auto mb-3 transition-all duration-200",
          isDragOver
            ? "text-brand scale-110 drop-shadow-[0_0_12px] drop-shadow-brand/60"
            : "text-muted-foreground group-hover:text-brand/80"
        )}
        aria-hidden="true"
      />
      <p className="text-sm font-medium">{isDragOver ? dropLabel : label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
    </div>
  );
}