export function getFFmpegArgs(
    format: string,
    quality: string,
    inputName: string,
    outputName: string,
    maxThreads: string = "2"
): string[] {
    const args = ["-i", inputName, "-threads", maxThreads];
    
    if (format === "mp4" || format === "webm") {
        if (quality === "high") {
            args.push("-preset", "medium", "-crf", "22");
        } else if (quality === "medium") {
            args.push("-preset", "fast", "-crf", "28");
        } else if (quality === "low") {
            args.push("-preset", "veryfast", "-crf", "35");
        }
    } else if (format === "mp3") {
        if (quality === "high") args.push("-b:a", "320k");
        else if (quality === "medium") args.push("-b:a", "192k");
        else if (quality === "low") args.push("-b:a", "128k");
    }

    args.push(outputName);
    return args;
}

export function getMimeType(format: string): string {
    switch (format) {
        case "mp4": return "video/mp4";
        case "webm": return "video/webm";
        case "mp3": return "audio/mpeg";
        case "wav": return "audio/wav";
        case "gif": return "image/gif";
        default: return "application/octet-stream";
    }
}
