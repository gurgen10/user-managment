interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-sm text-ink-700">Couldn't load users. {message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500"
      >
        Retry
      </button>
    </div>
  )
}
