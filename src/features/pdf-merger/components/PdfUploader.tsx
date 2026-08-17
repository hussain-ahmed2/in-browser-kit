"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PdfUploaderProps {
  onFilesSelect: (files: File[]) => void;
}

export function PdfUploader({ onFilesSelect }: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSelect = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => file.type === "application/pdf");
      if (validFiles.length !== files.length) {
        toast.warning("Some files were not PDFs and were ignored.");
      }
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    },
    [onFilesSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) validateAndSelect(selectedFiles);
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
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) validateAndSelect(files);
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
      aria-label="Upload PDF files"
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
          "w-8 h-8 mx-auto mb-2 transition-all duration-200",
          isDragOver ? "text-brand scale-110" : "text-muted-foreground group-hover:text-brand/80"
        )}
        aria-hidden="true"
      />
      <p className="text-sm font-medium">
        {isDragOver ? "Drop your PDFs here" : "Click or drag and drop to add PDFs"}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5">Add 2 or more PDF files</p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}
