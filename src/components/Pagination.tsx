interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-ink-300 px-4 py-3 text-sm"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="cursor-pointer rounded-md px-3 py-1.5 font-medium text-ink-700 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-ink-500">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="cursor-pointer rounded-md px-3 py-1.5 font-medium text-ink-700 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  )
}
