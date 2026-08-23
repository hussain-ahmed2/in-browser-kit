"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { tools, CATEGORIES, getToolIcon } from "@/features/tools/tool-registry";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Listen for a custom event so other components (like Header) can open it
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-global-search", handleOpen);
    return () => window.removeEventListener("open-global-search", handleOpen);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search all tools..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {CATEGORIES.map((category) => {
            const categoryTools = tools.filter(
              (t) => t.category === category && !t.planned,
            );
            if (categoryTools.length === 0) return null;

            return (
              <CommandGroup key={category} heading={category}>
                {categoryTools.map((tool) => {
                  const Icon = getToolIcon(tool.icon);
                  return (
                    <CommandItem
                      key={tool.slug}
                      value={`${tool.name} ${tool.tagline} ${tool.category}`}
                      onSelect={() => {
                        runCommand(() => router.push(`/tools/${tool.slug}`));
                      }}
                      className="flex items-center gap-2"
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="whitespace-nowrap">{tool.name}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline-block ml-2 truncate">
                        {tool.tagline}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
