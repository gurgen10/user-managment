import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchUsers } from '../api/users'
import type { ApiUser } from '../api/types'
import { useUserEdits, type UserEdit } from './useUserEdits'
import type { User } from './types'

type Status = 'loading' | 'error' | 'success'

interface FetchState {
  status: Status
  apiUsers: ApiUser[]
  error: string | null
}

const initialState: FetchState = { status: 'loading', apiUsers: [], error: null }

/**
 * Local edits always win over server data - a user who renamed themselves
 * shouldn't see it silently reverted by the next successful fetch.
 */
function mergeUser(apiUser: ApiUser, edit: UserEdit | undefined): User {
  if (!edit) return apiUser
  return { ...apiUser, name: edit.name, nameEditedAt: edit.editedAt }
}

export function useUsers() {
  const [state, setState] = useState<FetchState>(initialState)
  const requestId = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)
  const { edits, setName } = useUserEdits()

  const load = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const id = ++requestId.current

    setState((prev) => ({ ...prev, status: 'loading', error: null }))

    fetchUsers(controller.signal)
      .then((apiUsers) => {
        if (id !== requestId.current) return // a newer request has since started - ignore this stale response
        setState({ status: 'success', apiUsers, error: null })
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setState({
          status: 'error',
          apiUsers: [],
          error: err instanceof Error ? err.message : 'Something went wrong',
        })
      })
  }, [])

  useEffect(() => {
    load()
    return () => controllerRef.current?.abort()
  }, [load])

  const users = useMemo(
    () => state.apiUsers.map((apiUser) => mergeUser(apiUser, edits[apiUser.id])),
    [state.apiUsers, edits],
  )

  return {
    users,
    status: state.status,
    error: state.error,
    retry: load,
    setUserName: setName,
  }
}
