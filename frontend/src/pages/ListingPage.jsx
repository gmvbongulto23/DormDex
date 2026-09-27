import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getListing, getSummary } from '../api'
import { money, Stars, SafetyBadge } from '../components/ui'
import RentCalculator from '../components/RentCalculator'
import LandlordRating from '../components/LandlordRating'
import CommuteEstimate, { bestCommute } from '../components/CommuteEstimate'

export default function ListingPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getListing(id)
      .then((data) => {
        setListing(data)
        if (data.ai_summary) {
          setSummary(data.ai_summary)
        } else {
          setSummary('')
          getSummary(id).then((s) => setSummary(s.ai_summary)).catch(() => {})
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex items-center gap-2 text-violet-600 font-bold">
          <span className="h-3 w-3 animate-ping rounded-full bg-violet-600"></span>
          Loading property details...
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h2 className="text-lg font-bold">Unable to load listing</h2>
          <p className="mt-1 text-sm text-rose-600">{error || 'This property might have been removed.'}</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-violet-700"
          >
            ← Back to all listings
          </Link>
        </div>
      </div>
    )
  }

  const reviews = listing.reviews || []
  const hasReviews = listing.review_count > 0

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-900 transition"
      >
        ← Back to Campus Map & Listings
      </Link>

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-md backdrop-blur-md space-y-6">
        <div className="relative">
          <img
            src={`/photos/${listing.id}.jpg`}
            alt={`Sample photo for ${listing.name}`}
            className="h-64 w-full rounded-2xl object-cover"
          />
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
            Sample photo · not the actual unit
          </span>
        </div>

        {/* Title Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {hasReviews && (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800">
                  ✓ {listing.review_count} verified {listing.review_count === 1 ? 'review' : 'reviews'}
                </span>
              )}
              <SafetyBadge score={listing.safety_score} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{listing.name}</h1>
            <p className="text-sm font-medium text-slate-500">
              {listing.address} • {listing.distance_miles} miles to campus
              {listing.landlord_name && <> • Landlord: <strong className="text-slate-700">{listing.landlord_name}</strong></>}
            </p>
            <p className="pt-1 text-sm font-semibold text-teal-800">
              {bestCommute(listing.distance_miles).icon} ~{bestCommute(listing.distance_miles).minutes} min to campus by {bestCommute(listing.distance_miles).label.toLowerCase()}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 p-4 text-right">
            <p className="text-2xl font-black text-emerald-600">
              {money(listing.true_cost)}<span className="text-xs font-semibold text-slate-500">/mo</span>
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">True Monthly Cost</p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              {money(listing.rent)} rent +{' '}
              {listing.utilities_reported
                ? `${money(listing.avg_utilities)} utilities (median of ${listing.review_count} students)`
                : 'utilities not yet reported'}
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <section aria-labelledby="ai-summary-heading" className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
          <h2 id="ai-summary-heading" className="text-xs font-extrabold uppercase tracking-wide text-violet-800">
            ✨ AI summary of student reviews
          </h2>
          <p className="mt-1 text-sm text-slate-700" aria-live="polite">
            {summary || 'Summarizing reviews…'}
          </p>
        </section>

        {/* Commute to campus */}
        <CommuteEstimate listing={listing} />

        {/* Two Column Grid: Calculator + Landlord Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RentCalculator baseRent={listing.rent} utilities={listing.avg_utilities || 0} transitCost={40} />

          {hasReviews && listing.avg_landlord_rating != null ? (
            <LandlordRating
              landlordName={listing.landlord_name}
              maintenanceScore={listing.avg_maintenance_rating}
              depositFairness={listing.avg_landlord_rating}
              noiseScore={listing.avg_safety_rating}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No landlord ratings yet. Be the first to review this place.
            </div>
          )}
        </div>

        {/* Reviews */}
        <section aria-labelledby="reviews-heading" className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="reviews-heading" className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Student Reviews
            </h2>
            <div className="flex items-center gap-2">
              {hasReviews && <Stars value={listing.avg_rating} />}
              <Link
                to={`/submit?listing=${listing.id}`}
                className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                + Write a review
              </Link>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No reviews yet. Be the first.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars value={r.overall_rating} />
                    {r.verified && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        ✓ Verified student email
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{r.text}</p>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Utilities {money(r.monthly_utilities)}/mo · Landlord {r.landlord_rating}/5 · Maintenance {r.maintenance_rating}/5 · Safety {r.safety_rating}/5 · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
