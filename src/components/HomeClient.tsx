"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Upload,
  Download,
  Search,
} from "lucide-react";
import { ToolCard } from "@/features/tools/components/ToolCard";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type ToolDefinition,
} from "@/features/tools/tool-registry";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FieldGroup, Field } from "@/components/ui/field";

export function HomeClient({
  availableTools,
}: {
  availableTools: ToolDefinition[];
}) {
  const [search, setSearch] = useState("");

  const filteredTools = search
    ? availableTools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.tagline.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()),
      )
    : availableTools;

  return (
    <main className="z-10 flex flex-col items-center text-center container mx-auto px-4 space-y-8 py-12">
      {/* Status badge */}
      <div className="animate-fade-in-up stagger-1">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass border border-brand/25 shadow-[0_0_24px_-8px] shadow-brand/40">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-glow opacity-60 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-glow" />
          </span>
          <span className="text-sm font-medium text-foreground/85">
            All processing happens locally
          </span>
          <Sparkles className="size-3.5 text-brand" />
        </div>
      </div>

      {/* Hero title with shimmer */}
      <h1 className="animate-fade-in-up stagger-2 text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
        <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,var(--foreground)_30%,var(--brand)_50%,var(--glow)_55%,var(--foreground)_75%)] bg-[length:200%_auto] animate-shimmer">
          Your Ultimate
        </span>{" "}
        <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,var(--foreground)_30%,var(--brand)_50%,var(--glow)_55%,var(--foreground)_75%)] bg-[length:200%_auto] animate-shimmer">
          In-Browser Toolkit
        </span>
      </h1>

      <p className="animate-fade-in-up stagger-3 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        Convert videos, manage PDFs, and access essential developer tools
        instantly right in your browser. Zero uploads, infinite privacy, and
        blazing fast speeds.
      </p>

      {/* Hero Search */}
      <div className="w-full max-w-2xl mt-8 animate-fade-in-up stagger-4">
        <FieldGroup>
          <Field>
            <InputGroup className="h-14 rounded-full bg-background/50 backdrop-blur-sm border-brand/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-brand/30 transition-all dark:bg-background/20">
              <InputGroupAddon align="inline-start" className="pl-6">
                <Search className="text-muted-foreground/70" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search for tools (e.g. Convert Video, Merge PDF)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-base"
              />
              <InputGroupAddon align="inline-end" className="pr-6">
                <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </div>

      {/* Tool categories */}
      <div className="w-full mt-12 animate-fade-in-up stagger-5 space-y-12">
        {filteredTools.length === 0 ? (
          <div className="text-muted-foreground py-12">
            No tools found matching &quot;{search}&quot;.
          </div>
        ) : (
          CATEGORIES.map((category) => {
            const categoryTools = filteredTools.filter(
              (t) => t.category === category,
            );
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="space-y-4 text-left">
                <h3 className="text-xl font-bold tracking-tight px-1">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* How It Works */}
      {!search && (
        <div className="w-full max-w-5xl mt-16 animate-fade-in-up stagger-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                label: "Choose a Tool",
                description: "Media conversion, PDF tools, or dev utilities",
                icon: Sparkles,
              },
              {
                step: "2",
                label: "Upload Your File",
                description: "Drag & drop or click to select",
                icon: Upload,
              },
              {
                step: "3",
                label: "Download Result",
                description: "Get your file instantly",
                icon: Download,
              },
            ].map(({ step, label, description, icon: Icon }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full glass ring-1 ring-border text-brand">
                    <Icon className="size-4.5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-brand to-glow/70 text-brand-foreground text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_-2px] shadow-brand/60">
                    {step}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature chips */}
      {!search && (
        <div className="flex flex-wrap justify-center gap-3 mt-12 pt-8 border-t border-border/60 animate-fade-in-up stagger-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass ring-1 ring-yellow-500/20 text-sm text-yellow-600 dark:text-yellow-400">
            <Zap className="size-3.5" /> Lightning Fast
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass ring-1 ring-green-500/25 text-sm text-green-600 dark:text-green-400">
            <ShieldCheck className="size-3.5" /> 100% Secure
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass ring-1 ring-purple-500/25 text-sm text-purple-600 dark:text-purple-400">
            <Sparkles className="size-3.5" /> No Registration
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass ring-1 ring-blue-500/25 text-sm text-blue-600 dark:text-blue-400">
            <Zap className="size-3.5" /> WebAssembly Powered
          </div>
        </div>
      )}
    </main>
  );
}
