export default function UserListHeader() {
  return (
    <div className="flex items-center gap-4 bg-ink-100 border-b border-ink-300 px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink-500">
      <div className="h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1 font-bold">Name</div>
      <div className="hidden shrink-0 sm:block font-bold">City</div>
    </div>
  )
}
