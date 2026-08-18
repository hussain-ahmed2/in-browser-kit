import { describe, expect, it } from 'vitest'
import {
    createTestStore,
    makePdfFile,
    readPdf
} from '@/test/fixtures'
import {
    clearAll,
    fileSelected,
    modeSet,
    userPasswordSet,
    ownerPasswordSet,
    permissionsSet,
    lockPdf,
    unlockPdf,
    buildEncryptArgs
} from '../pdfLockSlice'
import pdfLockReducer from '../pdfLockSlice'

describe('pdfLockSlice reducers', () => {
    it('stores the selected file and resets config', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const state = pdfLockReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file }
        })
        expect(state.item?.id).toBe('1')
        expect(state.config.mode).toBe('lock')
        expect(state.config.userPassword).toBe('')
    })

    it('updates the lock mode', () => {
        let state = pdfLockReducer(undefined, {
            type: modeSet.type,
            payload: 'unlock'
        })
        expect(state.config.mode).toBe('unlock')

        state = pdfLockReducer(state, {
            type: modeSet.type,
            payload: 'lock'
        })
        expect(state.config.mode).toBe('lock')
    })

    it('updates the user password', () => {
        const state = pdfLockReducer(undefined, {
            type: userPasswordSet.type,
            payload: 'secret123'
        })
        expect(state.config.userPassword).toBe('secret123')
    })

    it('updates the owner password', () => {
        const state = pdfLockReducer(undefined, {
            type: ownerPasswordSet.type,
            payload: 'owner456'
        })
        expect(state.config.ownerPassword).toBe('owner456')
    })

    it('updates permissions', () => {
        let state = pdfLockReducer(undefined, {
            type: permissionsSet.type,
            payload: { printing: false, modifying: true }
        })
        expect(state.config.permissions.printing).toBe(false)
        expect(state.config.permissions.modifying).toBe(true)

        state = pdfLockReducer(state, {
            type: permissionsSet.type,
            payload: { copying: true }
        })
        expect(state.config.permissions.copying).toBe(true)
        expect(state.config.permissions.modifying).toBe(true)
    })

    it('resets everything on clearAll', () => {
        let state = pdfLockReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file: new File(['x'], 'a.pdf') }
        })
        state = pdfLockReducer(state, {
            type: modeSet.type,
            payload: 'unlock'
        })
        state = pdfLockReducer(state, {
            type: userPasswordSet.type,
            payload: 'secret'
        })
        state = pdfLockReducer(state, {
            type: clearAll.type,
            payload: undefined
        })
        expect(state.item).toBeNull()
        expect(state.config.mode).toBe('lock')
        expect(state.config.userPassword).toBe('')
        expect(state.resultUrl).toBeNull()
    })
})

describe('buildEncryptArgs', () => {
    it('places restriction flags before the -- separator', () => {
        const args = buildEncryptArgs({
            mode: 'lock',
            userPassword: 'user123',
            ownerPassword: 'owner456',
            unlockPassword: '',
            originalFileWasEncrypted: false,
            permissions: { printing: true, modifying: true, copying: true }
        })
        expect(args).toEqual([
            '--encrypt',
            'user123',
            'owner456',
            '256',
            '--print=full',
            '--modify=all',
            '--extract=y',
            '--',
            'input.pdf',
            'output.pdf'
        ])
    })

    it('uses restricted values when permissions are disabled', () => {
        const args = buildEncryptArgs({
            mode: 'lock',
            userPassword: 'user123',
            ownerPassword: '',
            unlockPassword: '',
            originalFileWasEncrypted: false,
            permissions: { printing: false, modifying: false, copying: false }
        })
        // Empty owner password falls back to the user password.
        expect(args[2]).toBe('user123')
        expect(args).toContain('--print=none')
        expect(args).toContain('--modify=none')
        expect(args).toContain('--extract=n')
    })
})

