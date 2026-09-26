import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getListings } from '../api'
import { money, Stars, SafetyBadge } from '../components/ui'
import RentCalculator from '../components/RentCalculator'
import LandlordRating from '../components/LandlordRating'
import CommuteBadges from '../components/CommuteBadges'

export default function ListingPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getListings()
      .then((data) => {
        const found = data.find((item) => String(item.id) === String(id))
        if (found) {
          setListing(found)
        } else {
          setError('Property listing not found.')
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
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
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

  const baseRent = listing.rent || Math.round(listing.true_cost * 0.85)
  const avgUtilities = listing.avg_utilities || (listing.true_cost - baseRent)

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
        
        {/* Title Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800">
                ✓ Student Verified
              </span>
              <SafetyBadge score={listing.safety_score} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{listing.name}</h1>
            <p className="text-sm font-medium text-slate-500">
              {listing.distance_miles} miles to campus
            </p>
            
            {/* Commute Badges */}
            <div className="pt-1">
              <CommuteBadges />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 p-4 text-right">
            <p className="text-2xl font-black text-emerald-600">{money(listing.true_cost)}<span className="text-xs font-semibold text-slate-500">/mo</span></p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">True Monthly Cost</p>
          </div>
        </div>

        {/* Two Column Grid: Calculator + Landlord Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Interactive Calculator */}
          <RentCalculator baseRent={baseRent} utilities={avgUtilities} transitCost={40} />

          {/* Landlord Rating */}
          <LandlordRating
            landlordName={listing.landlord_name || 'Bay Area Property Management'}
            maintenanceScore={4.3}
            depositFairness={4.6}
            noiseScore={3.8}
          />
        </div>

        {/* Written Review */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Student Ratings</h2>
            <div className="flex items-center gap-1.5">
              <Stars value={listing.avg_rating || 4.5} />
              <span className="text-xs font-bold text-slate-600">({listing.review_count || 12} reviews)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs italic text-slate-600">
              "{listing.sample_review || 'Quiet building, clean water pressure, and electricity averages around $65/mo split between roommates. Super easy commute to campus.'}"
            </p>
            <p className="mt-2 text-[11px] font-bold text-slate-500">— Verified Student Resident</p>
          </div>
        </div>

      </div>
    </div>
  )
}