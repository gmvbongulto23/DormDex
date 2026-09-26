import { Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import SubmitPage from './pages/SubmitPage'
import { USING_MOCK } from './api'

export default function App() {
  const [selectedCampus, setSelectedCampus] = useState('csueb')

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-amber-50/60 via-teal-50/30 to-indigo-50/50 font-sans text-slate-800">
      
      {/* Bright Header Bar */}
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-400 font-extrabold text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Dorm<span className="text-violet-600">Dex</span>
              </span>
            </div>
          </Link>
          
          <span className="hidden text-xs font-semibold text-slate-500 sm:inline-block border-l border-slate-200 pl-3">
            Know the true cost & transit before you sign.
          </span>

          {USING_MOCK && (
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Mock Active
            </span>
          )}
        </div>

        {/* Campus Selector & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Campus Dropdown Select */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 shadow-inner">
            <span className="text-xs">🎓</span>
            <select
              id="campus-select"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              aria-label="Select Target College Campus"
            >
              <option value="csueb">CSU East Bay (Hayward Main)</option>
              <option value="sjsu">San Jose State University</option>
              <option value="ucb">UC Berkeley</option>
              <option value="sfsu">San Francisco State</option>
              <option value="scu">Santa Clara University</option>
              <option value="ucd">UC Davis</option>
              <option value="current">📍 Use My Location</option>
            </select>
          </div>

          {/* Primary Action Button */}
          <Link
            to="/submit"
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-200 hover:bg-violet-700 transition active:scale-95"
          >
            + Review Housing
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<HomePage selectedCampus={selectedCampus} />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/submit" element={<SubmitPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-2 text-center text-[11px] font-medium text-slate-500 backdrop-blur-md">
        Built for MESA U Hacks 3.0 • Fictional Demo Data
      </footer>
    </div>
  )
}