describe('lockPdf thunk', () => {
    it.skip('locks a PDF with user password only', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 2)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('lock'))
        store.dispatch(userPasswordSet('user123'))

        const result = await store.dispatch(lockPdf())
        expect(result.type).toBe('pdfLock/lockPdf/fulfilled')

        const url = store.getState().pdfLock.resultUrl
        expect(url).not.toBeNull()
    })

    it.skip('locks a PDF with user and owner passwords and permissions', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 2)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('lock'))
        store.dispatch(userPasswordSet('user123'))
        store.dispatch(ownerPasswordSet('owner456'))
        store.dispatch(permissionsSet({ printing: false, modifying: false, copying: false }))

        const result = await store.dispatch(lockPdf())
        expect(result.type).toBe('pdfLock/lockPdf/fulfilled')

        const url = store.getState().pdfLock.resultUrl
        expect(url).not.toBeNull()
    })

    it('rejects when no file is selected', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        store.dispatch(userPasswordSet('user123'))
        const result = await store.dispatch(lockPdf())
        expect(result.type).toBe('pdfLock/lockPdf/rejected')
    })

    it('rejects when no user password is provided', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 1)
        store.dispatch(fileSelected({ id: '1', file }))
        // Real implementation validates password requirement
        const result = await store.dispatch(lockPdf())
        expect(result.type).toBe('pdfLock/lockPdf/rejected')
    })
})

describe('unlockPdf thunk', () => {
    it.skip('unlocks a locked PDF with correct password', async () => {
        // First create a locked PDF
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 2)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('lock'))
        store.dispatch(userPasswordSet('user123'))
        await store.dispatch(lockPdf())

        const lockedUrl = store.getState().pdfLock.resultUrl!
        const lockedBytes = await (await readPdf(lockedUrl)).save()
        const lockedFile = new File([lockedBytes.buffer as ArrayBuffer], 'locked.pdf', {
            type: 'application/pdf'
        })

        // Now unlock it
        const unlockStore = createTestStore({ pdfLock: pdfLockReducer })
        unlockStore.dispatch(fileSelected({ id: '2', file: lockedFile }))
        unlockStore.dispatch(modeSet('unlock'))
        unlockStore.dispatch(userPasswordSet('user123'))

        const result = await unlockStore.dispatch(unlockPdf())
        expect(result.type).toBe('pdfLock/unlockPdf/fulfilled')

        const url = unlockStore.getState().pdfLock.resultUrl
        expect(url).not.toBeNull()
        const output = await readPdf(url!)
        expect(output.getPageCount()).toBe(2)
    })

    it('rejects when no file is selected', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        store.dispatch(modeSet('unlock'))
        store.dispatch(userPasswordSet('user123'))
        const result = await store.dispatch(unlockPdf())
        expect(result.type).toBe('pdfLock/unlockPdf/rejected')
    })

    it('rejects when no password is provided', async () => {
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 1)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('unlock'))
        const result = await store.dispatch(unlockPdf())
        expect(result.type).toBe('pdfLock/unlockPdf/rejected')
    })

    it.skip('rejects with incorrect password', async () => {
        // First create a locked PDF
        const store = createTestStore({ pdfLock: pdfLockReducer })
        const file = await makePdfFile('source.pdf', 1)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('lock'))
        store.dispatch(userPasswordSet('correct'))
        await store.dispatch(lockPdf())

        const lockedUrl = store.getState().pdfLock.resultUrl!
        const lockedBytes = await (await readPdf(lockedUrl)).save()
        const lockedFile = new File([lockedBytes.buffer as ArrayBuffer], 'locked.pdf', {
            type: 'application/pdf'
        })

        // Try to unlock with wrong password
        const unlockStore = createTestStore({ pdfLock: pdfLockReducer })
        unlockStore.dispatch(fileSelected({ id: '2', file: lockedFile }))
        unlockStore.dispatch(modeSet('unlock'))
        unlockStore.dispatch(userPasswordSet('wrong'))

        const result = await unlockStore.dispatch(unlockPdf())
        expect(result.type).toBe('pdfLock/unlockPdf/rejected')
    })
})