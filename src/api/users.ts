import { USERS_API_URL } from '../constants'
import type { ApiUser } from './types'

export async function fetchUsers(signal?: AbortSignal): Promise<ApiUser[]> {
  const res = await fetch(USERS_API_URL, { signal })

  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`)
  }

  const data: unknown = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response shape from users API')
  }

  return data as ApiUser[]
}
