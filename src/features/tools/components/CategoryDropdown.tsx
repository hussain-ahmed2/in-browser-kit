"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  getToolsByCategory,
  CATEGORY_LABELS,
  type ToolCategory,
} from "@/features/tools/tool-registry";

const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  PDF: FileText,
  Images: ImageIcon,
  Security: ShieldCheck,
  Utilities: Wrench,
};

interface CategoryDropdownProps {
  category: ToolCategory;
}

/**
 * Header navigation for one tool category, built on the shadcn NavigationMenu.
 * Tools come from the registry; planned (unshipped) tools render disabled.
 */
export function CategoryDropdown({ category }: CategoryDropdownProps) {
  const pathname = usePathname();
  const categoryTools = getToolsByCategory(category);
  const Icon = CATEGORY_ICONS[category];
  const isActive = categoryTools.some((tool) => pathname === `/tools/${tool.slug}`);

  if (categoryTools.length === 0) return null;

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "gap-2 rounded-full",
              isActive && "bg-brand/10 text-brand hover:bg-brand/15 focus:bg-brand/15"
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span className="hidden md:inline">{CATEGORY_LABELS[category]}</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-64 p-1.5">
            {categoryTools.map((tool) => {
              const ToolIcon = tool.icon;
              const href = `/tools/${tool.slug}`;
              const isToolActive = pathname === href;

              if (tool.planned) {
                return (
                  <div
                    key={tool.slug}
                    className="flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground/60"
                  >
                    <ToolIcon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{tool.name}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <NavigationMenuLink key={tool.slug} asChild>
                  <Link
                    href={href}
                    className={cn(
                      "gap-2.5",
                      isToolActive && "bg-brand/10 text-brand hover:bg-brand/15"
                    )}
                  >
                    <ToolIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 truncate">{tool.name}</span>
                  </Link>
                </NavigationMenuLink>
              );
            })}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}