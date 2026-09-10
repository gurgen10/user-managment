interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pageCount, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-4 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="cursor-pointer rounded-md border border-ink-300 bg-white px-3 py-1.5 font-medium text-ink-700 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
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
        className="cursor-pointer rounded-md border border-ink-300 bg-white px-3 py-1.5 font-medium text-ink-700 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  )
}
