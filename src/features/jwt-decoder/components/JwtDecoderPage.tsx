'use client'

import { useState, useCallback, useEffect } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Fingerprint,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
    Clock,
    User,
    Globe,
    KeyRound,
    Braces,
    LockKeyhole,
    Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    decodeJwt,
    getClaimSummary,
    getExpiryInfo,
    getJwtAlgorithm,
    getJwtTokenType,
    type JwtDecodeResult
} from '../lib/jwtDecoder'

const EXAMPLE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4ifQ.1dYw1sIXqW7LdYr0yVkVuQtyGqX9VUaZtJf0HkBvLc0'

function JsonBlock({ value }: { value: Record<string, unknown> }) {
    const pretty = JSON.stringify(value, null, 2)
    return (
        <pre className="max-h-72 overflow-auto rounded-lg bg-muted/50 p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all">
            {pretty}
        </pre>
    )
}

function ClaimRow({
    icon,
    label,
    value,
    valueClass
}: {
    icon: React.ReactNode
    label: string
    value: string
    valueClass?: string
}) {
    return (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <span className="mt-0.5 text-muted-foreground">{icon}</span>
            <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {label}
                </div>
                <div className={cn('text-sm font-medium break-all', valueClass)}>{value}</div>
            </div>
        </div>
    )
}

export function JwtDecoderPage() {
    const [token, setToken] = useState('')
    const [decoded, setDecoded] = useState<JwtDecodeResult>({
        header: null,
        payload: null,
        signature: '',
        error: null
    })

    const handleDecode = useCallback((input: string) => {
        setDecoded(decodeJwt(input))
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => handleDecode(token), 150)
        return () => clearTimeout(timer)
    }, [token, handleDecode])

    const summary = getClaimSummary(decoded.payload)
    const expiry = getExpiryInfo(decoded.payload)
    const hasToken = token.trim().length > 0
    const isValid = decoded.error === null && decoded.header !== null

    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle>JWT Decoder</CardTitle>
                <CardDescription>
                    Decode JWT tokens and inspect their claims. Runs locally — nothing is
                    uploaded.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">JWT Token</Label>
                        <button
                            type="button"
                            onClick={() => setToken(EXAMPLE_TOKEN)}
                            className="text-xs font-medium text-brand hover:underline"
                        >
                            Load example
                        </button>
                    </div>
                    <Textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste a JWT token (header.payload.signature)…"
                        className="min-h-[100px] font-mono text-sm"
                    />
                </div>

                {hasToken && decoded.error && (
                    <Alert variant="destructive" className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{decoded.error}</AlertDescription>
                    </Alert>
                )}

                {isValid && (
                    <>
                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Claims Summary</Label>
                                {expiry.status === 'expired' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        {expiry.label}
                                    </span>
                                ) : expiry.status === 'valid' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {expiry.label}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {expiry.label}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <ClaimRow
                                    icon={<KeyRound className="h-4 w-4" />}
                                    label="Algorithm"
                                    value={getJwtAlgorithm(decoded.header)}
                                />
                                <ClaimRow
                                    icon={<Braces className="h-4 w-4" />}
                                    label="Type"
                                    value={getJwtTokenType(decoded.header)}
                                />
                                <ClaimRow
                                    icon={<Globe className="h-4 w-4" />}
                                    label="Issuer (iss)"
                                    value={summary.issuer ?? '—'}
                                />
                                <ClaimRow
                                    icon={<User className="h-4 w-4" />}
                                    label="Subject (sub)"
                                    value={summary.subject ?? '—'}
                                />
                                <ClaimRow
                                    icon={<Fingerprint className="h-4 w-4" />}
                                    label="Audience (aud)"
                                    value={
                                        Array.isArray(summary.audience)
                                            ? summary.audience.join(', ')
                                            : (summary.audience ?? '—')
                                    }
                                />
                                <ClaimRow
                                    icon={<Hash className="h-4 w-4" />}
                                    label="JWT ID (jti)"
                                    value={summary.jwtId ?? '—'}
                                />
                                <ClaimRow
                                    icon={<Clock className="h-4 w-4" />}
                                    label="Issued At (iat)"
                                    value={
                                        summary.issuedAt
                                            ? `${summary.issuedAt} · ${new Date(summary.issuedAt * 1000).toLocaleString()}`
                                            : '—'
                                    }
                                />
                                <ClaimRow
                                    icon={<Clock className="h-4 w-4" />}
                                    label="Not Before (nbf)"
                                    value={
                                        summary.notBefore
                                            ? `${summary.notBefore} · ${new Date(summary.notBefore * 1000).toLocaleString()}`
                                            : '—'
                                    }
                                />
                                <ClaimRow
                                    icon={<LockKeyhole className="h-4 w-4" />}
                                    label="Expires At (exp)"
                                    value={expiry.expiresAtDate ?? '—'}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Header</Label>
                                <CopyButton
                                    value={JSON.stringify(decoded.header, null, 2)}
                                    size="sm"
                                >
                                    Copy
                                </CopyButton>
                            </div>
                            <JsonBlock value={decoded.header!} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Payload</Label>
                                <CopyButton
                                    value={JSON.stringify(decoded.payload, null, 2)}
                                    size="sm"
                                >
                                    Copy
                                </CopyButton>
                            </div>
                            <JsonBlock value={decoded.payload!} />
                        </div>

                        {decoded.signature && (
                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Signature</Label>
                                    <CopyButton value={decoded.signature} size="sm">
                                        Copy
                                    </CopyButton>
                                </div>
                                <pre className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all">
                                    {decoded.signature}
                                </pre>
                            </div>
                        )}

                        <div className="pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setToken('')}
                                className="text-xs"
                            >
                                Clear
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}