import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserList from './components/UserList'
import UserDetail from './components/UserDetail'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
