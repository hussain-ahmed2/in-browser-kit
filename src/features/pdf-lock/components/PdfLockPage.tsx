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
    userPasswordSet,
    ownerPasswordSet,
    permissionsSet,
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

    const handleUserPasswordChange = (password: string) => {
        dispatch(userPasswordSet(password))
    }

    const handleOwnerPasswordChange = (password: string) => {
        dispatch(ownerPasswordSet(password))
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
        const decryptedUrl = URL.createObjectURL(blob)

        dispatch(fileSelected({ id: genId(), file: new File([blob], item.file.name, { type: 'application/pdf' }) }))
    }

    const handleSubmit = async () => {
        if (!item) return

        if (config.userPassword.length === 0) {
            toast.error('Please enter a user password.')
            return
        }

        try {
            await dispatch(lockPdf()).unwrap()
            toast.success('PDF locked successfully!')
        } catch (error: unknown) {
            console.error('Lock failed:', error)
            toast.error('Error locking the PDF. It might be corrupt.')
        }
    }

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
                            title={config.userPassword ? 'Unlock Complete!' : 'Lock Complete!'}
                            description={
                                config.userPassword
                                    ? 'Your unlocked PDF is ready to download.'
                                    : 'Your protected PDF is ready to download.'
                            }
                            defaultFilename={
                                config.userPassword ? 'Unlocked_PDF' : 'Locked_PDF'
                            }
                            buttonLabel={
                                config.userPassword
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
                            onUserPasswordChange={handleUserPasswordChange}
                            onOwnerPasswordChange={handleOwnerPasswordChange}
                            onPermissionsChange={handlePermissionsChange}
                            onClear={() => dispatch(clearAll())}
                            onSubmit={handleSubmit}
                            onUnlockAndPreview={handleUnlockAndPreview}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    )
}