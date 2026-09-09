export default function LoadingState() {
  return (
    <ul className="divide-y divide-ink-300" aria-busy="true" aria-live="polite">
      <li className="sr-only">Loading users…</li>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-ink-300" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-300" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
          </div>
        </li>
      ))}
    </ul>
  )
}
