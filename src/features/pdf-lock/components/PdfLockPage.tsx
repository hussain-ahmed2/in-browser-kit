'use client'

import { toast } from 'sonner'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { StepIndicator } from '@/components/StepIndicator'
import { PdfResult } from '@/features/pdf-tools/components/PdfResult'
import { PdfUploader } from '@/features/pdf-tools/components/PdfUploader'
import { genId } from '@/lib/id'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
    clearAll,
    fileSelected,
    fileReplaced,
    userPasswordSet,
    ownerPasswordSet,
    unlockPasswordSet,
    permissionsSet,
    encryptionDetected,
    modeSet,
    selectLockConfig,
    selectLockIsProcessing,
    selectLockItem,
    selectLockResultUrl,
    lockPdf,
    unlockPdf
} from '../pdfLockSlice'
import { LockUnlockWorkspace } from './LockUnlockWorkspace'
import { createRunner } from '../pdfLockSlice'

const steps = [
    { label: 'Upload' },
    { label: 'Configure' },
    { label: 'Download' }
]

export function PdfLockPage() {
    const dispatch = useAppDispatch()
    const item = useAppSelector(selectLockItem)
    const config = useAppSelector(selectLockConfig)
    const resultUrl = useAppSelector(selectLockResultUrl)
    const isProcessing = useAppSelector(selectLockIsProcessing)

    const currentStep = resultUrl ? 2 : item ? 1 : 0

    const handleFileSelect = (file: File) => {
        dispatch(fileSelected({ id: genId(), file }))
    }

    const handleModeChange = (mode: 'lock' | 'unlock') => {
        dispatch(modeSet(mode))
    }

    const handleUserPasswordChange = (password: string) => {
        dispatch(userPasswordSet(password))
    }

    const handleOwnerPasswordChange = (password: string) => {
        dispatch(ownerPasswordSet(password))
    }

    const handleUnlockPasswordChange = (password: string) => {
        dispatch(unlockPasswordSet(password))
    }

    const handlePermissionsChange = (permissions: Partial<{
        printing: boolean
        modifying: boolean
        copying: boolean
    }>) => {
        dispatch(permissionsSet(permissions))
    }

    const handleUnlockAndPreview = async (password: string) => {
        if (!item) return

        const runner = await createRunner()

        const input = await item.file.arrayBuffer()

        const result = await runner.runOne({
            input,
            args: ['--decrypt', `--password=${password}`, 'input.pdf', 'output.pdf'],
            outputName: 'output.pdf'
        })

        await runner.destroy()

        const blob = new Blob([new Uint8Array(result)], { type: 'application/pdf' })

        dispatch(fileReplaced({ id: genId(), file: new File([blob], item.file.name, { type: 'application/pdf' }) }))
        dispatch(encryptionDetected(false))
        dispatch(unlockPasswordSet(password))
    }

    const handleSubmit = async () => {
        if (!item) return

        const hasPassword = config.mode === 'unlock'
            ? config.unlockPassword.length > 0
            : config.userPassword.length > 0

        if (!hasPassword) {
            toast.error('Please enter a password.')
            return
        }

        try {
            if (config.mode === 'unlock') {
                await dispatch(unlockPdf()).unwrap()
                toast.success('PDF unlocked successfully!')
            } else {
                await dispatch(lockPdf()).unwrap()
                toast.success('PDF locked successfully!')
            }
        } catch (error: unknown) {
            console.error('Lock/Unlock failed:', error)
            toast.error(
                config.mode === 'lock'
                    ? 'Error locking the PDF. It might be corrupt.'
                    : 'Error unlocking the PDF. The password might be incorrect.'
            )
        }
    }

    const isUnlock = config.mode === 'unlock'

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Lock / Unlock PDF</CardTitle>
                    <CardDescription>
                        Protect a PDF with a password or remove its protection.
                        Everything happens on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!item ? (
                        <PdfUploader
                            onFileSelect={handleFileSelect}
                            hint="Choose a PDF to protect or unlock"
                        />
                    ) : resultUrl ? (
                        <PdfResult
                            url={resultUrl}
                            title={isUnlock ? 'Unlock Complete!' : 'Lock Complete!'}
                            description={
                                isUnlock
                                    ? 'Your unlocked PDF is ready to download.'
                                    : 'Your protected PDF is ready to download.'
                            }
                            defaultFilename={
                                isUnlock ? 'Unlocked_PDF' : 'Locked_PDF'
                            }
                            buttonLabel={
                                isUnlock
                                    ? 'Download Unlocked PDF'
                                    : 'Download Locked PDF'
                            }
                            onStartOver={() => dispatch(clearAll())}
                        />
                    ) : (
                        <LockUnlockWorkspace
                            item={item}
                            config={config}
                            isProcessing={isProcessing}
                            onModeChange={handleModeChange}
                            onUserPasswordChange={handleUserPasswordChange}
                            onOwnerPasswordChange={handleOwnerPasswordChange}
                            onUnlockPasswordChange={handleUnlockPasswordChange}
                            onPermissionsChange={handlePermissionsChange}
                            onClear={() => dispatch(clearAll())}
                            onSubmit={handleSubmit}
                            onUnlockAndPreview={handleUnlockAndPreview}
                            onEncryptionDetected={(encrypted: boolean) => dispatch(encryptionDetected(encrypted))}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    )
}