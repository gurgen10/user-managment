export type SortOrder = 'name-asc' | 'name-desc'

interface UserTableHeadProps {
  sort: SortOrder
  onSortChange: (sort: SortOrder) => void
}

export default function UserTableHead({ sort, onSortChange }: UserTableHeadProps) {
  function toggleSort() {
    onSortChange(sort === 'name-asc' ? 'name-desc' : 'name-asc')
  }

  return (
    <thead className="bg-ink-100">
      <tr className="border-b border-ink-300 text-xs font-bold uppercase tracking-wide text-ink-500">
        <th scope="col" className="px-4 py-2 text-left">
          <button
            type="button"
            onClick={toggleSort}
            aria-label={`Sort by name, currently ${sort === 'name-asc' ? 'ascending' : 'descending'}`}
            className="inline-flex cursor-pointer items-center gap-1 font-bold uppercase tracking-wide text-ink-500 hover:text-ink-900"
          >
            Name
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              width="12"
              height="12"
              aria-hidden="true"
              className={sort === 'name-desc' ? 'rotate-180 transition-transform' : 'transition-transform'}
            >
              <path d="M10 6l4 6H6l4-6z" />
            </svg>
          </button>
        </th>
        <th scope="col" className="px-4 py-2 text-left font-bold">
          Email
        </th>
        <th scope="col" className="px-4 py-2 text-left font-bold">
          City
        </th>
      </tr>
    </thead>
  )
}
