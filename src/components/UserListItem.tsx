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
    <li className="flex items-center gap-4 px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-600">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
        <p className="truncate text-sm text-ink-500">{user.email}</p>
      </div>
      <div className="hidden shrink-0 text-sm text-ink-500 sm:block">{user.address.city}</div>
    </li>
  )
}
