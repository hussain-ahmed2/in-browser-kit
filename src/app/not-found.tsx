import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const metadata: Metadata = {
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
    robots: { index: false, follow: false }
}

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold text-muted-foreground/20 animate-pulse">
                    404
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="text-muted-foreground">
                        The page you&apos;re looking for doesn&apos;t exist or
                        has been moved.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/#tools"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Browse Tools
                    </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{SITE_NAME}</span> —{' '}
                    {SITE_TAGLINE}
                </p>
            </div>
        </div>
    )
}
