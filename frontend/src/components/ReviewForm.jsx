import { useState } from 'react'
import { postReview } from '../api'

const RATINGS = [
  ['overall_rating', 'Overall'],
  ['landlord_rating', 'Landlord'],
  ['maintenance_rating', 'Maintenance'],
  ['safety_rating', 'Safety'],
]
const empty = { email: '', overall_rating: 4, landlord_rating: 4, maintenance_rating: 4, safety_rating: 4, monthly_utilities: '', text: '' }

export default function ReviewForm({ listingId, onAdded }) {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState({ type: '', msg: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const input = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'

  async function submit(e) {
    e.preventDefault()
    setStatus({ type: 'loading', msg: 'Submitting…' })
    try {
      const payload = {
        ...form,
        monthly_utilities: Number(form.monthly_utilities),
        ...Object.fromEntries(RATINGS.map(([k]) => [k, Number(form[k])])),
      }
      const res = await postReview(listingId, payload)
      setForm(empty)
      setStatus({ type: 'ok', msg: 'Thanks! Your verified review is live.' })
      onAdded?.(res)
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Review this place</h2>

      <label className="block text-sm font-medium">
        School email (.edu)
        <input type="email" required className={input} value={form.email} onChange={set('email')}
          placeholder="you@horizon.csueastbay.edu" aria-describedby="email-help" />
        <span id="email-help" className="text-xs text-slate-500">Only used to verify you're a student. Never shown.</span>
      </label>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-1 text-sm font-medium">Ratings (1 = poor, 5 = great)</legend>
        {RATINGS.map(([k, label]) => (
          <label key={k} className="text-sm">
            {label}
            <select className={input} value={form[k]} onChange={set(k)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        ))}
      </fieldset>

      <label className="block text-sm font-medium">
        Your average monthly utilities (USD)
        <input type="number" min="0" max="2000" required inputMode="numeric" className={input}
          value={form.monthly_utilities} onChange={set('monthly_utilities')} placeholder="e.g. 160" />
      </label>

      <label className="block text-sm font-medium">
        Your experience
        <textarea required minLength={10} maxLength={1000} rows={4} className={input}
          value={form.text} onChange={set('text')}
          placeholder="How is the landlord? Maintenance? Parking? Noise? Anything you wish you knew before signing?" />
      </label>

      <button type="submit" disabled={status.type === 'loading'}
        className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        Submit review
      </button>

      {status.msg && (
        <p role={status.type === 'error' ? 'alert' : 'status'}
          className={`text-sm ${status.type === 'error' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {status.msg}
        </p>
      )}
    </form>
  )
}
