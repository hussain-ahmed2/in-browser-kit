'use client'

import { PdfResult } from '@/features/pdf-tools/components/PdfResult'

interface ImageToPdfResultProps {
    url: string
    onStartOver: () => void
}

export function ImageToPdfResult({
    url,
    onStartOver,
}: ImageToPdfResultProps) {
    return (
        <PdfResult
            url={url}
            title="PDF created!"
            description="Your images were combined into a single PDF document."
            defaultFilename="images"
            buttonLabel="Download PDF"
            onStartOver={onStartOver}
        />
    )
}