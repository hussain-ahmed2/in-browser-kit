'use client'

import { toast } from 'sonner'
import { FileDropzone } from '@/components/FileDropzone'

interface ImageUploaderProps {
    onFileSelect: (file: File) => void
    maxSizeMB?: number
}

export function ImageUploader({
    onFileSelect,
    maxSizeMB = 50
}: ImageUploaderProps) {
    return (
        <FileDropzone
            accept="image/*"
            multiple={false}
            onFiles={(files) => {
                const file = files[0]
                if (!file) return
                if (!file.type.startsWith('image/')) {
                    toast.error('Please select a valid image file.')
                    return
                }
                if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.error(`File exceeds the ${maxSizeMB}MB limit.`)
                    return
                }
                onFileSelect(file)
            }}
            label="Click or drag and drop to upload"
            dropLabel="Drop your image here"
            hint="JPG, PNG, or WebP — Max 50MB"
        />
    )
}