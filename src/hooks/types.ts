import type { ApiUser } from '../api/types'

export interface User extends ApiUser {
  /** Set when this user's name was overridden by a local edit; lets the UI show an "edited" badge. */
  nameEditedAt?: number
}
