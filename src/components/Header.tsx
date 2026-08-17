'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'
import { CategoryDropdown } from '@/features/tools/components/CategoryDropdown'
import { MobileMenu } from '@/features/tools/components/MobileMenu'
import { CATEGORIES } from '@/features/tools/tool-registry'

const emptySubscribe = () => () => {}

export function Header() {
    const { theme, setTheme } = useTheme()
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
                    <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-brand to-[color-mix(in_oklab,var(--brand)_55%,var(--glow))] text-brand-foreground shadow-[0_0_16px_-2px] shadow-brand/50 group-hover:shadow-brand/80 transition-shadow duration-300">
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
                    <span className="hidden sm:inline font-bold text-foreground tracking-tight">
                        InBrowser
                    </span>
                </Link>

                <nav className="hidden sm:flex items-center gap-1.5" aria-label="Tools">
                    {CATEGORIES.map((category) => (
                        <CategoryDropdown key={category} category={category} />
                    ))}
                </nav>

                <div className="flex flex-1 items-center justify-end gap-1">
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
                    <div className="sm:hidden">
                        <MobileMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}