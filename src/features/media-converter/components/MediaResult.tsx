"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { MediaConversionResult } from "../types";

interface MediaResultProps {
    result: MediaConversionResult;
    onStartOver: () => void;
}

export function MediaResult({ result, onStartOver }: MediaResultProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = URL.createObjectURL(result.convertedFile);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [result.convertedFile]);

    const isAudio = result.convertedFile.type.startsWith("audio/");
    const isVideo = result.convertedFile.type.startsWith("video/");
    const isImage = result.convertedFile.type.startsWith("image/"); // e.g. GIF

    const handleDownload = () => {
        if (!url) return;
        const link = document.createElement("a");
        link.href = url;
        link.download = result.convertedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!url) return null;

    return (
        <div className="space-y-6">
            <div className="rounded-lg overflow-hidden border border-border bg-black flex items-center justify-center p-4 min-h-[300px]">
                {isVideo && (
                    <video controls className="max-w-full max-h-[500px]" src={url} />
                )}
                {isAudio && (
                    <audio controls className="w-full max-w-md" src={url} />
                )}
                {isImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={url} alt="Converted media" className="max-w-full max-h-[500px] object-contain" />
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    Converted to <span className="font-semibold text-foreground uppercase">{result.convertedFile.name.split('.').pop()}</span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <Button variant="outline" onClick={onStartOver} className="flex-1 sm:flex-none">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                    <Button onClick={handleDownload} variant="success" className="flex-1 sm:flex-none">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>
        </div>
    );
}
