import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getToolBySlug } from '../tool-registry'
import { cn } from '@/lib/utils'

interface ToolPageProps {
    slug: string
    children: React.ReactNode
    title?: string
    tagline?: string
    maxWidth?: '3xl' | '4xl'
}

/**
 * Shared layout for every tool route: breadcrumb, centered icon header,
 * and a vertical rhythm (`space-y-8`) that the step indicator + card sit in.
 * Title/tagline default to the tool registry entry so pages stay thin.
 */
export function ToolPage({
    slug,
    children,
    title,
    tagline,
    maxWidth = '3xl'
}: ToolPageProps) {
    const tool = getToolBySlug(slug)
    const Icon = tool?.icon

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto">
                <Breadcrumbs items={[{ label: title ?? tool?.name ?? slug }]} />
            </div>
            <main
                className={cn(
                    'mx-auto space-y-8',
                    maxWidth === '3xl' ? 'max-w-3xl' : 'max-w-4xl'
                )}
            >
                <header className="text-center space-y-4">
                    {Icon && (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-brand/25 to-glow/15 text-brand ring-1 ring-brand/25 shadow-[0_0_32px_-8px] shadow-brand/50 mb-4 animate-fade-in-up stagger-1">
                            <Icon size={32} aria-hidden="true" />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold tracking-tight animate-fade-in-up stagger-2">
                        {title ?? tool?.name}
                    </h1>
                    <p className="text-muted-foreground text-lg animate-fade-in-up stagger-3">
                        {tagline ?? tool?.tagline}
                    </p>
                </header>
                {children}
            </main>
        </div>
    )
}
