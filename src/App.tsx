import UserList from './components/UserList'

function App() {
  return (
    <div className="min-h-svh mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Users
        </h1>

      </header>

      <main className="overflow-hidden rounded-lg border border-ink-300 bg-white">
        <UserList />
      </main>
    </div>
  )
}

export default App
