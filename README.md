# User Management — M-One Frontend Challenge

> Level applying for: **Mid-level Frontend Developer**

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
The fixture has no real write endpoint. Edits are persisted in IndexedDB,
keyed by user id, and merged on top of every fetch inside `hooks/useUsers.ts`.

**Why IndexedDB over `localStorage`.**
Reads/writes are async and don't block the main thread, edits are stored as
keyed records instead of one JSON blob that has to be fully parsed on every
read, and it scales cleanly if the amount of persisted state grows later.

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

**Styling.** I used `Tailwind CSS` because during the interview I realized that knowing it was important and the company uses it. Tailwind v4 (`@tailwindcss/vite`) with hand-built components
and a small custom token set (`index.css`: an `ink`/`accent` scale), no
component library. Keeps every visual decision visible in this repo instead
of inherited from a library's defaults, for a single screen small enough
that the library wouldn't save much.

**TypeScript.** `strict: true` plus `noUncheckedIndexedAccess` (from the
Vite template's default `tsconfig.app.json`, stricter than the brief
requires) — left on rather than relaxed.

**What persists across reload.** Only the name edit, via IndexedDB. Search
text, the active sort, the city filter, pagination and the current page/page-size are
local component state — they reset on reload, and (see "What is still wrong
with this") also reset on any navigation away from the list. The brief only
requires the name edit to survive; I didn't extend that to the rest of the
view state, since nothing else says it should and URL-encoding all of it
felt like solving a requirement that wasn't asked for.

## Contradictions & gaps in the brief

- **"Never fails" vs. "must handle failure."** The fixture can't produce a
  failure to test against.
- **"Only ten rows" vs. "handle far more rows."** Same root cause, different
  axis. Pagination is built and works correctly against the real ten rows,
  but its behavior at real scale (hundreds/thousands of rows) is reasoned
  about, not tested — the fixture can't produce that volume either.
- **The race-guard requirement vs. no server-side search.** "Typing quickly
  must not let a stale response overwrite a newer one" describes a race
  against a live search backend. This fixture returns all ten users once,
  with no query parameters, so search/sort/filter are pure client-side
  array operations — there is no per-keystroke request to race.
- **Back-button expectations vs. "no routing beyond this screen."** I read
  list↔detail as needing real routing (see Decisions), but the brief lists
  extra routing as explicitly out of scope in the same paragraph that
  implies a detail view and a working back button — both readings
  (route it / keep it as in-memory view state) are defensible, and the
  brief doesn't disambiguate which one it means.
- **Scope of "nothing should disappear on reload" is undefined** beyond the
  name-edit requirement — see "What persists across reload" above for the
  line actually drawn.

  ## Edited users versus fresh server data.

This fixture API has no real write endpoint — there's nowhere for your edit to go except your own browser. That means an edited field can only exist because the user changed it right here, in this session or a past one. A subsequent fetch from the server is returning the same static, unedited fixture data every time — it was never "more current" than your edit, because it was never aware the edit happened at all. There's no real race between two sources of truth; there's one source of truth (your edit) and one source of stale placeholder data (the fixture) that has no way to reflect it.

## What is still wrong with this

- **Filters, sort, page, pagination and page-size reset on navigation, not just on reload.** `UserList`'s search/sort/city/page/pagination/pageSize state is local to
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
- **Create/update user and authentication/autorisation** The fixture API doesn't support the create and update endpoints, so I skipped those functionalities. Additionally, we don't have access to the logged-in user's information, so we can't determine who can and who performed the actions on the user table.

## What I would need before building this for real

- A real write endpoint for edits, and its actual conflict-resolution
  contract (is last-write-wins acceptable to the business, or does a
  concurrent edit need to be surfaced to the user?).
- Expected data volume in production, to know whether client-side
  pagination/virtualization is enough or server-side pagination is required.
- Whether "user" here is ever edited by more than one person/session
  concurrently, which changes the local-wins decision entirely.
- Actual design/brand guidelines (ex. Figma design), if this is customer-facing rather than
  an internal tool.
- Accessibility and browser-support requirements (specific WCAG level,
  minimum supported browsers) — assumed a reasonable modern-browser,
  WCAG AA-ish bar in the absence of one.
- Implement authentification/autorisation functionality.
- After having accurate backend endpoints, write tests and check all risky cases.

