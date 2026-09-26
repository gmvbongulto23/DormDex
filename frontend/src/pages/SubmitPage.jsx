import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SubmitPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    propertyName: '',
    campus: 'csueb',
    bedrooms: '1',
    baseRent: '',
    avgUtilities: '',
    transitMode: '🚶 Walk (under 10 min)',
    terrain: '♿ Flat / Accessible Route',
    safetyScore: '4',
    overallRating: '5',
    landlordName: '',
    reviewText: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate submission success
    setSubmitted(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 transition mb-4"
      >
        ← Back to Listings
      </Link>

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 md:p-8 shadow-lg backdrop-blur-md">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-extrabold text-violet-800">
            Peer Housing Intelligence
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Submit Property & Utility Review</h1>
          <p className="text-xs font-medium text-slate-500">
            Help fellow students know the true monthly cost and commute before signing a lease.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-2">
            <span className="text-4xl">🎉</span>
            <h2 className="text-xl font-black text-emerald-900">Review Submitted!</h2>
            <p className="text-xs font-semibold text-emerald-700">
              Thank you for contributing to your campus housing community. Redirecting to homepage...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campus & Property Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Campus</label>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="csueb">CSU East Bay</option>
                  <option value="sjsu">San Jose State</option>
                  <option value="ucb">UC Berkeley</option>
                  <option value="sfsu">SF State</option>
                  <option value="scu">Santa Clara University</option>
                  <option value="ucd">UC Davis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property or Building Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University Terrace Apartments"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>

            {/* Financials: Rent & Utilities */}
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-amber-900 tracking-wide">Monthly Cost Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bedrooms</label>
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                  >
                    <option value="0">Studio</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Bed</option>
                    <option value="3">3+ Bed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Monthly Rent ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="1850"
                    value={formData.baseRent}
                    onChange={(e) => setFormData({ ...formData, baseRent: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Avg Utilities ($/mo)</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={formData.avgUtilities}
                    onChange={(e) => setFormData({ ...formData, avgUtilities: e.target.value })}
                    className="w-full rounded-xl border border-amber-300 bg-white p-2 text-xs font-semibold text-amber-900"
                  />
                </div>
              </div>
            </div>

            {/* Transit & Accessibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Best Transit Option to Campus</label>
                <select
                  value={formData.transitMode}
                  onChange={(e) => setFormData({ ...formData, transitMode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="🚶 Walk (under 10 min)">🚶 Walk (under 10 min)</option>
                  <option value="🚌 Campus Shuttle (5-10 min)">🚌 Campus Shuttle (5-10 min)</option>
                  <option value="🚲 Bike / Scooter (5-15 min)">🚲 Bike / Scooter (5-15 min)</option>
                  <option value="🚆 BART / Bus Line">🚆 BART / Bus Line</option>
                  <option value="🚗 Drive / Carpool">🚗 Drive / Carpool</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terrain & Route Safety</label>
                <select
                  value={formData.terrain}
                  onChange={(e) => setFormData({ ...formData, terrain: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="♿ Flat / Accessible Route">♿ Flat / Accessible Route</option>
                  <option value="⛰️ Uphill Walk">⛰️ Uphill Walk</option>
                  <option value="🚲 Dedicated Bike Lane">🚲 Dedicated Bike Lane</option>
                  <option value="🌙 Well-Lit Street">🌙 Well-Lit Street</option>
                </select>
              </div>
            </div>

            {/* Ratings & Landlord Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landlord / Management Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bay Management LLC"
                  value={formData.landlordName}
                  onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Neighborhood Safety Score (1-5)</label>
                <select
                  value={formData.safetyScore}
                  onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold"
                >
                  <option value="5">🛡️ 5/5 - Very Safe</option>
                  <option value="4">🛡️ 4/5 - Moderate / Safe</option>
                  <option value="3">🛡️ 3/5 - Average</option>
                  <option value="2">⚠️ 2/5 - Caution Needed</option>
                </select>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Review / Utility Advice</label>
              <textarea
                rows="3"
                required
                placeholder="Share advice about water pressure, noise levels, internet reliability, or seasonal heating/cooling bills..."
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3 text-xs font-extrabold text-white shadow-md shadow-violet-200 hover:bg-violet-700 transition active:scale-[0.98]"
            >
              Post Review to Campus Feed
            </button>
          </form>
        )}
      </div>
    </div>
  )
}