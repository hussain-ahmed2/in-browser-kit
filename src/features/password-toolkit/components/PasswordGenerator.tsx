'use client'

import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/form/checkbox-field'
import { CopyButton } from '@/components/CopyButton'
import { Input } from '@/components/ui/input'
import { SliderField } from '@/components/form/slider-field'
import { FieldGroup, FieldSet } from '@/components/ui/field'
import {
    DEFAULT_PASSWORD_OPTIONS,
    generatePassword,
    scorePassword,
    type PasswordOptions
} from '../lib/password'
import { StrengthMeter } from './StrengthMeter'

const generatorSchema = z.object({
    length: z.number().min(8).max(64),
    useLowercase: z.boolean(),
    useUppercase: z.boolean(),
    useDigits: z.boolean(),
    useSymbols: z.boolean(),
    excludeAmbiguous: z.boolean()
})

type GeneratorFormValues = z.infer<typeof generatorSchema>

function passwordOptionsEqual(a: PasswordOptions, b: PasswordOptions): boolean {
    return (
        a.length === b.length &&
        a.useLowercase === b.useLowercase &&
        a.useUppercase === b.useUppercase &&
        a.useDigits === b.useDigits &&
        a.useSymbols === b.useSymbols &&
        a.excludeAmbiguous === b.excludeAmbiguous
    )
}

export function PasswordGenerator() {
    const form = useForm<GeneratorFormValues>({
        resolver: zodResolver(generatorSchema),
        defaultValues: { ...DEFAULT_PASSWORD_OPTIONS }
    })

    const watched = useWatch({ control: form.control })
    const options: PasswordOptions = {
        length: watched.length ?? DEFAULT_PASSWORD_OPTIONS.length,
        useLowercase: watched.useLowercase ?? true,
        useUppercase: watched.useUppercase ?? true,
        useDigits: watched.useDigits ?? true,
        useSymbols: watched.useSymbols ?? true,
        excludeAmbiguous: watched.excludeAmbiguous ?? false
    }

    const [password, setPassword] = useState('')
    const [regenerateToken, setRegenerateToken] = useState(0)
    const [lastChange, setLastChange] = useState<{
        options: PasswordOptions
        token: number
    }>({ options, token: 0 })

    // Adjust state during render (React-endorsed pattern) so a fresh password
    // is generated only when the options actually change or Regenerate is
    // pressed. Keeps the initial render deterministic to avoid hydration
    // mismatches.
    if (
        !passwordOptionsEqual(lastChange.options, options) ||
        lastChange.token !== regenerateToken
    ) {
        setLastChange({ options, token: regenerateToken })
        setPassword(generatePassword(options))
    }

    const strength = useMemo(() => scorePassword(password), [password])

    return (
        <FormProvider {...form}>
            <div className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={password}
                        readOnly
                        aria-label="Generated password"
                        placeholder="Press Regenerate or change an option"
                        className="font-mono"
                    />
                    <CopyButton value={password} size="icon" />
                </div>

                <StrengthMeter strength={strength} />

                <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                    <FieldGroup>
                        <SliderField
                            name="length"
                            label="Length"
                            min={8}
                            max={64}
                            step={1}
                            formatValue={(value) => `${value} chars`}
                        />

                        <FieldSet className="grid grid-cols-1 sm:grid-cols-2">
                            <CheckboxField
                                name="useLowercase"
                                label="Lowercase (a–z)"
                            />
                            <CheckboxField
                                name="useUppercase"
                                label="Uppercase (A–Z)"
                            />
                            <CheckboxField
                                name="useDigits"
                                label="Numbers (0–9)"
                            />
                            <CheckboxField
                                name="useSymbols"
                                label="Symbols (!@#$…)"
                            />
                        </FieldSet>

                        <div className="pt-2">
                            <CheckboxField
                                name="excludeAmbiguous"
                                label="Exclude ambiguous characters (i, l, 1, O, 0, |)"
                            />
                        </div>
                    </FieldGroup>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <Button
                        type="button"
                        onClick={() => setRegenerateToken((token) => token + 1)}
                        className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                        <RefreshCw aria-hidden="true" />
                        Regenerate
                    </Button>
                </div>
            </div>
        </FormProvider>
    )
}
