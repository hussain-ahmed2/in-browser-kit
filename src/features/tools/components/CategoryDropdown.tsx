'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FileText,
    Image as ImageIcon,
    ShieldCheck,
    Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import {
    getToolsByCategory,
    CATEGORY_LABELS,
    type ToolCategory,
    type ToolDefinition
} from '@/features/tools/tool-registry'
import { ToolIcon } from '@/components/ToolIcon'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number | string }>> = {
    PDF: FileText,
    Images: ImageIcon,
    Security: ShieldCheck,
    Utilities: Wrench
}

interface CategoryDropdownProps {
    category: ToolCategory
}

/**
 * Header navigation for one tool category, built on the shadcn NavigationMenu.
 * Tools come from the registry; planned (unshipped) tools render disabled.
 */
export function CategoryDropdown({ category }: CategoryDropdownProps) {
    const pathname = usePathname()
    const categoryTools = getToolsByCategory(category)
    const CategoryIcon = CATEGORY_ICONS[category]
    const isActive = categoryTools.some(
        (tool) => pathname === `/tools/${tool.slug}`
    )

    if (categoryTools.length === 0) return null

    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger
                        className={cn(
                            'gap-2 rounded-full',
                            isActive &&
                                'bg-brand/10 text-brand hover:bg-brand/15 focus:bg-brand/15'
                        )}
                    >
                        <CategoryIcon className="size-3.5" aria-hidden="true" />
                        <span className="hidden md:inline">
                            {CATEGORY_LABELS[category]}
                        </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="p-1.5 w-80 gap-2 md:w-100">
                        <ul className="flex flex-col gap-0.5">
                            {categoryTools.map((tool) => {
                                const href = `/tools/${tool.slug}`

                                if (tool.planned) {
                                    return (
                                        <li
                                            key={tool.slug}
                                            className="flex items-center gap-2.5 rounded-md p-2 text-sm text-muted-foreground/60"
                                        >
                                            <ToolIcon name={tool.icon} className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="flex-1 truncate">
                                                {tool.name}
                                            </span>
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Soon
                                            </span>
                                        </li>
                                    )
                                }

                                return (
                                    <CategoryListItem
                                        key={tool.slug}
                                        tool={tool}
                                        isActive={pathname === href}
                                    />
                                )
                            })}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

interface CategoryListItemProps {
    tool: ToolDefinition
    isActive: boolean
}

function CategoryListItem({ tool, isActive }: CategoryListItemProps) {
    return (
        <li>
            <NavigationMenuLink
                asChild
                className={cn(
                    'p-2',
                    isActive && 'bg-brand/10 text-brand hover:bg-brand/15'
                )}
            >
                <Link href={`/tools/${tool.slug}`}>
                    <ToolIcon name={tool.icon} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="leading-none font-medium">
                            {tool.name}
                        </span>
                        <span className="line-clamp-2 text-muted-foreground">
                            {tool.tagline}
                        </span>
                    </span>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}