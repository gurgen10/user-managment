import { useMemo, useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import UserListItem from './UserListItem'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import SearchBar from './SearchBar'
import SortControl, { type SortOrder } from './SortControl'
import CityFilter from './CityFilter'
import Pagination from './Pagination'
import UserListHeader from './UserListHeader'

const PAGE_SIZE = 5

export default function UserList() {
  const { users, status, error, retry } = useUsers()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('name-asc')
  const [city, setCity] = useState('all')
  const [page, setPage] = useState(1)

  const cities = useMemo(() => {
    const set = new Set(users.map((u) => u.address.city))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [users])

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = users.filter((u) => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesCity = city === 'all' || u.address.city === city
      return matchesQuery && matchesCity
    })
    return [...filtered].sort((a, b) =>
      sort === 'name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    )
  }, [users, search, city, sort])

  // a new search/sort/city selection invalidates whatever page the user was on;
  // reset during render (not an effect) so it takes effect in the same pass
  const [appliedFilters, setAppliedFilters] = useState({ search, sort, city })
  if (appliedFilters.search !== search || appliedFilters.sort !== sort || appliedFilters.city !== city) {
    setAppliedFilters({ search, sort, city })
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = visibleUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Users</h1>
        {status === 'success' && (
          <p className="mt-1 text-sm text-ink-500">
            {visibleUsers.length} of {users.length} users
          </p>
        )}
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex gap-3">
          <SortControl value={sort} onChange={setSort} />
          <CityFilter cities={cities} value={city} onChange={setCity} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-300 bg-white">
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={error ?? ''} onRetry={retry} />}
        {status === 'success' && visibleUsers.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-500">No users match your filters.</p>
        )}
        {status === 'success' && visibleUsers.length > 0 && (
          <>
            <UserListHeader />
            <ul className="divide-y divide-ink-300">
              {pageItems.map((user) => (
                <UserListItem key={user.id} user={user} />
              ))}
            </ul>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}
