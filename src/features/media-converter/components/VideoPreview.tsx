import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPreviewProps {
  file: File;
  filter: string;
}

const getCssFilter = (filter: string) => {
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
    case "invert":
      return "invert(100%)";
    case "blur":
      return "blur(4px)";
    default:
      return "none";
  }
};

export function VideoPreview({ file, filter }: VideoPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    
    // Defer state update to avoid React cascading render warnings in Strict Mode
    const timer = setTimeout(() => setUrl(objectUrl), 0);

    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const isVideo = file.type.startsWith("video/");

  if (!isVideo || !url) {
    return null; // Skip preview for audio files or if URL isn't ready
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-border shadow-xl">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}
      
      {/* 
        Native video player gives us a flawless timeline for free. 
        We apply the CSS filter instantly for a real-time hardware-accelerated preview!
      */}
      <video
        src={url}
        controls
        className="w-full h-full object-contain"
        style={{ filter: getCssFilter(filter), transition: "filter 0.3s ease" }}
        onLoadedData={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}
