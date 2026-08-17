'use client'

import { toast } from 'sonner'
import { FileDropzone } from '@/components/FileDropzone'

interface PdfUploaderProps {
    onFileSelect: (file: File) => void
    hint?: string
}

export function PdfUploader({ onFileSelect, hint }: PdfUploaderProps) {
    return (
        <FileDropzone
            accept="application/pdf"
            multiple={false}
            onFiles={(files) => {
                const file = files[0]
                if (!file) return
                if (file.type !== 'application/pdf') {
                    toast.warning('That file is not a PDF and was ignored.')
                    return
                }
                onFileSelect(file)
            }}
            label="Click or drag and drop a PDF"
            dropLabel="Drop your PDF here"
            hint={hint}
        />
    )
}
