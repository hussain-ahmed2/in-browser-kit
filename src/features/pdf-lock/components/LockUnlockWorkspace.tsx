'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Lock, Unlock, Shield, AlertCircle } from 'lucide-react'
import { PdfPageGrid } from '@/features/pdf-tools/components/PdfPageGrid'
import { usePdfDocument } from '@/features/pdf-tools/lib/usePdfDocument'
import type { PdfLockItem, LockConfig } from '../pdfLockSlice'

interface LockUnlockWorkspaceProps {
    item: PdfLockItem
    config: LockConfig
    isProcessing: boolean
    onModeChange: (mode: 'lock' | 'unlock') => void
    onUserPasswordChange: (password: string) => void
    onOwnerPasswordChange: (password: string) => void
    onUnlockPasswordChange: (password: string) => void
    onPermissionsChange: (
        permissions: Partial<
            Pick<
                LockConfig['permissions'],
                'printing' | 'modifying' | 'copying'
            >
        >
    ) => void
    onClear: () => void
    onSubmit: () => void
    onUnlockAndPreview: (password: string) => Promise<void>
    onEncryptionDetected: (encrypted: boolean) => void
}

export function LockUnlockWorkspace({
    item,
    config,
    isProcessing,
    onModeChange,
    onUserPasswordChange,
    onOwnerPasswordChange,
    onUnlockPasswordChange,
    onPermissionsChange,
    onClear,
    onSubmit,
    onUnlockAndPreview,
    onEncryptionDetected
}: LockUnlockWorkspaceProps) {
    const [userPassword, setUserPassword] = useState(config.userPassword)
    const [ownerPassword, setOwnerPassword] = useState(config.ownerPassword)
    const [permissions, setPermissions] = useState(config.permissions)
    const [unlockPassword, setUnlockPassword] = useState(config.unlockPassword)
    const [isUnlocking, setIsUnlocking] = useState(false)

    const { pdf, error, isEncrypted } = usePdfDocument(item.file)

    useEffect(() => {
        onEncryptionDetected(isEncrypted)
    }, [isEncrypted, onEncryptionDetected])

    if (!pdf && !error && !isEncrypted) {
        return (
            <div className="flex justify-center py-12">
                <Loader2
                    className="animate-spin text-brand"
                    aria-hidden="true"
                />
            </div>
        )
    }

    const handleUserPasswordChange = (value: string) => {
        setUserPassword(value)
        onUserPasswordChange(value)
    }

    const handleOwnerPasswordChange = (value: string) => {
        setOwnerPassword(value)
        onOwnerPasswordChange(value)
    }

    const handleUnlockPasswordChange = (value: string) => {
        setUnlockPassword(value)
        onUnlockPasswordChange(value)
    }

    const handlePermissionChange = (
        key: keyof LockConfig['permissions'],
        checked: boolean
    ) => {
        const newPermissions = { ...permissions, [key]: checked }
        setPermissions(newPermissions)
        onPermissionsChange({ [key]: checked })
    }

    const handleUnlockSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!unlockPassword.trim() || isUnlocking) return

        setIsUnlocking(true)
        try {
            await onUnlockAndPreview(unlockPassword)
        } catch (err) {
            console.error('Unlock failed:', err)
        } finally {
            setIsUnlocking(false)
        }
    }

    const hasLockConfig = userPassword.length > 0
    const hasUnlockConfig = unlockPassword.length > 0

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {item.file.name}
                    </p>
                    {pdf && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {pdf.numPages} page{pdf.numPages === 1 ? '' : 's'}
                        </span>
                    )}
                    {isEncrypted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Shield className="h-3 w-3" aria-hidden="true" />
                            Encrypted
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClear}>
                    Change File
                </Button>
            </div>

            {error && (
                <p className="text-xs text-muted-foreground">
                    Preview unavailable — this PDF may be password-protected or
                    corrupt.
                </p>
            )}

            <Tabs
                value={config.mode}
                onValueChange={(v) => onModeChange(v as 'lock' | 'unlock')}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lock" disabled={isEncrypted}>
                        <Lock aria-hidden="true" />
                        Lock
                        {isEncrypted && (
                            <Shield
                                className="ml-1 h-3 w-3"
                                aria-hidden="true"
                            />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="unlock">
                        <Unlock aria-hidden="true" />
                        Unlock
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lock" className="space-y-4">
                    {isEncrypted ? (
                        <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50 text-center">
                            <AlertCircle
                                className="h-8 w-8 text-amber-600 mx-auto"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-amber-900">
                                This PDF is password protected.
                            </p>
                            <p className="text-xs text-amber-700">
                                Switch to <strong>Unlock</strong> tab to remove
                                protection first.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <Shield
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>PDF is not encrypted</span>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="userPassword"
                                    className="text-sm font-medium"
                                >
                                    User Password (required)
                                </Label>
                                <Input
                                    id="userPassword"
                                    type="password"
                                    value={userPassword}
                                    onChange={(e) =>
                                        handleUserPasswordChange(e.target.value)
                                    }
                                    placeholder="Enter user password"
                                    className="w-full"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="ownerPassword"
                                    className="text-sm font-medium"
                                >
                                    Owner Password (optional)
                                </Label>
                                <Input
                                    id="ownerPassword"
                                    type="password"
                                    value={ownerPassword}
                                    onChange={(e) =>
                                        handleOwnerPasswordChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Leave empty to use user password"
                                    className="w-full"
                                    autoComplete="new-password"
                                />
                                <p className="text-xs text-muted-foreground">
                                    If left empty, the user password will be
                                    used as the owner password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Permissions
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={permissions.printing}
                                            onCheckedChange={(c: boolean) =>
                                                handlePermissionChange(
                                                    'printing',
                                                    c
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            Printing (high quality)
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={permissions.modifying}
                                            onCheckedChange={(c: boolean) =>
                                                handlePermissionChange(
                                                    'modifying',
                                                    c
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            Modifying content
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={permissions.copying}
                                            onCheckedChange={(c: boolean) =>
                                                handlePermissionChange(
                                                    'copying',
                                                    c
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            Copying content
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="unlock" className="space-y-4">
                    {isEncrypted ? (
                        <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm font-medium text-amber-900">
                                        This PDF is password protected.
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Enter the password to unlock and
                                        preview, then remove protection.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleUnlockSubmit}
                                className="space-y-3"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="unlockPassword"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="unlockPassword"
                                        type="password"
                                        value={unlockPassword}
                                        onChange={(e) =>
                                            handleUnlockPasswordChange(e.target.value)
                                        }
                                        placeholder="Enter the PDF password"
                                        className="w-full"
                                        autoComplete="current-password"
                                        disabled={isUnlocking}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isUnlocking || !hasUnlockConfig}
                                    className="w-full sm:w-auto"
                                >
                                    {isUnlocking ? (
                                        <>
                                            <Loader2
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                            Unlocking...
                                        </>
                                    ) : (
                                        <>
                                            <Unlock
                                                aria-hidden="true"
                                            />
                                            Unlock & Preview
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/20 text-center">
                            <Shield
                                className="h-8 w-8 text-green-600 mx-auto"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-green-900">
                                This PDF is not encrypted.
                            </p>
                            <p className="text-xs text-green-700">
                                No password needed. Switch to{' '}
                                <strong>Lock</strong> tab to add protection.
                            </p>
                        </div>
                    )}

                    {/* Show preview after successful unlock */}
                    {!isEncrypted && config.mode === 'unlock' && pdf && (
                        <div className="space-y-4 p-4 rounded-lg border border-green-200 bg-green-50">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-900">
                                <Unlock
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>PDF unlocked successfully!</span>
                            </div>
                            <p className="text-xs text-green-700">
                                Preview below. Click{' '}
                                <strong>Unlock & Download</strong> to save the
                                unprotected PDF.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {pdf && (
                <PdfPageGrid
                    pdf={pdf}
                    renderPageActions={(pageNumber) => (
                        <span className="min-w-8 text-center text-xs text-muted-foreground tabular-nums">
                            {pageNumber}
                        </span>
                    )}
                />
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={
                        isProcessing ||
                        (config.mode === 'unlock'
                            ? !hasUnlockConfig
                            : !hasLockConfig)
                    }
                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                    {isProcessing ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            {config.mode === 'unlock'
                                ? 'Unlocking...'
                                : 'Locking...'}
                        </>
                    ) : config.mode === 'unlock' ? (
                        <>
                            <Unlock aria-hidden="true" />
                            Unlock & Download
                        </>
                    ) : (
                        <>
                            <Lock aria-hidden="true" />
                            Lock & Download
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
