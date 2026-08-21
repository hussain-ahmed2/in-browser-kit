export function getFFmpegArgs(
    format: string,
    quality: string,
    resolution: string,
    inputName: string,
    outputName: string,
    maxThreads: string = "2",
    trimStart?: string,
    trimEnd?: string
): string[] {
    const args = [];
    
    if (trimStart) {
        args.push("-ss", trimStart);
    }
    
    args.push("-i", inputName);
    
    if (trimEnd) {
        args.push("-to", trimEnd);
    }

    args.push("-threads", maxThreads);
    
    if (format === "mp4" || format === "webm") {
        // Prevent WebAssembly OOM crashes by capping resolution (4K buffering blows up the heap)
        let scaleFilter = "scale='min(1920,iw)':-2"; // default original/1080p fallback
        if (resolution === "1080p") scaleFilter = "scale='min(1920,iw)':-2";
        else if (resolution === "720p") scaleFilter = "scale='min(1280,iw)':-2";
        else if (resolution === "480p") scaleFilter = "scale='min(854,iw)':-2";
        else if (resolution === "360p") scaleFilter = "scale='min(640,iw)':-2";
        
        args.push("-vf", scaleFilter);
        
        // Use extremely fast presets for browser encoding
        if (quality === "high") {
            args.push("-preset", "fast", "-crf", "22");
        } else if (quality === "medium") {
            args.push("-preset", "veryfast", "-crf", "28");
        } else if (quality === "low") {
            args.push("-preset", "ultrafast", "-crf", "35");
        }

        // Move the moov atom to the start of the file for instant playback in browsers
        if (format === "mp4") {
            args.push("-movflags", "+faststart");
        }

        // WebM defaults to VP9, which is very slow. Force realtime processing speed.
        if (format === "webm") {
            args.push("-deadline", "realtime", "-cpu-used", "8");
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
