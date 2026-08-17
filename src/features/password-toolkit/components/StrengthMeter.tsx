import { cn } from '@/lib/utils'
import type { StrengthResult } from '../lib/password'

const SCORE_BAR_CLASSES = [
    'bg-destructive',
    'bg-destructive/70',
    'bg-brand/70',
    'bg-brand',
    'bg-success'
]

const LABEL_CLASSES = [
    'text-destructive',
    'text-destructive',
    'text-brand',
    'text-brand',
    'text-success'
]

interface StrengthMeterProps {
    strength: StrengthResult
}

export function StrengthMeter({ strength }: StrengthMeterProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className={cn('font-medium', LABEL_CLASSES[strength.score])}>
                    {strength.label}
                </span>
                <span className="text-muted-foreground tabular-nums">
                    {strength.entropy.toFixed(1)} bits
                </span>
            </div>
            <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={strength.score}
                aria-label="Password strength"
                className="flex gap-1.5"
            >
                {SCORE_BAR_CLASSES.map((barClass, index) => (
                    <div
                        key={index}
                        className={cn(
                            'h-1.5 flex-1 rounded-full transition-colors duration-300',
                            index <= strength.score ? barClass : 'bg-muted'
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
