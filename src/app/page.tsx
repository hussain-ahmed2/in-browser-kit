import type { Metadata } from 'next';
import { Sparkles, Zap, ShieldCheck, Upload, Download } from 'lucide-react';
import { ToolCard } from '@/features/tools/components/ToolCard';
import { tools } from '@/features/tools/tool-registry';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_TAGLINE,
};

export default function Home() {
  const availableTools = tools.filter((tool) => !tool.planned);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-background overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Layered backdrop: blueprint grid */}
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />

      {/* Glow orbs */}
      <div className="absolute top-[-18%] left-[-8%] w-[45%] h-[45%] bg-brand/20 blur-[130px] rounded-full animate-blob" aria-hidden="true" />
      <div className="absolute bottom-[-18%] right-[-8%] w-[42%] h-[42%] bg-glow/15 blur-[130px] rounded-full animate-blob-delay" aria-hidden="true" />
      <div className="absolute top-[32%] right-[18%] w-[22%] h-[22%] bg-brand/10 blur-[100px] rounded-full animate-blob-delay-2" aria-hidden="true" />

      <main className="z-10 flex flex-col items-center text-center max-w-4xl space-y-8 py-12">
        {/* Status badge */}
        <div className="animate-fade-in-up stagger-1">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass border border-brand/25 shadow-[0_0_24px_-8px] shadow-brand/40">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-glow opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-glow" />
            </span>
            <span className="text-sm font-medium text-foreground/85">All processing happens locally</span>
            <Sparkles className="size-3.5 text-brand" />
          </div>
        </div>

        {/* Hero title with shimmer */}
        <h1 className="animate-fade-in-up stagger-2 text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
          <span
            className="text-transparent bg-clip-text bg-[linear-gradient(110deg,var(--foreground)_30%,var(--brand)_50%,var(--glow)_55%,var(--foreground)_75%)] bg-[length:200%_auto] animate-shimmer"
          >
            Your Ultimate
          </span>{' '}
          <br className="hidden md:block" />
          <span
            className="text-transparent bg-clip-text bg-[linear-gradient(110deg,var(--foreground)_30%,var(--brand)_50%,var(--glow)_55%,var(--foreground)_75%)] bg-[length:200%_auto] animate-shimmer"
          >
            Document Toolkit
          </span>
        </h1>

        <p className="animate-fade-in-up stagger-3 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Compress images and merge PDFs instantly right in your browser.
          Zero uploads, infinite privacy, and blazing fast speeds.
        </p>

        {/* Tool cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mt-8 animate-fade-in-up stagger-4">
          {availableTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        {/* How It Works */}
        <div className="w-full max-w-3xl mt-12 animate-fade-in-up stagger-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", label: "Choose a Tool", description: "Image compression or PDF merging", icon: Sparkles },
              { step: "2", label: "Upload Your File", description: "Drag & drop or click to select", icon: Upload },
              { step: "3", label: "Download Result", description: "Get your file instantly", icon: Download },
            ].map(({ step, label, description, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
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
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature chips */}
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
        </div>
      </main>
    </div>
  );
}
