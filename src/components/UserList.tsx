import { useMemo, useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { USERS_DEFAULT_PAGE_SIZE } from '../constants'
import { filterAndSortUsers, paginate } from './userListQuery'
import UserTableRow from './UserTableRow'
import UserTableHead, { type SortOrder } from './UserTableHead'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import SearchBar from './SearchBar'
import CityFilter from './CityFilter'
import Pagination from './Pagination'
import PageSizeSelect from './PageSizeSelect'

export default function UserList() {
  const { users, status, error, retry } = useUsers()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('name-asc')
  const [city, setCity] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(USERS_DEFAULT_PAGE_SIZE)

  const cities = useMemo(() => {
    const set = new Set(users.map((u) => u.address.city))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [users])

  const visibleUsers = useMemo(
    () => filterAndSortUsers(users, { search, city, sort }),
    [users, search, city, sort],
  )

  // a new search/sort/city/page-size selection invalidates whatever page the user was on;
  // reset during render (not an effect) so it takes effect in the same pass
  const [appliedFilters, setAppliedFilters] = useState({ search, sort, city, pageSize })
  if (
    appliedFilters.search !== search ||
    appliedFilters.sort !== sort ||
    appliedFilters.city !== city ||
    appliedFilters.pageSize !== pageSize
  ) {
    setAppliedFilters({ search, sort, city, pageSize })
    setPage(1)
  }

  const { pageItems, pageCount, safePage } = paginate(visibleUsers, page, pageSize)

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Users</h1>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <CityFilter cities={cities} value={city} onChange={setCity} />
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-300 bg-white">
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={error ?? ''} onRetry={retry} />}
        {status === 'success' && visibleUsers.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-500">No users match your filters.</p>
        )}
        {status === 'success' && visibleUsers.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <UserTableHead sort={sort} onSortChange={setSort} />
                <tbody className="divide-y divide-ink-300">
                  {pageItems.map((user) => (
                    <UserTableRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-ink-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <PageSizeSelect value={pageSize} onChange={setPageSize} />
              <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
