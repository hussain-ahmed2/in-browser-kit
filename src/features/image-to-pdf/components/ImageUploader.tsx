'use client'

import { toast } from 'sonner'
import { FileDropzone } from '@/components/FileDropzone'

interface ImageUploaderProps {
    onFilesSelect: (files: File[]) => void
}

export function ImageUploader({ onFilesSelect }: ImageUploaderProps) {
    return (
        <FileDropzone
            accept="image/*"
            multiple
            onFiles={(files) => {
                const validFiles = files.filter((file) =>
                    file.type.startsWith('image/')
                )
                if (validFiles.length !== files.length) {
                    toast.warning(
                        'Some files were not images and were ignored.'
                    )
                }
                if (validFiles.length > 0) {
                    onFilesSelect(validFiles)
                }
            }}
            label="Click or drag and drop to add images"
            dropLabel="Drop your images here"
            hint="PNG, JPEG, WebP, GIF, and BMP supported"
        />
    )
}