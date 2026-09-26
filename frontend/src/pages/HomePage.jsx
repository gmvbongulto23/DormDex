import { useEffect, useState } from 'react'
import { getListings } from '../api'
import FilterBar from '../components/FilterBar'
import ListingCard from '../components/ListingCard'
import MapView from '../components/MapView'

const CAMPUS_COORDINATES = {
  current: null,
  csueb: { lat: 37.6572, lng: -122.0575, name: 'CSU East Bay' },
  sjsu: { lat: 37.3352, lng: -121.8811, name: 'San Jose State' },
  ucb: { lat: 37.8719, lng: -122.2585, name: 'UC Berkeley' },
  sfsu: { lat: 37.7241, lng: -122.4782, name: 'SF State' },
  scu: { lat: 37.3489, lng: -121.9367, name: 'Santa Clara University' },
  ucd: { lat: 38.5382, lng: -121.7617, name: 'UC Davis' }
}

export default function HomePage({ selectedCampus = 'csueb' }) {
  const [filters, setFilters] = useState({ max_cost: '', min_safety: '', bedrooms: '' })
  const [listings, setListings] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const activeCampusCoords = CAMPUS_COORDINATES[selectedCampus] || CAMPUS_COORDINATES.csueb

  useEffect(() => {
    setLoading(true)
    getListings({ ...filters, campus: selectedCampus })
      .then((data) => { setListings(data); setError('') })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters, selectedCampus])

  return (
    <div className="flex h-full flex-col md:flex-row">
      
      {/* Left Sidebar Panel */}
      <section 
        className="order-2 flex min-h-0 flex-col border-t border-slate-200/80 bg-white/70 backdrop-blur-md md:order-1 md:w-[450px] md:border-r md:border-t-0" 
        aria-label="Housing Listings"
      >
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Dynamic Status Indicator */}
        <div className="flex items-center justify-between px-4 pt-3 text-xs font-semibold text-slate-600" aria-live="polite">
          <span>
            {loading ? (
              <span className="flex items-center gap-1.5 text-violet-600">
                <span className="h-2 w-2 animate-ping rounded-full bg-violet-600"></span>
                Searching campus housing...
              </span>
            ) : (
              <span>
                <strong className="text-slate-900 font-bold">{listings.length}</strong> spots near{' '}
                <span className="text-violet-700 font-bold">{activeCampusCoords?.name || 'Current Location'}</span>
              </span>
            )}
          </span>

          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
            Rent + Utilities Combined
          </span>
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {/* Listings Scrollable List */}
        <ul className="flex-1 space-y-3 overflow-y-auto p-4">
          {!loading && listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-700">No properties found.</p>
              <p className="mt-1 text-xs text-slate-500">Try loosening your max monthly budget or bedroom filters.</p>
            </div>
          ) : (
            listings.map((l) => (
              <ListingCard 
                key={l.id} 
                listing={l} 
                active={l.id === activeId} 
                onHover={setActiveId} 
              />
            ))
          )}
        </ul>
      </section>

      {/* Map Area */}
      <section className="order-1 h-[45vh] shrink-0 md:order-2 md:h-auto md:flex-1 relative" aria-label="Map of listings near campus">
        <MapView 
          listings={listings} 
          activeId={activeId} 
          onHover={setActiveId} 
          campusCoords={activeCampusCoords}
        />
      </section>
    </div>
  )
}