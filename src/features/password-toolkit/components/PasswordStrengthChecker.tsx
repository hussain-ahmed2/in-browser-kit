'use client'

import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { InputField } from '@/components/form/input-field'
import { scorePassword } from '../lib/password'
import { StrengthMeter } from './StrengthMeter'

const checkerSchema = z.object({
    password: z.string()
})

type CheckerFormValues = z.infer<typeof checkerSchema>

export function PasswordStrengthChecker() {
    const form = useForm<CheckerFormValues>({
        resolver: zodResolver(checkerSchema),
        defaultValues: { password: '' }
    })

    const watched = useWatch({ control: form.control })
    const password = watched.password ?? ''
    const strength = useMemo(() => scorePassword(password), [password])

    return (
        <FormProvider {...form}>
            <div className="space-y-6">
                <InputField
                    name="password"
                    label="Password to check"
                    type="password"
                    placeholder="Type or paste a password…"
                    description="The check runs entirely on your device — the password is never sent anywhere."
                />

                <StrengthMeter strength={strength} />

                {password && strength.suggestions.length > 0 && (
                    <div className="p-6 rounded-xl bg-secondary/30 border border-border">
                        <p className="text-sm font-medium mb-3">Suggestions</p>
                        <ul className="space-y-2">
                            {strength.suggestions.map((suggestion) => (
                                <li
                                    key={suggestion}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <span className="mt-1.5 size-1.5 rounded-full bg-brand shrink-0" />
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </FormProvider>
    )
}
