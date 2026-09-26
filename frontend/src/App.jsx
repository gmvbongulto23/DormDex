import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import { USING_MOCK } from './api'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-brand">DormDex</span>
          <span className="hidden text-sm text-slate-500 sm:inline">Know the place before you sign.</span>
        </Link>
        {USING_MOCK && (
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Mock data</span>
        )}
      </header>

      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-500">
        Demo data: all listings, landlords and reviews are fictional. Built for MESA U Hacks 3.0.
      </footer>
    </div>
  )
}
