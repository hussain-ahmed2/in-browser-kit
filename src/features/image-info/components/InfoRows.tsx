"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InfoRowProps {
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      {icon && <span className="text-muted-foreground size-4">{icon}</span>}
      <span className="text-sm text-muted-foreground min-w-35">{label}</span>
      <span className="text-sm font-medium font-mono text-primary flex-1 break-all">
        {value}
      </span>
    </div>
  );
}

interface CopyableRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export function CopyableRow({ label, value, icon }: CopyableRowProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      {icon && <span className="text-muted-foreground size-4">{icon}</span>}
      <span className="text-sm text-muted-foreground min-w-35">{label}</span>
      <span className="text-sm font-mono text-primary flex-1 break-all">
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={copy}
        className={copied ? "text-green-500" : "text-muted-foreground"}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
