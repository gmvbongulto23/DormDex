import { mockListings, mockDetails } from './mockData'

// Set VITE_API_URL in .env (local) or Vercel env vars. Unset = mock data, so the UI works before the backend is live.
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
export const USING_MOCK = !API_URL

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail
    throw new Error((msg || 'Something went wrong').replace(/^Value error, /, ''))
  }
  return data
}

export async function getListings(filters = {}) {
  if (USING_MOCK) {
    return mockListings
      .filter((l) => !filters.max_cost || l.true_cost <= filters.max_cost)
      .filter((l) => !filters.min_safety || l.safety_score >= filters.min_safety)
      .filter((l) => filters.bedrooms === '' || filters.bedrooms == null || l.bedrooms === Number(filters.bedrooms))
  }
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  )
  return request(`/listings?${params}`)
}

export async function getListing(id) {
  if (USING_MOCK) return mockDetails[id]
  return request(`/listings/${id}`)
}

export async function getSummary(id) {
  if (USING_MOCK) return { ai_summary: mockDetails[id]?.ai_summary }
  return request(`/listings/${id}/summary`)
}

export async function postReview(id, review) {
  if (USING_MOCK) {
    if (!review.email.toLowerCase().endsWith('.edu')) throw new Error('Please use your school .edu email')
    return { review: { ...review, id: Date.now(), created_at: new Date().toISOString(), verified: true } }
  }
  return request(`/listings/${id}/reviews`, { method: 'POST', body: JSON.stringify(review) })
}
