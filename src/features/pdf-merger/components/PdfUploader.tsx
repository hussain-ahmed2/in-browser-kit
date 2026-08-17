"use client";

import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";

interface PdfUploaderProps {
  onFilesSelect: (files: File[]) => void;
}

export function PdfUploader({ onFilesSelect }: PdfUploaderProps) {
  return (
    <FileDropzone
      accept="application/pdf"
      multiple
      onFiles={(files) => {
        const validFiles = files.filter((file) => file.type === "application/pdf");
        if (validFiles.length !== files.length) {
          toast.warning("Some files were not PDFs and were ignored.");
        }
        if (validFiles.length > 0) {
          onFilesSelect(validFiles);
        }
      }}
      label="Click or drag and drop to add PDFs"
      dropLabel="Drop your PDFs here"
      hint="Add 2 or more PDF files"
    />
  );
}