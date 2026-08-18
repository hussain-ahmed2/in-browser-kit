import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SpotlightCard } from '@/components/SpotlightCard'
import { ToolIcon } from '@/components/ToolIcon'
import type { ToolDefinition } from '@/features/tools/tool-registry'

export function ToolCard({ tool }: { tool: ToolDefinition }) {
    return (
        <Link href={`/tools/${tool.slug}`} className="group text-left">
            <SpotlightCard className="h-full p-6">
                <div className="flex items-start justify-between mb-5">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand/25 to-glow/15 text-brand ring-1 ring-brand/25 group-hover:shadow-[0_0_24px_-4px] group-hover:shadow-brand/50 transition-shadow duration-300">
                        <ToolIcon name={tool.icon} size={24} />
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-1.5">{tool.name}</h3>
                <p className="text-sm text-muted-foreground/85 leading-relaxed">{tool.tagline}</p>
            </SpotlightCard>
        </Link>
    )
}