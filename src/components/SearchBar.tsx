interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="user-search" className="sr-only">
        Search users by name or email
      </label>
      <input
        id="user-search"
        type="search"
        inputMode="search"
        placeholder="Search by name or email…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-accent-500"
      />
    </div>
  )
}
