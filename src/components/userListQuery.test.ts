import { describe, expect, it } from 'vitest'
import { filterAndSortUsers, paginate } from './userListQuery'
import type { User } from '../hooks/types'

function makeUser(overrides: Partial<User> & Pick<User, 'id' | 'name' | 'email'>): User {
  return {
    username: overrides.name,
    address: {
      street: '',
      suite: '',
      city: 'Springfield',
      zipcode: '',
      geo: { lat: '0', lng: '0' },
    },
    phone: '',
    website: '',
    company: { name: '', catchPhrase: '', bs: '' },
    ...overrides,
  }
}

const users: User[] = [
  makeUser({ id: 1, name: 'Bob Smith', email: 'bob@example.com', address: { street: '', suite: '', city: 'Gotham', zipcode: '', geo: { lat: '0', lng: '0' } } }),
  makeUser({ id: 2, name: 'Alice Jones', email: 'alice@example.com', address: { street: '', suite: '', city: 'Metropolis', zipcode: '', geo: { lat: '0', lng: '0' } } }),
  makeUser({ id: 3, name: 'Charlie Alpha', email: 'charlie@gotham.com', address: { street: '', suite: '', city: 'Gotham', zipcode: '', geo: { lat: '0', lng: '0' } } }),
]

describe('filterAndSortUsers', () => {
  it('matches by a name substring, case-insensitively', () => {
    const result = filterAndSortUsers(users, { search: 'bob', city: 'all', sort: 'name-asc' })
    expect(result.map((u) => u.id)).toEqual([1])
  })

  it('matches by an email substring', () => {
    const result = filterAndSortUsers(users, { search: 'gotham.com', city: 'all', sort: 'name-asc' })
    expect(result.map((u) => u.id)).toEqual([3])
  })

  it('does not match against the city field', () => {
    // "gotham" is a city for users 1 and 3, but their names/emails don't contain it
    const result = filterAndSortUsers(users, { search: 'gotham', city: 'all', sort: 'name-asc' })
    expect(result.map((u) => u.id)).toEqual([3]) // only matches via charlie@gotham.com
  })

  it('filters by exact city when city is not "all"', () => {
    const result = filterAndSortUsers(users, { search: '', city: 'Gotham', sort: 'name-asc' })
    expect(result.map((u) => u.id).sort()).toEqual([1, 3])
  })

  it('returns everyone when city is "all" and search is empty', () => {
    const result = filterAndSortUsers(users, { search: '', city: 'all', sort: 'name-asc' })
    expect(result).toHaveLength(3)
  })

  it('combines search and city as AND, not OR', () => {
    const result = filterAndSortUsers(users, { search: 'alpha', city: 'Metropolis', sort: 'name-asc' })
    expect(result).toEqual([])
  })

  it('sorts ascending by name', () => {
    const result = filterAndSortUsers(users, { search: '', city: 'all', sort: 'name-asc' })
    expect(result.map((u) => u.name)).toEqual(['Alice Jones', 'Bob Smith', 'Charlie Alpha'])
  })

  it('sorts descending by name', () => {
    const result = filterAndSortUsers(users, { search: '', city: 'all', sort: 'name-desc' })
    expect(result.map((u) => u.name)).toEqual(['Charlie Alpha', 'Bob Smith', 'Alice Jones'])
  })

  it('does not mutate the input array', () => {
    const copy = [...users]
    filterAndSortUsers(users, { search: '', city: 'all', sort: 'name-desc' })
    expect(users).toEqual(copy)
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 12 }, (_, i) => i + 1)

  it('returns the first slice for page 1', () => {
    const result = paginate(items, 1, 5)
    expect(result).toEqual({ pageItems: [1, 2, 3, 4, 5], pageCount: 3, safePage: 1 })
  })

  it('returns a partial final page', () => {
    const result = paginate(items, 3, 5)
    expect(result).toEqual({ pageItems: [11, 12], pageCount: 3, safePage: 3 })
  })

  it('clamps a page number beyond the last page back to the last page', () => {
    const result = paginate(items, 99, 5)
    expect(result.safePage).toBe(3)
    expect(result.pageItems).toEqual([11, 12])
  })

  it('always reports at least one page, even for an empty list', () => {
    const result = paginate([], 1, 5)
    expect(result).toEqual({ pageItems: [], pageCount: 1, safePage: 1 })
  })

  it('fits everything on one page when page size exceeds the item count', () => {
    const result = paginate(items, 1, 100)
    expect(result.pageCount).toBe(1)
    expect(result.pageItems).toHaveLength(12)
  })
})
