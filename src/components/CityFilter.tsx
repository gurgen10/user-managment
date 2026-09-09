interface CityFilterProps {
  cities: string[]
  value: string
  onChange: (value: string) => void
}

export default function CityFilter({ cities, value, onChange }: CityFilterProps) {
  return (
    <div>
      <label htmlFor="user-city" className="sr-only">
        Filter by city
      </label>
      <select
        id="user-city"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
      >
        <option value="all">All cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  )
}
