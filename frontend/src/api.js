// LocalStorage Keys
const MOCK_STORAGE_KEY = 'app_mock_listings'
const MOCK_DETAILS_KEY = 'app_mock_details'

export const USING_MOCK = true

// Default mock listings with lat/lng coordinates
const defaultListings = [
  { 
    id: '1', 
    name: 'Campus Heights Apartments', 
    true_cost: 1150, 
    rent: 1050, 
    avg_utilities: 100, 
    distance_miles: 0.4, 
    safety_score: 4.8, 
    avg_rating: 4.6, 
    review_count: 5, 
    ai_summary: 'Overall a very popular choice among students due to close proximity to campus.',
    lat: 37.6580,
    lng: -122.0590
  },
  { 
    id: '2', 
    name: 'University Village Suites', 
    true_cost: 1350, 
    rent: 1200, 
    avg_utilities: 150, 
    distance_miles: 1.2, 
    safety_score: 4.2, 
    avg_rating: 4.1, 
    review_count: 3, 
    ai_summary: 'Spacious floorplans with great natural light.',
    lat: 37.6520,
    lng: -122.0680
  }
]

const defaultDetails = {
  '1': {
    id: '1',
    name: 'Campus Heights Apartments',
    true_cost: 1150,
    rent: 1050,
    avg_utilities: 100,
    distance_miles: 0.4,
    safety_score: 4.8,
    avg_rating: 4.6,
    review_count: 5,
    ai_summary: null,
    lat: 37.6580,
    lng: -122.0590,
    reviews: [
      { id: 'r1', text: 'Clean water pressure, electricity averages around $100/mo split between roommates.', overall_rating: 5, created_at: '2026-02-10' },
      { id: 'r2', text: 'Super easy 5 minute walk to class. Landlord responds fast.', overall_rating: 4, created_at: '2026-03-01' }
    ]
  },
  '2': {
    id: '2',
    name: 'University Village Suites',
    true_cost: 1350,
    rent: 1200,
    avg_utilities: 150,
    distance_miles: 1.2,
    safety_score: 4.2,
    avg_rating: 4.1,
    review_count: 3,
    ai_summary: 'Spacious units with modern kitchen amenities.',
    lat: 37.6520,
    lng: -122.0680,
    reviews: [
      { id: 'r3', text: 'A bit pricier, but quiet during midterms.', overall_rating: 4, created_at: '2026-01-15' }
    ]
  }
}

function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (e) {
    return fallback
  }
}

function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save state to localStorage', e)
  }
}

let mockListings = loadState(MOCK_STORAGE_KEY, defaultListings)
let mockDetails = loadState(MOCK_DETAILS_KEY, defaultDetails)

// Pending review buffer for 2-step verification mock
const pendingReviews = {}

export async function getListings(params = {}) {
  let list = [...mockListings]

  // Filter params
  if (params.max_cost) list = list.filter(item => item.true_cost <= Number(params.max_cost))
  if (params.min_safety) list = list.filter(item => item.safety_score >= Number(params.min_safety))

  // Sort matching backend criteria
  const sort = params.sort || 'true_cost'
  if (sort === 'true_cost') list.sort((a, b) => a.true_cost - b.true_cost)
  if (sort === 'safety') list.sort((a, b) => b.safety_score - a.safety_score)
  if (sort === 'rating') list.sort((a, b) => b.avg_rating - a.avg_rating)
  if (sort === 'distance') list.sort((a, b) => a.distance_miles - b.distance_miles)

  return list
}

export async function getListing(id) {
  const item = mockDetails[id] || mockListings.find(l => String(l.id) === String(id))
  if (!item) throw new Error('Listing not found')
  return item
}

export async function getSummary(id) {
  const listing = mockDetails[id]
  const summaryText = listing?.ai_summary || 'AI Summary: Quiet environment with low noise complaints and walkable access to campus facilities.'
  if (mockDetails[id]) {
    mockDetails[id].ai_summary = summaryText
    saveState(MOCK_DETAILS_KEY, mockDetails)
  }
  return { summary: summaryText }
}

export async function postReview(listingId, data) {
  const reviewId = 'rev_' + Date.now()
  pendingReviews[reviewId] = { listingId, data }
  return { review_id: reviewId, status: 'pending', demo_code: '123456' }
}

export async function verifyReview(reviewId, code) {
  if (code !== '123456') {
    throw new Error('Invalid verification code. Please try again or check demo code.')
  }

  const pending = pendingReviews[reviewId]
  if (!pending) throw new Error('Review session expired or invalid ID.')

  const { listingId, data } = pending
  const targetDetail = mockDetails[listingId] || {
    id: listingId,
    name: 'Property ' + listingId,
    true_cost: 1200,
    rent: 1000,
    avg_utilities: Number(data.monthly_utilities) || 100,
    distance_miles: 0.5,
    safety_score: Number(data.safety_rating) || 4.0,
    avg_rating: Number(data.overall_rating) || 4.0,
    review_count: 0,
    ai_summary: null,
    lat: 37.6550,
    lng: -122.0620,
    reviews: []
  }

  // Add review
  const newReview = {
    id: reviewId,
    text: data.text,
    overall_rating: Number(data.overall_rating),
    created_at: new Date().toISOString().split('T')[0]
  }
  targetDetail.reviews = [newReview, ...(targetDetail.reviews || [])]

  // Recompute aggregates
  const utilsList = [Number(data.monthly_utilities)].filter(Boolean)
  const sortedUtils = [...utilsList].sort((a, b) => a - b)
  const medianUtils = sortedUtils.length ? sortedUtils[Math.floor(sortedUtils.length / 2)] : targetDetail.avg_utilities
  
  targetDetail.review_count = targetDetail.reviews.length
  targetDetail.avg_utilities = medianUtils
  targetDetail.true_cost = (targetDetail.rent || 1000) + medianUtils

  const ratingsSum = targetDetail.reviews.reduce((acc, r) => acc + (r.overall_rating || 0), 0)
  targetDetail.avg_rating = Number((ratingsSum / targetDetail.review_count).toFixed(1))

  mockDetails[listingId] = targetDetail
  
  // Sync to mockListings array
  const index = mockListings.findIndex(l => String(l.id) === String(listingId))
  if (index !== -1) {
    mockListings[index] = { ...mockListings[index], ...targetDetail }
  } else {
    mockListings.push(targetDetail)
  }

  saveState(MOCK_DETAILS_KEY, mockDetails)
  saveState(MOCK_STORAGE_KEY, mockListings)

  delete pendingReviews[reviewId]
  return { status: 'verified', listing_id: listingId }
}