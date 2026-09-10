import { describe, expect, it, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { IDBFactory } from 'fake-indexeddb'
import { useUserEdits } from './useUserEdits'

// a fresh in-memory IndexedDB per test, so edits from one test can't leak into another
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

describe('useUserEdits', () => {
  it('starts empty and ready once the (empty) store has been read', async () => {
    const { result } = renderHook(() => useUserEdits())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.edits).toEqual({})
  })

  it('reflects a new edit immediately in memory', async () => {
    const { result } = renderHook(() => useUserEdits())
    await waitFor(() => expect(result.current.isReady).toBe(true))

    act(() => {
      result.current.setName(1, 'Renamed User')
    })

    expect(result.current.edits[1]?.name).toBe('Renamed User')
  })

  it('persists an edit so a fresh hook instance picks it up - simulating a reload', async () => {
    const first = renderHook(() => useUserEdits())
    await waitFor(() => expect(first.result.current.isReady).toBe(true))

    await act(async () => {
      first.result.current.setName(7, 'Persisted Name')
      // setName fires the IndexedDB write and returns immediately; give it a tick to land
      await new Promise((resolve) => setTimeout(resolve, 10))
    })

    const second = renderHook(() => useUserEdits())
    await waitFor(() => expect(second.result.current.isReady).toBe(true))
    expect(second.result.current.edits[7]?.name).toBe('Persisted Name')
  })

  it('keeps edits for different user ids independent', async () => {
    const { result } = renderHook(() => useUserEdits())
    await waitFor(() => expect(result.current.isReady).toBe(true))

    act(() => {
      result.current.setName(1, 'First User')
    })
    act(() => {
      result.current.setName(2, 'Second User')
    })

    expect(result.current.edits[1]?.name).toBe('First User')
    expect(result.current.edits[2]?.name).toBe('Second User')
  })
})
