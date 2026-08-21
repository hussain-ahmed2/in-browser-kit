"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { UploadCloud, Download, File, Folder, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface ZipEntry {
  name: string;
  size: number;
  dir: boolean;
  file: JSZip.JSZipObject;
}

export function ZipExtractorPage() {
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processZipFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const parsedEntries: ZipEntry[] = [];
      
      zip.forEach((relativePath, zipEntry) => {
        // Exclude system hidden files common in zips (like __MACOSX)
        if (!relativePath.startsWith("__MACOSX/") && !relativePath.includes(".DS_Store")) {
          // size might be uncompressed size if available, otherwise it's in zipEntry._data?.uncompressedSize (internal)
          // JSZip handles this differently. Let's just use the name and dir properties. We'll use 0 for size if undefined initially, 
          // but we can access `zipEntry._data?.uncompressedSize` if we bypass types, or just not show size.
          // Wait, zipEntry doesn't expose size publicly until extracted. 
          // We can cast `zipEntry as any` to get `_data.uncompressedSize` for a preview.
          const size = (zipEntry as any)._data?.uncompressedSize || 0;
          parsedEntries.push({
            name: relativePath,
            size,
            dir: zipEntry.dir,
            file: zipEntry
          });
        }
      });
      
      setEntries(parsedEntries);
      toast.success(`Loaded ${parsedEntries.length} items from ${file.name}`);
    } catch (err) {
      setError("Failed to parse the ZIP file. Please ensure it is a valid archive.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        processZipFile(file);
      } else {
        setError("Please drop a valid .zip file.");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processZipFile(e.target.files[0]);
    }
  };

  const handleExtract = async (entry: ZipEntry) => {
    if (entry.dir) return; // Cannot extract a directory directly like this
    
    try {
      const blob = await entry.file.async("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract just the file name, not the full path
      const parts = entry.name.split("/");
      a.download = parts[parts.length - 1];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to extract file.");
    }
  };

  const handleClear = () => {
    setEntries([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {entries.length === 0 ? (
        <Card
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragging ? "border-brand bg-brand/5" : "border-border hover:bg-secondary/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? "text-brand" : "text-muted-foreground"}`} />
            <h3 className="text-lg font-semibold tracking-tight">Drop your ZIP archive here</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
              Your files are processed securely in your browser. Nothing is ever uploaded to a server.
            </p>
            <div className="relative">
              <Button disabled={isLoading}>
                {isLoading ? "Parsing Archive..." : "Select ZIP File"}
              </Button>
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm mt-4 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Archive Contents</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Close Archive
            </Button>
          </div>
          
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium w-32">Size</th>
                    <th className="px-6 py-3 font-medium w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-3 flex items-center gap-3">
                        {entry.dir ? (
                          <Folder className="w-4 h-4 text-brand shrink-0" />
                        ) : (
                          <File className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate max-w-[400px]" title={entry.name}>
                          {entry.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {entry.dir ? "--" : formatBytes(entry.size)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {!entry.dir && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExtract(entry)}
                            title="Extract file"
                            className="h-8 w-8 hover:text-brand hover:bg-brand/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
