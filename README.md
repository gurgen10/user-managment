# User Management — M-One Frontend Challenge

> Level applying for: **[fill in — e.g. Mid-level Frontend Developer]**

A user directory built against the JSONPlaceholder `/users` fixture: search,
sort, filter, a detail view per user, and a name edit that survives a reload.

## Running it

```bash
npm install
npm run dev
```

Type-check + production build:

```bash
npm run build   # tsc -b && vite build
```

Lint:

```bash
npm run lint    # oxlint
```

No env vars, no backend, no account needed — the fixture API is public and
always available.

## Decisions

**Local edits vs. fresh server data — local wins.**
The fixture has no real write endpoint, so a name edit only exists because
it happened here; a fresh fetch can never be "more current" than it for the
fields we edit. Edits are persisted in IndexedDB (`hooks/useUserEdits.ts`),
keyed by user id, and merged on top of every fetch inside `hooks/useUsers.ts`.
The merge happens *before* search/sort/filter ever see the data, so those
operate on the edited name, not the stale original — a direct consequence
of the "local wins" decision rather than a separate choice.

**Why IndexedDB over `localStorage`.**
Reads/writes are async and don't block the main thread, edits are stored as
keyed records instead of one JSON blob that has to be fully parsed on every
read, and it scales cleanly if the amount of persisted state grows later.

**Race safety.**
`useUsers` tracks in-flight requests with a request-id ref plus an
`AbortController`. If a newer fetch starts (a retry, for example) before an
older one resolves, the older response is dropped instead of being allowed
to overwrite newer state. Search, sort, and city filtering, however, run
entirely client-side over the already-fetched array — the fixture has no
server-side search/sort/filter parameters — so typing in the search box
never actually issues a request, so there is no race to lose. See Contradictions
below; the guard is real, but it protects the one genuine network op (the
initial fetch and manual retries), not the search box the brief's wording
suggests it should.

**File architecture: flat, by type, not by feature.**
`api/` (fetch + response shape), `hooks/` (data fetching, edit persistence,
domain types), `components/` (presentation), plus a single `constants/`
module. This app has exactly one real domain (`users`), so a
`features/users/{api,hooks,components}` split would just be a wrapper
directory around the entire app with nothing else beside it for the
boundary to mean anything — flat is simpler and matches the actual
complexity. This was a deliberate choice made after prototyping the
feature-sliced version first and comparing the two directly.

**Routing: a real detail route, not in-memory view state.**
`react-router-dom` with two routes — `/` (list) and `/users/:id` (detail).
"Not in scope: routing to anything other than what this screen needs" reads
most naturally as excluding *unrelated* routes (auth, settings, etc.), not
the list↔detail navigation this screen inherently needs for a URL-addressable
detail view and a browser back button that behaves the way users expect.
See Contradictions below — this reading isn't the only defensible one.

**Sorting "by name."** `name` in this fixture is one full-name string
("Leanne Graham"), not split into first/last — sorted with `localeCompare`
on the whole string, which in practice sorts by first name since that's the
first token compared.

**Scale: pagination, not virtualization.**
`UserList` paginates the already-filtered/sorted array client-side, with a
"rows per page" control (5 / 10 / 50 / 100, default 10). Virtualization
would only pay for itself at a scale this fixture (fixed at ten rows) can't
actually produce — building it here would mean either faking thousands of
rows to justify a library or shipping one nobody can verify solves a real
problem. Pagination is the change that's honest about what can actually be
demonstrated.

**City filter as a searchable combobox, not a plain `<select>`.**
A native `<select>` can't host a search input inside it. With only ten
possible cities in this fixture, a plain dropdown would have worked fine —
this is sized for a city list that's actually long, which is a real
over-build relative to what this dataset needs today.

**Styling.** Tailwind v4 (`@tailwindcss/vite`) with hand-built components
and a small custom token set (`index.css`: an `ink`/`accent` scale), no
component library. Keeps every visual decision visible in this repo instead
of inherited from a library's defaults, for a single screen small enough
that the library wouldn't save much.

**TypeScript.** `strict: true` plus `noUncheckedIndexedAccess` (from the
Vite template's default `tsconfig.app.json`, stricter than the brief
requires) — left on rather than relaxed.

