'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Image, FileDown } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const emptySubscribe = () => () => {}

const navLinks = [
    { href: '/tools/image-compressor', label: 'Image Compressor', icon: Image },
    { href: '/tools/pdf-merger', label: 'PDF Merger', icon: FileDown }
]

export function Header() {
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()
    // True only after hydration, without setState-in-effect
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    )

    const toggleTheme = () => {
        if (theme === 'dark') setTheme('light')
        else if (theme === 'light') setTheme('system')
        else setTheme('dark')
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-xl border-b border-border/60 shadow-sm shadow-black/5">
            {/* Bottom glow line */}
            <div
                className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand/40 to-transparent"
                aria-hidden="true"
            />

            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-6">
                <Link href="/" className="mr-8 flex items-center gap-2.5 group">
                    <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-[color-mix(in_oklab,var(--brand)_55%,var(--glow))] text-brand-foreground shadow-[0_0_16px_-2px] shadow-brand/50 group-hover:shadow-brand/80 transition-shadow duration-300">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                        >
                            <path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2Z" />
                        </svg>
                    </span>
                    <span className="font-bold text-foreground tracking-tight">
                        Ad-Pass<span className="text-brand"> Toolkit</span>
                    </span>
                </Link>

                <nav className="hidden sm:flex items-center gap-1.5">
                    {navLinks.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="rounded-full"
                            >
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn(
                                        'gap-2 text-sm rounded-full',
                                        isActive &&
                                            'font-medium ring-1 ring-brand/30 bg-brand/10 text-brand hover:bg-brand/15'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex flex-1 items-center justify-end gap-1">
                    <nav className="flex items-center gap-1 sm:hidden">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href
                            return (
                                <Link key={href} href={href}>
                                    <Button
                                        variant={
                                            isActive ? 'secondary' : 'ghost'
                                        }
                                        size="icon-sm"
                                        aria-label={label}
                                        className={cn(
                                            'rounded-full',
                                            isActive &&
                                                'ring-1 ring-brand/30 bg-brand/10 text-brand'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="rounded-full"
                        >
                            {theme === 'dark' ? (
                                <Moon className="h-4 w-4" />
                            ) : theme === 'light' ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Monitor className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
