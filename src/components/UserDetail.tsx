import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUsers } from '../hooks/useUsers'
import EditableName from './EditableName'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { users, status, error, retry, setUserName } = useUsers()

  if (status === 'loading') {
    return <LoadingState />
  }

  if (status === 'error') {
    return <ErrorState message={error ?? ''} onRetry={retry} />
  }

  const user = users.find((u) => String(u.id) === id)

  if (!user) {
    return (
      <div className="rounded-lg border border-ink-300 bg-white p-6 text-center">
        <p className="text-sm text-ink-700">User not found.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-accent-600 hover:underline cursor-pointer">
          Back to users
        </Link>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-sm font-medium text-accent-600 hover:underline cursor-pointer"
      >
        ← Back
      </button>

      <div className="rounded-lg border border-ink-300 bg-white p-6">
        <EditableName
          name={user.name}
          isEdited={Boolean(user.nameEditedAt)}
          onSave={(name) => setUserName(user.id, name)}
        />

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Website" value={user.website} />
          <Detail label="Company" value={user.company.name} />
          <Detail
            label="Address"
            value={`${user.address.street}, ${user.address.suite}, ${user.address.city} ${user.address.zipcode}`}
          />
        </dl>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm text-ink-900">{value}</dd>
    </div>
  )
}