**What persists across reload.** Only the name edit, via IndexedDB. Search
text, the active sort, the city filter, and the current page/page-size are
local component state — they reset on reload, and (see "What is still wrong
with this") also reset on any navigation away from the list. The brief only
requires the name edit to survive; I didn't extend that to the rest of the
view state, since nothing else says it should and URL-encoding all of it
felt like solving a requirement that wasn't asked for.

**Responsive & input testing.** Checked at 1280px (desktop) and 375px
(mobile, iPhone SE/8-width) viewports — the toolbar stacks vertically below
`sm`, and the table scrolls horizontally inside its own container rather
than breaking the page layout, so the City column stays reachable instead
of being dropped. Checked keyboard-only operation of the search input, the
sortable column header, the city combobox (open, type to filter, Enter
selects the first match, Escape/outside-click/blur-out closes it), and the
row → detail → back flow — all reachable and operable via Tab/Enter/Escape
without a mouse. The combobox's option list is Tab-reachable but doesn't
support arrow-key roving between options; a full ARIA combobox pattern
would add that. `color-scheme: light` is set explicitly so native form controls
(the `<select>`, inputs) don't flip to an unreadable dark-on-dark combo
under an OS-level dark mode, even though the rest of the UI only ships a
light theme. `prefers-reduced-motion` is **not** currently honored — see
"What is still wrong with this."

## Contradictions & gaps in the brief

- **"Never fails" vs. "must handle failure."** The fixture can't produce a
  failure to test against. Loading and error UI exist and were exercised by
  hand (devtools offline toggle, throttled network) during development, not
  by an automated fault-injection mechanism — I considered adding a
  dev-only "fail N% of requests" env flag but didn't build it; see below.
- **"Only ten rows" vs. "handle far more rows."** Same root cause, different
  axis. Pagination is built and works correctly against the real ten rows,
  but its behavior at real scale (hundreds/thousands of rows) is reasoned
  about, not tested — the fixture can't produce that volume either.
- **The race-guard requirement vs. no server-side search.** "Typing quickly
  must not let a stale response overwrite a newer one" describes a race
  against a live search backend. This fixture returns all ten users once,
  with no query parameters, so search/sort/filter are pure client-side
  array operations — there is no per-keystroke request to race. The
  request-id/abort guard in `useUsers` is real and useful (it protects
  retries and re-fetches), just not against the specific scenario the
  wording implies.
- **Back-button expectations vs. "no routing beyond this screen."** I read
  list↔detail as needing real routing (see Decisions), but the brief lists
  extra routing as explicitly out of scope in the same paragraph that
  implies a detail view and a working back button — both readings
  (route it / keep it as in-memory view state) are defensible, and the
  brief doesn't disambiguate which one it means.
- **Scope of "nothing should disappear on reload" is undefined** beyond the
  name-edit requirement — see "What persists across reload" above for the
  line actually drawn.
- **Edited name vs. "searchable/sortable by name."** Unresolved by the
  brief which value — edited or original — those should operate on.
  Resolved here as a consequence of merge order (edits are merged before
  filtering/sorting run), not a separate decision.
- **"A component library is fine" vs. "no design system," in the same
  breath.** Most popular component libraries effectively *are* small design
  systems (tokens + prebuilt components). Tailwind + hand-built components
  sidesteps the ambiguity rather than resolving which side of that line a
  library would fall on.
- **A city filter with ten fixed, mostly-unique cities.** All ten fixture
  users happen to live in ten different cities, so "filterable by city"
  only ever narrows the list from ten rows to one (or zero) — it never
  demonstrates filtering a real group. Confirmed by testing, not assumed.

## What is still wrong with this

- **Filters, sort, page, and page-size reset on navigation, not just on
  reload.** `UserList`'s search/sort/city/page/pageSize state is local to
  that component. Since it unmounts when routing to a detail view, clicking
  into a user and pressing Back returns to the *default* list view, not the
  filtered one you left — a real instance of "state that resets when it
  should not," and it directly undercuts the brief's back-button
  requirement in a way reload-persistence alone doesn't fix.
- **The detail view re-fetches and re-merges independently of the list.**
  `UserDetail` calls the same `useUsers()` hook as `UserList`, but there's
  no shared cache between them — navigating list → detail → list re-issues
  the API fetch and re-reads IndexedDB every time. Invisible only because
  the fixture is instant; a real API would make this a visible, wasteful
  double-fetch.
- **`prefers-reduced-motion` isn't respected.** The loading skeleton's
  pulse animation runs regardless of the OS-level "reduce motion" setting.
- **`hooks/useDebouncedValue.ts` is dead code** — a leftover from an
  earlier version of the search implementation that debounced input before
  it was simplified to plain client-side filtering. Unused, never imported.
- **Two empty leftover directories, `src/context/` and `src/lib/`,** from
  an earlier architectural pass (a context-provider version of the data
  layer) that was later reverted in favor of the current flat structure.
  Harmless, but repo clutter that should be deleted.
- **No automated tests** — see Tests below.

## What I would need before building this for real

- A real write endpoint for edits, and its actual conflict-resolution
  contract — is last-write-wins acceptable, or does a concurrent edit need
  to be surfaced to the user instead of silently overwritten?
- Expected data volume in production, to know whether client-side
  pagination is enough or the API needs real server-side search/pagination.
- Whether a user record is ever edited by more than one person or session
  concurrently — that changes the "local always wins" decision entirely.
- Actual design/brand guidelines, if this is customer-facing rather than an
  internal tool.
- Accessibility and browser-support requirements (specific WCAG level,
  minimum supported browsers) — I assumed a reasonable modern-browser,
  roughly WCAG-AA-effort bar in the absence of a stated one.

## Tests

Skipped deliberately, given the one-day scope — time went into the trickier
runtime behavior instead (the race guard, edit/fetch merge order, the
back-button/filter-reset interaction called out above) and into verifying
it by hand: scripted headless-browser passes during development covering
search/sort/city-filter/pagination/page-size, the detail-edit-reload-persist
flow, keyboard-only operation, and layout at both a desktop and a 375px
mobile width. None of that is committed as an automated suite. If I were to
add tests, `hooks/useUsers.ts`'s merge/race logic and the filter+pagination
interaction in `UserList.tsx` are where I'd start — they're the two places
a regression would be easy to introduce silently.
