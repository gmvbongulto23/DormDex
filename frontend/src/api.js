import { mockListings as seedListings, mockDetails as seedDetails } from './mockData'

// Real backend when VITE_API_URL is set (frontend/.env locally, Vercel env var in production).
// Without it, the app falls back to mock data saved in this browser.
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
export const USING_MOCK = !API_URL

// ---------- Real API ----------
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // FastAPI errors: detail is a string ("Wrong code...") or a list of validation errors
    const msg = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail
    throw new Error((msg || 'Something went wrong').replace(/^Value error, /, ''))
  }
  return data
}

// ---------- Mock fallback (localStorage) ----------
const MOCK_LISTINGS_KEY = 'dormdex_mock_listings_v2'
const MOCK_DETAILS_KEY = 'dormdex_mock_details_v2'
const DEMO_CODE = '123456'

function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : structuredClone(fallback)
  } catch {
    return structuredClone(fallback)
  }
}

function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage blocked (private mode): changes just won't survive a reload
  }
}

let mockListings = loadState(MOCK_LISTINGS_KEY, seedListings)
let mockDetails = loadState(MOCK_DETAILS_KEY, seedDetails)
const pendingReviews = {}

const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const avgOf = (reviews, field) =>
  reviews.length ? Number((reviews.reduce((sum, r) => sum + Number(r[field]), 0) / reviews.length).toFixed(1)) : null

function recompute(detail) {
  const reviews = detail.reviews || []
  const utils = median(reviews.map((r) => Number(r.monthly_utilities)))
  detail.review_count = reviews.length
  detail.avg_utilities = reviews.length ? Math.round(utils) : null
  detail.utilities_reported = reviews.length > 0
  detail.true_cost = detail.rent + (detail.avg_utilities || 0)
  detail.avg_rating = avgOf(reviews, 'overall_rating')
  detail.avg_landlord_rating = avgOf(reviews, 'landlord_rating')
  detail.avg_maintenance_rating = avgOf(reviews, 'maintenance_rating')
  detail.avg_safety_rating = avgOf(reviews, 'safety_rating')
}

const SORTS = {
  true_cost: (a, b) => a.true_cost - b.true_cost,
  safety: (a, b) => b.safety_score - a.safety_score,
  rating: (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0),
  distance: (a, b) => a.distance_miles - b.distance_miles,
}

// ---------- Exported functions (same shapes in both modes) ----------
export async function getListings(filters = {}) {
  if (!USING_MOCK) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    )
    return request(`/listings?${params}`)
  }
  return mockListings
    .filter((l) => !filters.max_cost || l.true_cost <= Number(filters.max_cost))
    .filter((l) => !filters.min_safety || l.safety_score >= Number(filters.min_safety))
    .filter((l) => filters.bedrooms === '' || filters.bedrooms == null || l.bedrooms === Number(filters.bedrooms))
    .sort(SORTS[filters.sort] || SORTS.true_cost)
}

export async function getListing(id) {
  if (!USING_MOCK) return request(`/listings/${id}`)
  const detail = mockDetails[id]
  if (!detail) throw new Error('Listing not found')
  return detail
}

export async function getSummary(id) {
  if (!USING_MOCK) return request(`/listings/${id}/summary`)
  return { listing_id: id, ai_summary: mockDetails[id]?.ai_summary || 'No reviews yet. Be the first to share your experience.' }
}

// Step 1: returns { review_id, status: 'pending', email_mode, demo_code? }
export async function postReview(listingId, review) {
  if (!USING_MOCK) {
    return request(`/listings/${listingId}/reviews`, { method: 'POST', body: JSON.stringify(review) })
  }
  const domain = review.email.toLowerCase().split('@')[1] || ''
  if (!(domain === 'csueastbay.edu' || domain.endsWith('.csueastbay.edu'))) {
    throw new Error('Please use your school email (csueastbay.edu)')
  }
  const reviewId = `mock_${Date.now()}`
  pendingReviews[reviewId] = { listingId: String(listingId), review }
  return { review_id: reviewId, status: 'pending', email_mode: 'demo', demo_code: DEMO_CODE }
}

// Step 2: returns { review, listing }
export async function verifyReview(reviewId, code) {
  if (!USING_MOCK) {
    return request(`/reviews/${reviewId}/verify`, { method: 'POST', body: JSON.stringify({ code }) })
  }
  const pending = pendingReviews[reviewId]
  if (!pending) throw new Error('This code expired. Please submit your review again.')
  if (code !== DEMO_CODE) throw new Error('Wrong code. Please try again.')

  const detail = mockDetails[pending.listingId]
  const newReview = { ...pending.review, id: reviewId, created_at: new Date().toISOString(), verified: true }
  delete newReview.email // never shown, same as the backend
  detail.reviews = [newReview, ...(detail.reviews || [])]
  recompute(detail)

  const { reviews, ai_summary, ...summary } = detail
  mockListings = mockListings.map((l) => (String(l.id) === pending.listingId ? { ...l, ...summary } : l))
  saveState(MOCK_DETAILS_KEY, mockDetails)
  saveState(MOCK_LISTINGS_KEY, mockListings)
  delete pendingReviews[reviewId]
  return { review: newReview, listing: summary }
}

// AI lease checker: returns { source: 'ai' | 'basic', summary, red_flags, costs, questions }
export async function checkLease(text) {
  if (USING_MOCK) throw new Error('The lease checker needs the backend running (set VITE_API_URL).')
  return request('/lease/check', { method: 'POST', body: JSON.stringify({ text }) })
}
