"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SignaturePadProps {
  onSave: (dataUrl: string | null) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas | null>(null);
  const fullPadRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFullEmpty, setIsFullEmpty] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);

  const clear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setIsEmpty(true);
      onSave(null);
    }
  };

  const handleEnd = () => {
    if (padRef.current) {
      setIsEmpty(padRef.current.isEmpty());
      const dataUrl = padRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  const clearFull = () => {
    if (fullPadRef.current) {
      fullPadRef.current.clear();
      setIsFullEmpty(true);
    }
  };

  const handleFullEnd = () => {
    if (fullPadRef.current) {
      setIsFullEmpty(fullPadRef.current.isEmpty());
    }
  };

  const saveFull = () => {
    if (fullPadRef.current && !fullPadRef.current.isEmpty()) {
      const dataUrl = fullPadRef.current.toDataURL("image/png");

      // Sync it to the mini pad for visual consistency if possible,
      // but toDataURL is the source of truth for the export
      if (padRef.current) {
        padRef.current.clear(); // Clear first to prevent double signatures overlaying!
        padRef.current.fromDataURL(dataUrl);
        setIsEmpty(false);
      }

      onSave(dataUrl);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Sync mini pad to full pad when opening
      setTimeout(() => {
        if (fullPadRef.current && padRef.current) {
          fullPadRef.current.clear();
          if (!padRef.current.isEmpty()) {
            fullPadRef.current.fromDataURL(padRef.current.toDataURL());
            setIsFullEmpty(false);
          } else {
            setIsFullEmpty(true);
          }
        }
      }, 50);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between max-w-100 px-1">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border border-border bg-transparent p-0"
            title="Pen Color"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Thickness</span>
          <input
            type="range"
            min="1"
            max="10"
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="w-24 cursor-pointer accent-brand"
            title="Pen Thickness"
          />
        </div>
      </div>

      <div
        className="w-full relative bg-white border border-border rounded-xl shadow-sm overflow-hidden"
        style={{ aspectRatio: "2/1", maxWidth: "400px" }}
      >
        <SignatureCanvas
          ref={padRef}
          penColor={penColor}
          minWidth={penWidth / 2}
          maxWidth={penWidth * 1.5}
          canvasProps={{
            width: 400,
            height: 200,
            className: "w-full h-full cursor-crosshair touch-none",
          }}
          onEnd={handleEnd}
        />
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/40 font-medium">
            Sign here
          </div>
        )}
      </div>

      <div className="flex w-full justify-between max-w-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={isEmpty}
          className="text-muted-foreground"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl flex flex-col items-center">
            <DialogHeader className="w-full">
              <DialogTitle>Draw Signature</DialogTitle>
            </DialogHeader>

            <div className="flex w-full items-center justify-between max-w-200 px-1 mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-border bg-transparent p-0"
                  title="Pen Color"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Thickness</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-32 cursor-pointer accent-brand"
                  title="Pen Thickness"
                />
              </div>
            </div>
            <div
              className="w-full max-w-200 relative bg-white border border-border rounded-xl shadow-sm overflow-hidden"
              style={{ aspectRatio: "2/1" }}
            >
              <SignatureCanvas
                ref={fullPadRef}
                penColor={penColor}
                minWidth={penWidth / 2}
                maxWidth={penWidth * 1.5}
                canvasProps={{
                  width: 800,
                  height: 400,
                  className: "w-full h-full cursor-crosshair touch-none",
                }}
                onEnd={handleFullEnd}
              />
              {isFullEmpty && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/40 text-lg font-medium">
                  Sign here
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={clearFull}
                disabled={isFullEmpty}
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={saveFull} disabled={isFullEmpty}>
                Save Signature
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
