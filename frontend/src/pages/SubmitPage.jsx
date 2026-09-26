import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getListings, postReview, verifyReview } from '../api'

export default function SubmitReviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(searchParams.get('listing') || '')
  
  // Step & Verification State
  const [step, setStep] = useState(1)
  const [reviewId, setReviewId] = useState(null)
  const [demoCode, setDemoCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  // Backend exact payload state
  const [formData, setFormData] = useState({
    email: '',
    overall_rating: 5,
    landlord_rating: 4,
    maintenance_rating: 4,
    safety_rating: 4,
    monthly_utilities: 100,
    text: '',
    transit: 'Walk',
    terrain: 'Flat'
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getListings()
      .then((data) => {
        setListings(data)
        if (!selectedListing && data.length > 0) {
          setSelectedListing(data[0].id)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Step 1: Submit review to get verification code
  const handleSubmitStep1 = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const payload = {
        email: formData.email,
        overall_rating: Number(formData.overall_rating),
        landlord_rating: Number(formData.landlord_rating),
        maintenance_rating: Number(formData.maintenance_rating),
        safety_rating: Number(formData.safety_rating),
        monthly_utilities: Number(formData.monthly_utilities),
        text: formData.text
      }

      const res = await postReview(selectedListing, payload)
      setReviewId(res.review_id)
      if (res.demo_code) setDemoCode(res.demo_code)
      setStep(2)
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Make sure to use a valid student email.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-digit code
  const handleVerifyStep2 = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      await verifyReview(reviewId, verificationCode.trim())
      navigate(`/listing/${selectedListing}`)
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Wrong code or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900">Submit a Verified Housing Review</h1>

        {/* Global Error Alert Box */}
        {errorMessage && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmitStep1} className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Listing Selection Dropdown */}
            <div className="space-y-1">
              <label className="block">Select Property</label>
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 font-medium focus:ring-2 focus:ring-violet-500"
                required
              >
                {listings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* School Email */}
            <div className="space-y-1">
              <label className="block">Campus Email (.edu / campus email)</label>
              <input
                type="email"
                name="email"
                required
                placeholder="student@csueastbay.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50"
              />
            </div>

            {/* Monthly Utilities */}
            <div className="space-y-1">
              <label className="block">Actual Average Monthly Utilities ($)</label>
              <input
                type="number"
                name="monthly_utilities"
                required
                min="0"
                value={formData.monthly_utilities}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50"
              />
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block mb-1">Overall Rating (1–5)</label>
                <input
                  type="number"
                  name="overall_rating"
                  min="1"
                  max="5"
                  value={formData.overall_rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block mb-1">Landlord Rating (1–5)</label>
                <input
                  type="number"
                  name="landlord_rating"
                  min="1"
                  max="5"
                  value={formData.landlord_rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block mb-1">Maintenance (1–5)</label>
                <input
                  type="number"
                  name="maintenance_rating"
                  min="1"
                  max="5"
                  value={formData.maintenance_rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block mb-1">Safety Rating (1–5)</label>
                <input
                  type="number"
                  name="safety_rating"
                  min="1"
                  max="5"
                  value={formData.safety_rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50"
                />
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-1 pt-2">
              <label className="block">Review Details</label>
              <textarea
                name="text"
                rows="3"
                required
                placeholder="Share your experience with water pressure, internet, landlord response times..."
                value={formData.text}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
            >
              {loading ? 'Sending Verification...' : 'Continue to Verification →'}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code Form */
          <form onSubmit={handleVerifyStep2} className="space-y-4 text-xs font-semibold text-slate-700">
            <p className="text-slate-600">Enter the 6-digit code sent to your email.</p>

            {demoCode && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-amber-900 font-bold">
                🧪 Demo mode active! Your code is: <span className="underline text-amber-950 font-black">{demoCode}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-center text-lg tracking-widest font-mono bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              {loading ? 'Verifying...' : 'Verify & Publish Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}