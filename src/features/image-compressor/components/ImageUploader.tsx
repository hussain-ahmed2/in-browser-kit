"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
}

export function ImageUploader({ onFileSelect, maxSizeMB = 50 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, maxSizeMB]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSelect(selectedFile);
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
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
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
      aria-label="Upload image file"
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
          "w-12 h-12 mx-auto mb-4 transition-all duration-200",
          isDragOver
            ? "text-brand scale-110 drop-shadow-[0_0_12px] drop-shadow-brand/60"
            : "text-muted-foreground group-hover:text-brand/80"
        )}
      />
      <p className="text-sm font-medium">
        {isDragOver ? "Drop your image here" : "Click or drag and drop to upload"}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        JPG, PNG, or WebP — Max {maxSizeMB}MB
      </p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
