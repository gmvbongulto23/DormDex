import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getListing, getSummary } from '../api'
import { money, Stars, SafetyBadge } from '../components/ui'
import ReviewForm from '../components/ReviewForm'

export default function ListingPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await getListing(id)
      setListing(data)
      if (data.ai_summary) setSummary(data.ai_summary)
      else {
        setSummary('')
        getSummary(id).then((s) => setSummary(s.ai_summary)).catch(() => {})
      }
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p role="alert" className="p-6 text-rose-700">{error}</p>
  if (!listing) return <p className="p-6">Loading…</p>

  const l = listing
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 p-4">
        <Link to="/" className="text-sm font-medium text-brand hover:underline">← Back to map</Link>

        <div>
          <h1 className="text-2xl font-bold">{l.name}</h1>
          <p className="text-slate-600">{l.address}</p>
          <p className="text-sm text-slate-500">
            {l.bedrooms === 0 ? 'Studio' : `${l.bedrooms} bedroom`} · {l.distance_miles} mi to CSUEB · Landlord: {l.landlord_name}
          </p>
        </div>

        {/* The hero of the demo: the true monthly cost */}
        <section aria-labelledby="cost-h" className="rounded-xl bg-brand p-5 text-white">
          <h2 id="cost-h" className="text-sm font-medium uppercase tracking-wide text-indigo-100">True monthly cost</h2>
          <p className="mt-1 text-4xl font-extrabold">{money(l.true_cost)}</p>
          <p className="mt-2 text-indigo-100">
            {money(l.rent)} rent +{' '}
            {l.utilities_reported
              ? <>{money(l.avg_utilities)} avg. utilities from {l.review_count} students</>
              : 'utilities not yet reported'}
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Stars value={l.avg_rating} /> <span className="text-sm text-slate-500">{l.review_count} reviews</span>
          <SafetyBadge score={l.safety_score} />
        </div>

        <section aria-labelledby="ai-h" className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h2 id="ai-h" className="text-sm font-semibold text-brand-dark">✨ AI summary of student reviews</h2>
          <p className="mt-1" aria-live="polite">{summary || 'Summarizing reviews…'}</p>
        </section>

        <section aria-labelledby="rev-h" className="space-y-3">
          <h2 id="rev-h" className="text-lg font-semibold">Student reviews</h2>
          {l.reviews.length === 0 && <p className="text-slate-500">No reviews yet. Be the first.</p>}
          <ul className="space-y-3">
            {l.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars value={r.overall_rating} />
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Verified student</span>
                </div>
                <p className="mt-2">{r.text}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Utilities {money(r.monthly_utilities)}/mo · Landlord {r.landlord_rating}/5 · Maintenance {r.maintenance_rating}/5 · Safety {r.safety_rating}/5 · {new Date(r.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <ReviewForm listingId={l.id} onAdded={load} />
      </div>
    </div>
  )
}
