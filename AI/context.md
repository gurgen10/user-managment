# Context for working in this repo

A user directory against the JSONPlaceholder `/users` fixture: list, search,
sort, filter, a detail view, and a name edit that survives a reload. Single
screen, single domain (`users`). `README.md` has the product decisions and
their reasoning; this file is conventions, architecture, traps, and
guardrails for changing the code itself.

## Conventions

The one rule that matters: **flat, by type, not by feature.**
`api/` (fetch + response shape), `hooks/` (data fetching, edit persistence,
the domain `User` type), `components/` (presentation, one default export
per file), `constants/` (the only place literal URLs/DB names/page sizes
live). There's exactly one real domain here, so there's no `features/users/`
split to keep code in sync with — new user-related logic goes in the
existing four folders by what kind of thing it is, not by feature.

- **Type-only imports use `import type`** (`verbatimModuleSyntax` is on) —
  e.g. `import { useState, type FocusEvent } from 'react'`, not a bare
  `import { FocusEvent }` for something only used as a type.
- **`noUncheckedIndexedAccess` is on** — array/record indexing returns
  `T | undefined` (`filteredCities[0]` is `string | undefined`). Narrow it;
  don't reach for a non-null assertion to silence the error.
- **State that should reset when an input changes is reset during render**,
  not in a `useEffect` — compare against a snapshot of the previous inputs
  and call `setState` directly in the component body (see `UserList.tsx`
  resetting `page`, `CityFilter.tsx` resetting `query`). This is the
  React-recommended pattern for derived resets, avoids an extra render
  pass, and matches what oxlint's `react(set-state-in-effect)` rule
  expects — if you see that warning, this pattern is the fix.
- **Pure logic is pulled out of components into its own file when it's
  worth unit-testing** — `userListQuery.ts` holds `filterAndSortUsers` /
  `paginate` specifically so they're testable without rendering React.
  Follow that split for new list-query logic rather than inlining it back
  into `UserList.tsx`.
- **Tests are colocated** (`*.test.ts` next to the file it covers), run via
  `npm run test` (Vitest). No component-render tests exist — only pure
  logic and hooks are covered; that's a deliberate scope line, not a gap to
  fill reflexively.
- Tailwind v4, tokens only in `index.css` (`--color-ink-*`,
  `--color-accent-*`). Interactive elements get `cursor-pointer` set
  explicitly, since Tailwind doesn't default it on `<button>`.

## Architecture

- **`api/users.ts` → `hooks/useUsers.ts` → components.** `fetchUsers`
  is a thin fetch wrapper with no knowledge of edits, merging, or React.
  `useUsers()` is where fetching, the race guard, and the edit-merge all
  meet — it calls `useUserEdits()` internally and merges before returning
  `users`, so every consumer (`UserList`, `UserDetail`) only ever sees
  already-merged data. Filtering/sorting/pagination happen downstream of
  that merge, in `userListQuery.ts`, so they always operate on the edited
  name — never the stale original.
- **Edits live in IndexedDB (`hooks/useUserEdits.ts`), not `localStorage`**,
  because reads/writes are async and don't block the main thread, and
  edits are keyed records instead of one blob that has to be re-parsed on
  every read. Hand-rolled wrapper, no `idb` library — `openDb` /
  `readAllEdits` / `writeEdit`, names/version from `constants/index.ts`.
- **Local edits win unconditionally — there's no timestamp/conflict
  comparison against the server.** `mergeUser(apiUser, edit)` in
  `useUsers.ts` just overlays `edit.name` when an edit exists, full stop.
  This is correct *because* the fixture has no real write endpoint: a
  fetched `ApiUser` can never be "more current" than a local edit, since
  the server is never aware the edit happened. Don't add a timestamp
  comparison or a "smarter" merge — there is nothing on the other side to
  compare against.
- **There's a real router** (`react-router-dom`, two routes: `/` and
  `/users/:id`), added deliberately for the detail view and a working
  browser back button — not left out. It's intentionally minimal: exactly
  those two routes, no more.
- **No global state or context provider.** Each component that needs users
  calls `useUsers()` independently — `UserDetail` re-fetches and re-reads
  IndexedDB rather than sharing a cache with `UserList`. This was a
  simplicity trade-off for a two-screen app, not an oversight.
- `src/context/` and `src/lib/` are **empty leftover directories** from an
  earlier, reverted architecture pass — not scaffolding to build into.

## The traps

- **The stale-response race guard doesn't protect what the brief's wording
  implies.** The fixture is one `GET` with no query params, fetched once —
  search/sort/filter are pure client-side array ops with no network
  request behind them, so there's no per-keystroke race to lose. The
  `requestId`/`AbortController` guard in `useUsers` is real, it just
  protects retries/re-fetches instead. Don't "helpfully" add debounced
  search requests to guard against a race that can't happen here. (A
  generic `useDebouncedValue` hook existed earlier for exactly this reason
  and was removed as dead code — don't recreate it without a concrete,
  current reason.)
- **`UserEdit.editedAt` and `User.nameEditedAt` are two different fields on
  purpose**, not a naming bug. `UserEdit` (raw IndexedDB record) has
  `editedAt`; `mergeUser` copies that onto the domain `User` as
  `nameEditedAt`, named for the one field it currently tracks. Don't
  "clean up" the naming mismatch without considering that a second
  editable field would make a generic `editedAt` ambiguous.
  `useUsers.test.ts` mocks `./useUserEdits` entirely — if you change that
  hook's returned shape (`{ edits, setName, isReady }`), the mock needs
  updating too, or unrelated fetch tests will fail for a confusing reason.
- **Filters/sort/page/pageSize reset on any navigation away from the list,
  not just on reload.** That state is local to `UserList.tsx`, which
  unmounts on routing to `/users/:id`. This is a known, written-up gap
  (README → "What is still wrong with this") — don't assume it's handled,
  and don't silently patch it as a drive-by fix.
- **`EDITS_DB_VERSION` is `1` with no migration path.** Changing
  `UserEdit`'s shape or the object store later needs a real
  `onupgradeneeded` migration in `openDb()` — bumping the version constant
  alone won't transform existing users' stored data.
- The city combobox (`CityFilter.tsx`) is Tab-reachable but has no
  arrow-key roving between options — a plain button list in a popover, not
  a full ARIA `combobox`. Don't assume arrow keys work there.
- **Empty-list pagination still reports one page**, not zero —
  `paginate([], 1, size).pageCount === 1` is intentional (see
  `userListQuery.test.ts`), so `UserList` doesn't need a special case for
  "no results" beyond its own empty-state message.

## What it should never do here

- Don't add a component/UI library — explicitly out of scope in the brief,
  and a deliberate choice (see README → Decisions → Styling).
- Don't add routes beyond `/` and `/users/:id` — "routing to anything
  other than what this screen needs" is explicitly out of scope.
- Don't switch edit persistence to `localStorage`, or add a timestamp-based
  merge — see Architecture above for why both are deliberate.
- Don't add a global state library or a context provider speculatively to
  "fix" the list/detail double-fetch — that's one screen's worth of state;
  if the double-fetch is ever worth fixing, that's the moment to consider
  it, not before.
- Don't build against a real backend, auth, or persistence beyond the
  browser — explicitly out of scope in the brief.
- Don't add Playwright (or any E2E tool) as a permanent dependency for
  verifying a UI change — this project verifies UI changes with a
  throwaway headless-browser script in a scratch temp directory, deleted
  after use, not a committed E2E suite.
