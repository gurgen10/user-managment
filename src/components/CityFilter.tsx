import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'

interface CityFilterProps {
  cities: string[]
  value: string
  onChange: (value: string) => void
}

export default function CityFilter({ cities, value, onChange }: CityFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  // focusing the search input is a plain DOM side effect - no state changes here
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus()
    }
  }, [isOpen])

  function handleBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function toggleOpen() {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setQuery('')
      setIsOpen(true)
    }
  }

  function select(city: string) {
    onChange(city)
    setIsOpen(false)
  }

  const filteredCities = cities.filter((city) => city.toLowerCase().includes(query.trim().toLowerCase()))

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const first = filteredCities[0]
      if (first) {
        select(first)
      } else if (query.trim() === '') {
        select('all')
      }
    }
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter by city"
        className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
      >
        <span className="max-w-32 truncate">{value === 'all' ? 'All cities' : value}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" aria-hidden="true" className="shrink-0 text-ink-500">
          <path d="M5.5 7.5l4.5 5 4.5-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 w-56 rounded-md border border-ink-300 bg-white shadow-lg">
          <div className="border-b border-ink-300 p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search city…"
              className="w-full rounded border border-ink-300 px-2 py-1 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1 text-sm">
            <li role="option" aria-selected={value === 'all'}>
              <button
                type="button"
                onClick={() => select('all')}
                className={`block w-full cursor-pointer px-3 py-1.5 text-left hover:bg-ink-100 ${
                  value === 'all' ? 'font-medium text-accent-600' : 'text-ink-900'
                }`}
              >
                All cities
              </button>
            </li>
            {filteredCities.length === 0 && <li className="px-3 py-1.5 text-ink-500">No cities match</li>}
            {filteredCities.map((city) => (
              <li key={city} role="option" aria-selected={value === city}>
                <button
                  type="button"
                  onClick={() => select(city)}
                  className={`block w-full cursor-pointer truncate px-3 py-1.5 text-left hover:bg-ink-100 ${
                    value === city ? 'font-medium text-accent-600' : 'text-ink-900'
                  }`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
