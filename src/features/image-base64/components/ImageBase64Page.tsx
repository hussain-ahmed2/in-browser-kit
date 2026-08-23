"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Copy,
  Download,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDropzone } from "@/components/FileDropzone";
import {
  fileToBase64,
  base64ToFile,
  formatBytes,
  type Base64Result,
} from "../lib/imageBase64";

type Mode = "encode" | "decode";

function decodeBase64Input(input: string): {
  dataUrl: string;
  mimeType: string;
} {
  const trimmed = input.trim();
  if (trimmed.startsWith("data:")) {
    const mime = trimmed.match(/:(.*?);/)?.[1] || "image/png";
    return { dataUrl: trimmed, mimeType: mime };
  }
  const bytes = atob(trimmed);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  const first4 = Array.from(arr.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  let mimeType = "image/png";
  if (first4.startsWith("ffd8ff")) mimeType = "image/jpeg";
  else if (first4.startsWith("89504e47")) mimeType = "image/png";
  else if (first4.startsWith("47494638")) mimeType = "image/gif";
  else if (first4.startsWith("52494646")) mimeType = "image/webp";
  else if (first4.startsWith("424d")) mimeType = "image/bmp";
  const blob = new Blob([arr], { type: mimeType });
  return { dataUrl: URL.createObjectURL(blob), mimeType };
}

export function ImageBase64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Base64Result | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  const [decodeInput, setDecodeInput] = useState("");
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedMime, setDecodedMime] = useState<string>("");

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      setFile(selected);
      setResult(null);
      setShowFull(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selected));

      try {
        const res = await fileToBase64(selected);
        setResult(res);
        toast.success("Image encoded successfully!");
      } catch {
        toast.error("Failed to encode image");
      }
    },
    [previewUrl],
  );

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.base64);
    toast.success("Base64 copied to clipboard!");
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.base64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name ?? "image"}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDecode = () => {
    if (!result) return;
    const decodedFile = base64ToFile(
      result.base64,
      file?.name ?? "decoded.png",
      result.mimeType,
    );
    const url = URL.createObjectURL(decodedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = decodedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearEncode = useCallback(() => {
    setFile(null);
    setResult(null);
    setShowFull(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleDecodeBase64 = () => {
    if (!decodeInput.trim()) {
      toast.error("Paste a Base64 string first");
      return;
    }
    try {
      const { dataUrl, mimeType } = decodeBase64Input(decodeInput);
      if (decodedUrl) URL.revokeObjectURL(decodedUrl);
      setDecodedUrl(dataUrl);
      setDecodedMime(mimeType);
      toast.success("Base64 decoded successfully!");
    } catch {
      toast.error("Invalid Base64 string");
    }
  };

  const handleDownloadDecoded = () => {
    if (!decodedUrl) return;
    const ext = decodedMime.split("/")[1] || "png";
    const a = document.createElement("a");
    a.href = decodedUrl;
    a.download = `decoded.${ext}`;
    a.click();
  };

  const handleClearDecode = () => {
    setDecodeInput("");
    if (decodedUrl) URL.revokeObjectURL(decodedUrl);
    setDecodedUrl(null);
    setDecodedMime("");
  };

  const truncated = result
    ? showFull
      ? result.base64
      : result.base64.slice(0, 200) + (result.base64.length > 200 ? "..." : "")
    : "";

  return (
    <>
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Image <ArrowRightLeft className="size-4" /> Base64
          </CardTitle>
          <CardDescription>
            Encode images to Base64 or decode Base64 strings back to images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === "encode" ? "default" : "outline"}
              onClick={() => setMode("encode")}
            >
              Image <ArrowRight className="size-3" /> Base64
            </Button>
            <Button
              variant={mode === "decode" ? "default" : "outline"}
              onClick={() => setMode("decode")}
            >
              Base64 <ArrowLeft className="size-3" /> Image
            </Button>
          </div>

          {mode === "encode" ? (
            !file ? (
              <FileDropzone
                onFiles={handleFiles}
                accept="image/*"
                multiple={false}
              />
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? ""}
                    alt="Preview"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleClearEncode}
                  >
                    Remove
                  </Button>
                </div>

                {result && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                          Original Size
                        </p>
                        <p className="font-medium">
                          {formatBytes(result.size)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                          MIME Type
                        </p>
                        <p className="font-medium">{result.mimeType}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-mono">
                          Base64 Output ({result.base64.length} chars)
                        </p>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => setShowFull(!showFull)}
                        >
                          {showFull ? "Show less" : "Show all"}
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-muted-foreground break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {truncated}
                      </pre>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleCopy} className="flex-1">
                        <Copy aria-hidden="true" />
                        Copy Base64
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownloadTxt}
                        className="flex-1"
                      >
                        <Download aria-hidden="true" />
                        Download .txt
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDecode}
                        className="flex-1"
                      >
                        Decode Back
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="base64-input">
                  Paste Base64 String
                </label>
                <textarea
                  id="base64-input"
                  className="w-full h-40 p-3 rounded-lg bg-secondary/50 border border-border font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Paste base64 encoded string here...&#10;Supports raw base64 or data URI format (data:image/png;base64,...)"
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDecodeBase64} className="flex-1">
                  Decode
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearDecode}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>

              {decodedUrl && (
                <div className="space-y-4 animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={decodedUrl}
                    alt="Decoded"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleDownloadDecoded} className="flex-1">
                      <Download aria-hidden="true" />
                      Download Image
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(decodedUrl);
                        toast.success("Data URL copied!");
                      }}
                      className="flex-1"
                    >
                      <Copy aria-hidden="true" />
                      Copy Data URL
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
