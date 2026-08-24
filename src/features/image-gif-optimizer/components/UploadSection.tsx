'use client'

import { useCallback } from 'react'
import { FileDropzone } from '@/components/FileDropzone'

interface UploadSectionProps {
  onFiles: (files: File[]) => void
}

export function UploadSection({ onFiles }: UploadSectionProps) {
  return (
    <FileDropzone
      onFiles={onFiles}
      accept="image/gif"
      multiple={false}
    />
  )
}