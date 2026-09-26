import { Link } from 'react-router-dom'
import { money, Stars, SafetyBadge } from './ui'

export default function ListingCard({ listing: l, active, onHover }) {
  const baseRent = l.rent || Math.round(l.true_cost * 0.85)
  const estUtilities = l.avg_utilities || (l.true_cost - baseRent)

  // Transit mode logic based on distance
  const transitMode = l.transit_mode || (
    l.distance_miles <= 0.4 ? '🚶 Walk (8 min)' :
    l.distance_miles <= 1.0 ? '🚌 Campus Shuttle (5 min)' :
    l.distance_miles <= 2.5 ? '🚲 Bike / Scooter (10 min)' :
    '🚆 BART / Bus Line (15 min)'
  )

  // Terrain / Accessibility tag
  const terrainTag = l.terrain || (l.distance_miles > 1.2 ? '⛰️ Uphill Walk' : '♿ Flat / Accessible')

  return (
    <li>
      <Link
        to={`/listing/${l.id}`}
        onMouseEnter={() => onHover?.(l.id)}
        onFocus={() => onHover?.(l.id)}
        className={`group block rounded-2xl border p-4 transition-all duration-200 shadow-sm ${
          active
            ? 'border-violet-500 bg-white ring-2 ring-violet-400/40 shadow-lg -translate-y-0.5'
            : 'border-slate-200/80 bg-white/95 hover:border-violet-300 hover:bg-white hover:shadow-md'
        }`}
      >
        {/* Header: Property Name & True Monthly Cost */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
              {l.name}
            </h3>
            <p className="text-xs text-slate-500">
              {l.bedrooms === 0 ? 'Studio' : `${l.bedrooms} Bed`} • {l.distance_miles} mi from campus
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xl font-black text-emerald-600">
              {money(l.true_cost)}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              True Cost / Mo
            </p>
          </div>
        </div>

        {/* Cost Breakdown Pill Bar */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/60 text-[11px] text-slate-600">
          <span>Rent: <strong className="text-slate-900">{money(baseRent)}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Est. Utilities: <strong className="text-amber-700">{money(estUtilities)}</strong></span>
        </div>

        {/* Transportation & Terrain Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {/* Best Transit Badge */}
          <span className="rounded-lg bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-bold text-teal-800">
            {transitMode}
          </span>

          {/* Terrain / Accessibility Badge */}
          <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
            terrainTag.includes('Uphill') 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            {terrainTag}
          </span>
        </div>

        {/* Rating & Safety Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Stars value={l.avg_rating} />
            <span className="text-xs font-semibold text-slate-500">({l.review_count})</span>
          </div>

          <SafetyBadge score={l.safety_score} />

          <span className="ml-auto text-[11px] font-bold text-violet-600">
            ✓ Student Verified
          </span>
        </div>
      </Link>
    </li>
  )
}