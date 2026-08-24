export interface FormatConverterResult {
  file: File;
  objectUrl: string;
  width: number;
  height: number;
  originalSize: number;
  convertedSize: number;
}

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif" | "image/bmp";

export const SUPPORTED_FORMATS: { value: OutputFormat; label: string; extension: string }[] = [
  { value: "image/jpeg", label: "JPEG", extension: "jpg" },
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/webp", label: "WebP", extension: "webp" },
  { value: "image/avif", label: "AVIF", extension: "avif" },
  { value: "image/bmp", label: "BMP", extension: "bmp" },
];

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function convertFormat(
  file: File,
  format: OutputFormat,
  quality: number
): Promise<FormatConverterResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      // For JPEG/WebP/AVIF, fill transparent background with white
      if (format === "image/jpeg" || format === "image/webp" || format === "image/avif") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob returned null"));
            return;
          }
          const ext = SUPPORTED_FORMATS.find((f) => f.value === format)?.extension || "png";
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const resultFile = new File([blob], `${baseName}.${ext}`, {
            type: format,
            lastModified: Date.now(),
          });
          const objectUrl = URL.createObjectURL(resultFile);
          resolve({
            file: resultFile,
            objectUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            originalSize: file.size,
            convertedSize: blob.size,
          });
        },
        format,
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function detectBrowserAVIFSupport(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 1, 1);
  try {
    return canvas.toDataURL("image/avif").startsWith("data:image/avif");
  } catch {
    return false;
  }
}

export function detectBrowserWebPSupport(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 1, 1);
  try {
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}