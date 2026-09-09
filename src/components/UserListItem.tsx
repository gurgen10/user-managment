import { Link } from 'react-router-dom'
import type { User } from '../hooks/types'

interface UserListItemProps {
  user: User
}

export default function UserListItem({ user }: UserListItemProps) {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <li>
      <Link
        to={`/users/${user.id}`}
        className="flex items-center gap-4 px-4 py-4 hover:bg-ink-100 focus-visible:bg-ink-100"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-600">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900">
            {user.name}
            {user.nameEditedAt && (
              <span className="ml-2 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-normal text-accent-600">
                edited
              </span>
            )}
          </p>
          <p className="truncate text-sm text-ink-500">{user.email}</p>
        </div>
        <div className="hidden shrink-0 text-sm text-ink-500 sm:block">{user.address.city}</div>
      </Link>
    </li>
  )
}
