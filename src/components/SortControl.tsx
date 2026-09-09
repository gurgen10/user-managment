export type SortOrder = 'name-asc' | 'name-desc'

interface SortControlProps {
  value: SortOrder
  onChange: (value: SortOrder) => void
}

export default function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div>
      <label htmlFor="user-sort" className="sr-only">
        Sort by name
      </label>
      <select
        id="user-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        className="rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
      >
        <option value="name-asc">Name (A–Z)</option>
        <option value="name-desc">Name (Z–A)</option>
      </select>
    </div>
  )
}
