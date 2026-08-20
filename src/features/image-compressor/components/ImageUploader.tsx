"use client";

import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { MAX_FILE_SIZE_MB, MAX_BATCH_SIZE } from "../constants";

interface ImageUploaderProps {
  onFilesSelect: (files: File[]) => void;
}

export function ImageUploader({ onFilesSelect }: ImageUploaderProps) {
  return (
    <FileDropzone
      accept="image/*"
      multiple={true}
      onFiles={(files) => {
        if (files.length > MAX_BATCH_SIZE) {
          toast.error(`You can only upload up to ${MAX_BATCH_SIZE} images at once.`);
          return;
        }

        const validFiles: File[] = [];
        const invalidTypes: string[] = [];
        const tooLarge: string[] = [];

        files.forEach((file) => {
          if (!file.type.startsWith("image/")) {
            invalidTypes.push(file.name);
          } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            tooLarge.push(file.name);
          } else {
            validFiles.push(file);
          }
        });

        if (invalidTypes.length > 0) {
          toast.error(`${invalidTypes.length} file(s) skipped: Not valid images.`);
        }
        if (tooLarge.length > 0) {
          toast.error(`${tooLarge.length} file(s) skipped: Exceed ${MAX_FILE_SIZE_MB}MB limit.`);
        }

        if (validFiles.length > 0) {
          onFilesSelect(validFiles);
        }
      }}
      label="Click or drag and drop to upload images"
      dropLabel="Drop your images here"
      hint={`JPG, PNG, or WebP — Max ${MAX_FILE_SIZE_MB}MB per file (Up to ${MAX_BATCH_SIZE} files)`}
    />
  );
}