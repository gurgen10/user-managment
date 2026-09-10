import { USERS_PAGE_SIZE_OPTIONS } from '../constants'

interface PageSizeSelectProps {
  value: number
  onChange: (value: number) => void
}

export default function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-500">
      <label htmlFor="page-size">Rows per page</label>
      <select
        id="page-size"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cursor-pointer rounded-md border border-ink-300 bg-white px-2 py-1 text-sm text-ink-900 focus:border-accent-500"
      >
        {USERS_PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  )
}
