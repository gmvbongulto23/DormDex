import React, { useState, useEffect } from 'react'
import { getListings } from '../api'
import ListingCard from '../components/ListingCard'
import FilterBar from '../components/FilterBar'
import MapView from '../components/MapView'

export default function HomePage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState(null)

  const [filters, setFilters] = useState({
    max_cost: '',
    min_safety: '',
    bedrooms: '',
    sort: 'true_cost'
  })

  useEffect(() => {
    setLoading(true)
    getListings(filters)
      .then((data) => setListings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header & Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Student Housing Options</h1>
          <p className="text-xs text-slate-500 font-medium">Filtered & sorted by verified student inputs</p>
        </div>

        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Grid: Listing Cards + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12 text-violet-600 font-bold text-sm">
              <span className="h-3 w-3 animate-ping rounded-full bg-violet-600 mr-2"></span>
              Loading listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">No properties match your current filters</p>
              <button
                onClick={() => setFilters({ max_cost: '', min_safety: '', bedrooms: '', sort: 'true_cost' })}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  active={hoveredId === item.id}
                  onHover={setHoveredId}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm overflow-hidden h-[600px]">
            <MapView listings={listings} hoveredId={hoveredId} onHover={setHoveredId} />
          </div>
        </div>
      </div>
    </div>
  )
}