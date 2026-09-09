import { useState, type FormEvent } from 'react'

interface EditableNameProps {
  name: string
  isEdited: boolean
  onSave: (name: string) => void
}

export default function EditableName({ name, isEdited, onSave }: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  function startEditing() {
    setDraft(name)
    setIsEditing(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) {
      onSave(trimmed)
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <label htmlFor="edit-name" className="sr-only">
          Name
        </label>
        <input
          id="edit-name"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="rounded-md border border-ink-300 px-3 py-1.5 text-xl font-semibold text-ink-900 focus:border-accent-500"
        />
        <button
          type="submit"
          className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-500 cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100 cursor-pointer"
        >
          Cancel
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="text-xl font-semibold text-ink-900">{name}</h1>
      {isEdited && (
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-600">
          edited locally
        </span>
      )}
      <button type="button" onClick={startEditing} className="text-sm font-medium text-accent-600 hover:underline cursor-pointer">
        Edit
      </button>
    </div>
  )
}
