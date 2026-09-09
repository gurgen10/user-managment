import { useUsers } from '../hooks/useUsers'
import UserListItem from './UserListItem'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

export default function UserList() {
  const { users, status, error, retry } = useUsers()

  if (status === 'loading') {
    return <LoadingState />
  }

  if (status === 'error') {
    return <ErrorState message={error ?? ''} onRetry={retry} />
  }

  if (users.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-ink-500">No users found.</p>
  }

  return (
    <ul className="divide-y divide-ink-300">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  )
}
