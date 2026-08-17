import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto max-w-screen-2xl px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>100% Client-Side</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline">No Data Leaves Your Browser</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
            <span>using Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
