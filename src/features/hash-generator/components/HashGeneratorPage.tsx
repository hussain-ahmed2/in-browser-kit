'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CheckboxField } from '@/components/form/checkbox-field'
import { CopyButton } from '@/components/CopyButton'
import { SelectField } from '@/components/form/select-field'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Field,
    FieldDescription,
    FieldLabel
} from '@/components/ui/field'
import {
    HASH_ALGORITHMS,
    HASH_BIT_SIZES,
    hashText,
    hashTextBase64
} from '../lib/hash'

const hashSchema = z.object({
    text: z.string(),
    algorithm: z.enum(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']),
    asBase64: z.boolean()
})

type HashFormValues = z.infer<typeof hashSchema>

const textareaClasses =
    'w-full min-h-28 resize-y rounded-lg border border-input bg-transparent p-2.5 text-sm font-mono transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

export function HashGeneratorPage() {
    const [output, setOutput] = useState('')

    const form = useForm<HashFormValues>({
        resolver: zodResolver(hashSchema),
        defaultValues: {
            text: '',
            algorithm: 'SHA-256',
            asBase64: false
        }
    })

    const watched = useWatch({ control: form.control })
    const text = watched.text ?? ''
    const algorithm = watched.algorithm ?? 'SHA-256'
    const asBase64 = watched.asBase64 ?? false

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (!text) {
                setOutput('')
                return
            }
            const digest = asBase64
                ? hashTextBase64(algorithm, text)
                : hashText(algorithm, text)
            void digest.then(setOutput)
        }, 120)

        return () => window.clearTimeout(timeout)
    }, [text, algorithm, asBase64])

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle>Hash Text</CardTitle>
                <CardDescription>
                    Create a checksum from any text with SHA-1, SHA-256,
                    SHA-384, or SHA-512. Runs locally — nothing leaves your
                    browser.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormProvider {...form}>
                    <div className="space-y-8">
                        <Controller
                            name="text"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        Input text
                                    </FieldLabel>
                                    <textarea
                                        id={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Type or paste text to hash…"
                                        className={textareaClasses}
                                    />
                                    <FieldDescription>
                                        Hashing happens with the Web Crypto API
                                        on your device — nothing is uploaded.
                                    </FieldDescription>
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                            <SelectField
                                name="algorithm"
                                label="Algorithm"
                                options={HASH_ALGORITHMS.map((algo) => ({
                                    label: `${algo} (${HASH_BIT_SIZES[algo]} bits)`,
                                    value: algo
                                }))}
                            />
                            <div className="sm:pb-1">
                                <CheckboxField
                                    name="asBase64"
                                    label="Base64 output"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center justify-between">
                                <FieldLabel className="text-sm">
                                    Output
                                </FieldLabel>
                                <CopyButton value={output} size="xs">
                                    Copy
                                </CopyButton>
                            </div>
                            <textarea
                                readOnly
                                value={output}
                                aria-label="Hash output"
                                placeholder="The hash will appear here as you type."
                                className={textareaClasses}
                            />
                            {text && (
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                                    {text.length} characters
                                    <ArrowRight
                                        size={12}
                                        aria-hidden="true"
                                        className="text-brand"
                                    />
                                    {asBase64
                                        ? `${Math.ceil(
                                              HASH_BIT_SIZES[algorithm] / 6
                                          )} base64 characters`
                                        : `${HASH_BIT_SIZES[algorithm] / 4} hex characters`}
                                </p>
                            )}
                        </div>
                    </div>
                </FormProvider>
            </CardContent>
        </Card>
    )
}
