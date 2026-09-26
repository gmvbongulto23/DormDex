import { useEffect, useState } from 'react'
import { getListings } from '../api'
import FilterBar from '../components/FilterBar'
import ListingCard from '../components/ListingCard'
import MapView from '../components/MapView'

export default function HomePage() {
  const [filters, setFilters] = useState({ max_cost: '', min_safety: '', bedrooms: '' })
  const [listings, setListings] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getListings(filters)
      .then((data) => { setListings(data); setError('') })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* List: below the map on phones, left side on desktop */}
      <section className="order-2 flex min-h-0 flex-col md:order-1 md:w-[420px] md:border-r md:border-slate-200" aria-label="Listings">
        <FilterBar filters={filters} onChange={setFilters} />
        <p className="px-3 pt-3 text-sm text-slate-600" aria-live="polite">
          {loading ? 'Loading…' : `${listings.length} places · true cost = rent + avg. utilities students reported`}
        </p>
        {error && <p role="alert" className="mx-3 mt-2 rounded bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        <ul className="flex-1 space-y-2 overflow-y-auto p-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} active={l.id === activeId} onHover={setActiveId} />
          ))}
        </ul>
      </section>

      <section className="order-1 h-[45vh] shrink-0 md:order-2 md:h-auto md:flex-1" aria-label="Map of listings near campus">
        <MapView listings={listings} activeId={activeId} onHover={setActiveId} />
      </section>
    </div>
  )
}
