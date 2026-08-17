"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/use-copy";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  children?: React.ReactNode;
}

export function CopyButton({ value, className, size = "default", children }: CopyButtonProps) {
  const { copied, copy } = useCopy();

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={() => copy(value)}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn("shrink-0", className)}
    >
      {copied ? <Check className="text-success" aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {children}
    </Button>
  );
}