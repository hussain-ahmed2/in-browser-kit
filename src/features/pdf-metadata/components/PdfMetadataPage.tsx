"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/FileDropzone";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { usePdfDocument } from "@/features/pdf-tools/lib/usePdfDocument";
import { SinglePagePreview } from "@/features/pdf-tools/components/SinglePagePreview";
import { MetadataForm, type MetadataFormValues } from "./MetadataForm";

export function PdfMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);

  const [extractedMetadata, setExtractedMetadata] = useState<MetadataFormValues>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });

  const { pdf: previewPdf } = usePdfDocument(file);
  const isGeneratingPreview = file !== null && previewPdf === null;

  const handleFileSelect = async (files: File[]) => {
    const validFile = files.find((f) => f.type === "application/pdf");
    if (!validFile) {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setFile(validFile);
    setIsExtracting(true);

    try {
      const arrayBuffer = await validFile.arrayBuffer();
      const loadedPdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(loadedPdf);

      // Extract existing metadata
      setExtractedMetadata({
        title: loadedPdf.getTitle() || "",
        author: loadedPdf.getAuthor() || "",
        subject: loadedPdf.getSubject() || "",
        keywords: loadedPdf.getKeywords() || "",
        creator: loadedPdf.getCreator() || "",
        producer: loadedPdf.getProducer() || "",
      });
      
      toast.success("Metadata extracted!");
    } catch (error) {
      console.error("Failed to load PDF:", error);
      toast.error("Failed to read PDF. It might be encrypted or corrupted.");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (values: MetadataFormValues) => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    try {
      // Update metadata
      if (values.title?.trim()) pdfDoc.setTitle(values.title.trim());
      if (values.author?.trim()) pdfDoc.setAuthor(values.author.trim());
      if (values.subject?.trim()) pdfDoc.setSubject(values.subject.trim());
      if (values.keywords?.trim()) pdfDoc.setKeywords(values.keywords.trim().split(",").map(s => s.trim()));
      if (values.creator?.trim()) pdfDoc.setCreator(values.creator.trim());
      if (values.producer?.trim()) pdfDoc.setProducer(values.producer.trim());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `meta_edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Metadata updated and saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Edit PDF Metadata</CardTitle>
        <CardDescription>View and modify hidden document properties.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFiles={handleFileSelect}
            label="Click or drag and drop your PDF here"
          />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
              <span className="font-medium truncate">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => {
                setFile(null);
                setPdfDoc(null);
              }}>
                Change File
              </Button>
            </div>

            {isExtracting ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p>Extracting metadata...</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* PREVIEW PANE */}
                <div className="flex-1 w-full flex flex-col gap-4">
                  <div className="relative bg-secondary/20 border border-border rounded-xl p-4 min-h-100 flex items-center justify-center">
                    {isGeneratingPreview && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-xl transition-all">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {previewPdf && (
                      <div className="w-full max-w-full mx-auto flex items-center justify-center p-2">
                        <SinglePagePreview pdf={previewPdf} pageNumber={1} />
                      </div>
                    )}
                  </div>
                </div>

                {/* FORM PANE */}
                <MetadataForm
                  defaultValues={extractedMetadata}
                  onSubmit={handleSave}
                  isProcessing={isProcessing}
                  isExtracting={isExtracting}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
