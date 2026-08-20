"use client";

import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { MAX_MEDIA_SIZE_MB } from "../constants";

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
}

export function MediaUploader({ onFileSelect }: MediaUploaderProps) {
  return (
    <FileDropzone
      accept="video/*,audio/*"
      multiple={false}
      onFiles={(files) => {
        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
          toast.error("Please select a valid video or audio file.");
          return;
        }

        if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
          toast.error(`File is too large. Max allowed size is ${MAX_MEDIA_SIZE_MB}MB.`);
          return;
        }

        onFileSelect(file);
      }}
      label="Click or drag and drop to upload media"
      dropLabel="Drop your video or audio file here"
      hint={`MP4, WebM, MP3, WAV, etc. — Max ${MAX_MEDIA_SIZE_MB}MB`}
    />
  );
}
