import { useCallback, useEffect, useState } from 'react'
import { EDITS_DB_NAME, EDITS_DB_VERSION, EDITS_STORE_NAME } from '../constants'

export interface UserEdit {
  name: string
  editedAt: number
}

type EditsMap = Record<number, UserEdit>

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(EDITS_DB_NAME, EDITS_DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(EDITS_STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readAllEdits(): Promise<EditsMap> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const store = db.transaction(EDITS_STORE_NAME, 'readonly').objectStore(EDITS_STORE_NAME)
      const result: EditsMap = {}
      const cursorRequest = store.openCursor()
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result
        if (!cursor) {
          resolve(result)
          return
        }
        result[Number(cursor.key)] = cursor.value as UserEdit
        cursor.continue()
      }
      cursorRequest.onerror = () => reject(cursorRequest.error)
    })
  } finally {
    db.close()
  }
}

async function writeEdit(id: number, edit: UserEdit): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(EDITS_STORE_NAME, 'readwrite')
      tx.objectStore(EDITS_STORE_NAME).put(edit, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

/**
 * Local name edits, persisted in IndexedDB keyed by user id so they survive
 * a reload independently of whatever the API returns.
 */
export function useUserEdits() {
  const [edits, setEdits] = useState<EditsMap>({})
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    readAllEdits()
      .then((loaded) => {
        if (cancelled) return
        setEdits(loaded)
        setIsReady(true)
      })
      .catch(() => {
        // IndexedDB unavailable (private mode, unsupported) - proceed with no persisted edits
        if (!cancelled) setIsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setName = useCallback((id: number, name: string) => {
    const edit: UserEdit = { name, editedAt: Date.now() }
    setEdits((prev) => ({ ...prev, [id]: edit }))
    writeEdit(id, edit).catch(() => {
      // best-effort persistence; in-memory state still reflects the edit for this session
    })
  }, [])

  return { edits, setName, isReady }
}
