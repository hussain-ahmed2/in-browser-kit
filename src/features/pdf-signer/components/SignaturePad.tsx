"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string | null) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

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

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="w-full relative bg-white border border-border rounded-xl shadow-sm overflow-hidden" style={{ aspectRatio: "2/1", maxWidth: "400px" }}>
        <SignatureCanvas
          ref={padRef}
          penColor="black"
          canvasProps={{
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
      
      <div className="flex w-full justify-between max-w-[400px]">
        <Button variant="ghost" size="sm" onClick={clear} disabled={isEmpty} className="text-muted-foreground">
          <Eraser className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
