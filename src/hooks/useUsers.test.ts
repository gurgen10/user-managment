import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { mergeUser, useUsers } from './useUsers'
import { fetchUsers } from '../api/users'
import type { ApiUser } from '../api/types'
import type { UserEdit } from './useUserEdits'

vi.mock('../api/users', () => ({
  fetchUsers: vi.fn(),
}))

vi.mock('./useUserEdits', () => ({
  useUserEdits: () => ({ edits: {}, setName: vi.fn() }),
}))

const mockedFetchUsers = vi.mocked(fetchUsers)

function makeApiUser(id: number, name: string): ApiUser {
  return {
    id,
    name,
    username: name,
    email: `${name}@example.com`,
    address: { street: '', suite: '', city: 'City', zipcode: '', geo: { lat: '0', lng: '0' } },
    phone: '',
    website: '',
    company: { name: '', catchPhrase: '', bs: '' },
  }
}

describe('mergeUser', () => {
  const apiUser = makeApiUser(1, 'Original Name')

  it('returns the server value unchanged when there is no local edit', () => {
    expect(mergeUser(apiUser, undefined)).toEqual(apiUser)
  })

  it('overrides the name with the local edit and stamps nameEditedAt', () => {
    const edit: UserEdit = { name: 'Edited Name', editedAt: 12345 }
    const merged = mergeUser(apiUser, edit)
    expect(merged.name).toBe('Edited Name')
    expect(merged.nameEditedAt).toBe(12345)
  })

  it('leaves every other field untouched by the edit', () => {
    const edit: UserEdit = { name: 'Edited Name', editedAt: 1 }
    const merged = mergeUser(apiUser, edit)
    expect(merged.email).toBe(apiUser.email)
    expect(merged.address).toEqual(apiUser.address)
  })
})

describe('useUsers - stale response race guard', () => {
  beforeEach(() => {
    mockedFetchUsers.mockReset()
  })

  it('drops a slow first response that resolves after a faster retry has already succeeded', async () => {
    let resolveFirst: (users: ApiUser[]) => void = () => {}
    const firstCall = new Promise<ApiUser[]>((resolve) => {
      resolveFirst = resolve
    })

    mockedFetchUsers.mockImplementationOnce(() => firstCall)
    mockedFetchUsers.mockImplementationOnce(() => Promise.resolve([makeApiUser(2, 'Second')]))

    const { result } = renderHook(() => useUsers())

    await waitFor(() => expect(mockedFetchUsers).toHaveBeenCalledTimes(1))
    expect(result.current.status).toBe('loading')

    act(() => {
      result.current.retry()
    })

    await waitFor(() => expect(mockedFetchUsers).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.users.map((u) => u.id)).toEqual([2])

    // the stale first request finally resolves - it must not overwrite the newer state
    await act(async () => {
      resolveFirst([makeApiUser(1, 'First')])
      await Promise.resolve()
    })

    expect(result.current.users.map((u) => u.id)).toEqual([2])
  })

  it('surfaces a rejected request as an error state', async () => {
    mockedFetchUsers.mockImplementationOnce(() => Promise.reject(new Error('Server responded with 500')))

    const { result } = renderHook(() => useUsers())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Server responded with 500')
    expect(result.current.users).toEqual([])
  })
})
