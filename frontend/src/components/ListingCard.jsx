import React from 'react'
import { Link } from 'react-router-dom'
import { money, Stars, SafetyBadge } from './ui'

export default function ListingCard({ listing, active, onHover }) {
  if (!listing) return null
  const reviewCount = listing.review_count || 0

  return (
    <li
      onMouseEnter={() => onHover && onHover(listing.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 list-none ${
        active ? 'border-violet-500 ring-2 ring-violet-200' : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            {reviewCount > 0 && (
              <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 mb-1.5">
                ✓ {reviewCount} {reviewCount === 1 ? 'verified review' : 'verified reviews'}
              </span>
            )}
            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{listing.name}</h3>
            <p className="text-xs font-medium text-slate-500">{listing.distance_miles} miles from campus</p>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-emerald-600">{money(listing.true_cost)}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-400">/ mo total</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <SafetyBadge score={listing.safety_score} />
          <div className="flex items-center gap-1">
            <Stars value={listing.avg_rating || 0} />
            <span className="font-bold text-slate-600">({reviewCount})</span>
          </div>
        </div>

        <Link
          to={`/listing/${listing.id}`}
          className="block w-full text-center rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-violet-600 hover:text-white transition"
        >
          View Details
        </Link>
      </div>
    </li>
  )
}