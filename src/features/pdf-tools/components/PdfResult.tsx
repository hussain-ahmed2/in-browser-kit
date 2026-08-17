'use client'

import { useState } from 'react'
import { CheckCircle2, Download } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PdfResultProps {
    url: string
    title: string
    description: string
    defaultFilename: string
    buttonLabel: string
    onStartOver: () => void
}

export function PdfResult({
    url,
    title,
    description,
    defaultFilename,
    buttonLabel,
    onStartOver
}: PdfResultProps) {
    const [filename, setFilename] = useState(defaultFilename)

    return (
        <div className="space-y-6">
            <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription className="mt-1 text-foreground">
                    {description}
                </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-6 border-t border-border">
                <div className="space-y-2 w-full sm:w-auto flex-1 max-w-sm">
                    <Label htmlFor="output-filename">Output File Name</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="output-filename"
                            value={filename}
                            onChange={(event) =>
                                setFilename(event.target.value)
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            .pdf
                        </span>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                    <Button
                        variant="outline"
                        onClick={onStartOver}
                        className="w-full sm:w-auto"
                    >
                        Start Over
                    </Button>
                    <Button
                        asChild
                        variant="success"
                        className="w-full sm:w-auto shrink-0"
                    >
                        <a
                            href={url}
                            download={`${filename || defaultFilename}.pdf`}
                        >
                            <Download aria-hidden="true" />
                            {buttonLabel}
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
