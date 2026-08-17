"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { tools, CATEGORIES, CATEGORY_LABELS } from "@/features/tools/tool-registry";
import { cn } from "@/lib/utils";

/**
 * Mobile hamburger menu: every tool grouped by category. Planned tools
 * render disabled with a "Soon" tag.
 */
export function MobileMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Open menu" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ad-Pass Toolkit</SheetTitle>
          <SheetDescription>All tools — processed locally in your browser.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          {CATEGORIES.map((category) => {
            const categoryTools = tools.filter((tool) => tool.category === category);
            if (categoryTools.length === 0) return null;
            return (
              <div key={category}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="flex flex-col gap-1">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    const href = `/tools/${tool.slug}`;
                    const isActive = pathname === href;

                    if (tool.planned) {
                      return (
                        <div
                          key={tool.slug}
                          className="flex items-center gap-3 rounded-lg p-2.5 text-sm text-muted-foreground/60"
                        >
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1 truncate">{tool.name}</span>
                          <span className="text-[10px] font-medium uppercase tracking-wide">
                            Soon
                          </span>
                        </div>
                      );
                    }

                    return (
                      <SheetClose asChild key={tool.slug}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors hover:bg-accent",
                            isActive && "bg-brand/10 font-medium text-brand hover:bg-brand/15"
                          )}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="flex-1 truncate">{tool.name}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}