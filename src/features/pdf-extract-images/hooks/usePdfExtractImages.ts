"use client";

import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { toast } from "sonner";

// Ensure worker is configured (similar to other pdf tools)
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export interface ExtractionProgress {
  status: "idle" | "scanning" | "zipping" | "done" | "error";
  currentPage: number;
  totalPages: number;
  imagesFound: number;
}

export function usePdfExtractImages() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ExtractionProgress>({
    status: "idle",
    currentPage: 0,
    totalPages: 0,
    imagesFound: 0,
  });
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPdfDoc(null);
    setProgress({ status: "idle", currentPage: 0, totalPages: 0, imagesFound: 0 });
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
    
    extractedImages.forEach((url) => URL.revokeObjectURL(url));
    setExtractedImages([]);
  }, [zipUrl, extractedImages]);

  const loadFile = useCallback(
    async (newFile: File) => {
      reset();
      setFile(newFile);
      try {
        const arrayBuffer = await newFile.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(doc);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse PDF document.");
      }
    },
    [reset]
  );

  const extractImages = useCallback(
    async (ignoreSmall: boolean = true) => {
      if (!file || !pdfDoc) return;

      setProgress((p) => ({ ...p, status: "scanning", imagesFound: 0, currentPage: 0 }));

      try {
        const totalPages = pdfDoc.numPages;

        setProgress((p) => ({ ...p, totalPages }));

        const zip = new JSZip();
        let imagesExtracted = 0;
        const newExtractedImages: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
          setProgress((p) => ({ ...p, currentPage: i }));
          const page = await pdfDoc.getPage(i);
          const ops = await page.getOperatorList();
          
          for (let j = 0; j < ops.fnArray.length; j++) {
            const fn = ops.fnArray[j];
            // Look for image drawing operations
            if (
              fn === pdfjsLib.OPS.paintImageXObject ||
              fn === pdfjsLib.OPS.paintInlineImageXObject
            ) {
              const objId = ops.argsArray[j][0];
              try {
                const image = await page.objs.get(objId);
                if (!image) continue;

                // Handle ImageBitmap (modern pdf.js approach for many images)
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                if (!ctx) continue;

                let width = image.width;
                let height = image.height;
                let isValid = false;

                if (image.bitmap instanceof ImageBitmap) {
                  width = image.bitmap.width;
                  height = image.bitmap.height;
                  
                  if (ignoreSmall && (width < 100 || height < 100)) continue;

                  canvas.width = width;
                  canvas.height = height;
                  ctx.drawImage(image.bitmap, 0, 0);
                  isValid = true;
                } else if (image.data && image.data.length > 0) {
                  // Fallback for raw pixel data
                  if (ignoreSmall && (width < 100 || height < 100)) continue;

                  canvas.width = width;
                  canvas.height = height;
                  const imageData = new ImageData(
                    new Uint8ClampedArray(image.data),
                    width,
                    height
                  );
                  ctx.putImageData(imageData, 0, 0);
                  isValid = true;
                }

                if (isValid) {
                  // Convert canvas to blob
                  const blob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob((b) => resolve(b), "image/png");
                  });

                  if (blob) {
                    imagesExtracted++;
                    
                    const imgUrl = URL.createObjectURL(blob);
                    newExtractedImages.push(imgUrl);
                    
                    // Pad numbers nicely (e.g., page_01_img_001.png)
                    const pNum = String(i).padStart(3, "0");
                    const iNum = String(imagesExtracted).padStart(3, "0");
                    zip.file(`page_${pNum}_img_${iNum}.png`, blob);
                    setProgress((p) => ({ ...p, imagesFound: imagesExtracted }));
                  }
                }
              } catch (err) {
                console.warn(`Could not extract image object ${objId} on page ${i}`, err);
              }
            }
          }
          // Cleanup to free memory
          page.cleanup();
        }

        if (imagesExtracted === 0) {
          toast.info("No images found in this PDF.");
          setProgress((p) => ({ ...p, status: "done" }));
          return;
        }

        setProgress((p) => ({ ...p, status: "zipping" }));
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setZipUrl(url);
        setExtractedImages(newExtractedImages);
        
        setProgress((p) => ({ ...p, status: "done" }));
        toast.success(`Successfully extracted ${imagesExtracted} images!`);
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while extracting images.");
        setProgress((p) => ({ ...p, status: "error" }));
      }
    },
    [file, pdfDoc]
  );

  return {
    file,
    pdfDoc,
    progress,
    zipUrl,
    extractedImages,
    loadFile,
    reset,
    extractImages,
  };
}
