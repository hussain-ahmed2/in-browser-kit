import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'

export interface PdfLockItem {
    id: string
    file: File
}

export type LockMode = 'lock' | 'unlock'

export interface LockConfig {
    mode: LockMode
    userPassword: string
    ownerPassword: string
    unlockPassword: string
    originalFileWasEncrypted: boolean
    permissions: {
        printing: boolean
        modifying: boolean
        copying: boolean
    }
}

interface PdfLockState {
    item: PdfLockItem | null
    config: LockConfig
    resultUrl: string | null
    isProcessing: boolean
}

const initialConfig: LockConfig = {
    mode: 'lock',
    userPassword: '',
    ownerPassword: '',
    unlockPassword: '',
    originalFileWasEncrypted: false,
    permissions: {
        printing: true,
        modifying: false,
        copying: false
    }
}

const initialState: PdfLockState = {
    item: null,
    config: initialConfig,
    resultUrl: null,
    isProcessing: false
}

export async function createRunner() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const { createBrowserQpdfRunner } = await import('qpdf-run')
    // Generous timeout: the first run must download and compile the 1.8MB wasm.
    return createBrowserQpdfRunner({
        assetBaseUrl: `${baseUrl}/qpdf/`,
        timeoutMs: 60000
    })
}

export function buildEncryptArgs(config: LockConfig): string[] {
    const { userPassword, ownerPassword, permissions } = config
    const args = [
        '--encrypt',
        userPassword,
        ownerPassword || userPassword,
        '256', // AES-256
        // Restriction options go between the key length and the "--"
        // separator; after "--", only infile/outfile may follow.
        '--print=' + (permissions.printing ? 'full' : 'none'),
        '--modify=' + (permissions.modifying ? 'all' : 'none'),
        '--extract=' + (permissions.copying ? 'y' : 'n'),
        '--',
        'input.pdf',
        'output.pdf'
    ]
    return args
}

export const lockPdf = createAsyncThunk<string, void, { state: RootState }>(
    'pdfLock/lockPdf',
    async (_, { getState, rejectWithValue }) => {
        const { item, config } = getState().pdfLock
        if (!item) return rejectWithValue('No file selected.')
        if (!config.userPassword) return rejectWithValue('User password required.')

        try {
            const runner = await createRunner()

            const input = await item.file.arrayBuffer()
            const args = buildEncryptArgs(config)

            const result = await runner.runOne({
                input,
                args,
                outputName: 'output.pdf'
            })

            await runner.destroy()

            const blob = new Blob([new Uint8Array(result)], { type: 'application/pdf' })
            return URL.createObjectURL(blob)
        } catch (error: unknown) {
            const err = error as { message?: string; stdout?: string[]; stderr?: string[]; exitCode?: number }
            console.error('qpdf lock error:', err.message, err.stdout, err.stderr, err.exitCode)
            return rejectWithValue(err.message || 'Lock failed')
        }
    }
)

export const unlockPdf = createAsyncThunk<string, void, { state: RootState }>(
    'pdfLock/unlockPdf',
    async (_, { getState, rejectWithValue }) => {
        const { item, config } = getState().pdfLock
        if (!item) return rejectWithValue('No file selected.')

        const password = config.unlockPassword || config.userPassword
        if (!password) return rejectWithValue('Password required.')

        try {
            const runner = await createRunner()

            const input = await item.file.arrayBuffer()

            const result = await runner.runOne({
                input,
                args: ['--decrypt', `--password=${password}`, 'input.pdf', 'output.pdf'],
                outputName: 'output.pdf'
            })

            await runner.destroy()

            const blob = new Blob([new Uint8Array(result)], { type: 'application/pdf' })
            return URL.createObjectURL(blob)
        } catch (error: unknown) {
            const err = error as { message?: string; stdout?: string[]; stderr?: string[]; exitCode?: number }
            console.error('qpdf unlock error:', err.message, err.stdout, err.stderr, err.exitCode)
            return rejectWithValue(err.message || 'Unlock failed')
        }
    }
)

const pdfLockSlice = createSlice({
    name: 'pdfLock',
    initialState,
    reducers: {
        fileSelected(state, action: PayloadAction<PdfLockItem>) {
            state.item = action.payload
            state.config = { ...initialConfig }
            state.resultUrl = null
        },
        fileReplaced(state, action: PayloadAction<PdfLockItem>) {
            state.item = action.payload
            state.resultUrl = null
        },
        encryptionDetected(state, action: PayloadAction<boolean>) {
            state.config.originalFileWasEncrypted = action.payload
            // Only set mode on initial detection, don't change mode after decrypt-for-preview
            if (state.config.mode === 'lock') {
                state.config.mode = action.payload ? 'unlock' : 'lock'
            }
        },
        modeSet(state, action: PayloadAction<LockMode>) {
            state.config.mode = action.payload
        },
        userPasswordSet(state, action: PayloadAction<string>) {
            state.config.userPassword = action.payload
        },
        ownerPasswordSet(state, action: PayloadAction<string>) {
            state.config.ownerPassword = action.payload
        },
        unlockPasswordSet(state, action: PayloadAction<string>) {
            state.config.unlockPassword = action.payload
        },
        permissionsSet(
            state,
            action: PayloadAction<{
                printing?: boolean
                modifying?: boolean
                copying?: boolean
            }>
        ) {
            state.config.permissions = {
                ...state.config.permissions,
                ...action.payload
            }
        },
        clearAll(state) {
            state.item = null
            state.config = { ...initialConfig }
            state.resultUrl = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(lockPdf.pending, (state) => { state.isProcessing = true })
            .addCase(lockPdf.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrl = action.payload
            })
            .addCase(lockPdf.rejected, (state) => { state.isProcessing = false })
            .addCase(unlockPdf.pending, (state) => { state.isProcessing = true })
            .addCase(unlockPdf.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrl = action.payload
            })
            .addCase(unlockPdf.rejected, (state) => { state.isProcessing = false })
    }
})

export const {
    fileSelected,
    fileReplaced,
    modeSet,
    userPasswordSet,
    ownerPasswordSet,
    unlockPasswordSet,
    permissionsSet,
    encryptionDetected,
    clearAll
} = pdfLockSlice.actions

export const selectLockItem = (state: RootState) => state.pdfLock.item
export const selectLockConfig = (state: RootState) => state.pdfLock.config
export const selectLockResultUrl = (state: RootState) => state.pdfLock.resultUrl
export const selectLockIsProcessing = (state: RootState) =>
    state.pdfLock.isProcessing

export default pdfLockSlice.reducer