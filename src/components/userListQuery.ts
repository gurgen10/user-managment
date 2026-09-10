import type { User } from '../hooks/types'
import type { SortOrder } from './UserTableHead'

export interface UserListFilters {
  search: string
  city: string
  sort: SortOrder
}

export function filterAndSortUsers(users: User[], { search, city, sort }: UserListFilters): User[] {
  const q = search.trim().toLowerCase()
  const filtered = users.filter((u) => {
    const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchesCity = city === 'all' || u.address.city === city
    return matchesQuery && matchesCity
  })
  return [...filtered].sort((a, b) =>
    sort === 'name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  )
}

export interface PaginationResult<T> {
  pageItems: T[]
  pageCount: number
  safePage: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { pageItems, pageCount, safePage }
}
