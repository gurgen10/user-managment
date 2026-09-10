import { Link } from 'react-router-dom'
import type { User } from '../hooks/types'

interface UserTableRowProps {
  user: User
}

export default function UserTableRow({ user }: UserTableRowProps) {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <tr className="hover:bg-ink-100">
      <td className="px-4 py-4">
        <Link to={`/users/${user.id}`} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-600">
            {initials}
          </div>
          <span className="truncate text-sm font-medium text-ink-900">
            {user.name}
            {user.nameEditedAt && (
              <span className="ml-2 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-normal text-accent-600">
                edited
              </span>
            )}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-sm text-ink-500">{user.email}</td>
      <td className="px-4 py-4 text-sm text-ink-500">{user.address.city}</td>
    </tr>
  )
}
