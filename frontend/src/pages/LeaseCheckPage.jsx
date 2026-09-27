import { useState } from 'react'
import { checkLease } from '../api'

// Fictional sample so anyone can try the checker without a real lease
const SAMPLE_LEASE = `RESIDENTIAL LEASE AGREEMENT (SAMPLE)
1. TERM. This lease begins August 15, 2026 and ends July 31, 2027. This lease will automatically renew for another 12 months unless Tenant gives written notice at least 60 days before the end date.
2. RENT. Monthly rent is $1,650, due on the 1st of each month. A late fee of $75 will be charged if rent is received after the 3rd.
3. DEPOSIT. Tenant shall pay a security deposit of $1,650. A cleaning fee of $250 will be deducted from the deposit at move-out and is non-refundable.
4. FEES. Tenant shall pay a non-refundable administrative fee of $150 and a parking fee of $50 per month for one assigned space.
5. UTILITIES. Tenant is responsible for all utilities, including electricity, gas, water, trash and internet.
6. ROOMMATES. All tenants signing this lease are jointly and severally liable for all rent and damages.
7. EARLY TERMINATION. If Tenant terminates this lease early, Tenant must pay an early termination fee equal to two months' rent.
8. ENTRY. Landlord may enter the premises at any reasonable time for inspections or repairs.
9. REPAIRS. Tenant is responsible for the cost of repairing any damage beyond normal wear and tear.`

const SEVERITY = {
  high: { label: 'Important', box: 'border-rose-200 bg-rose-50', badge: 'bg-rose-100 text-rose-800' },
  medium: { label: 'Check this', box: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-800' },
  low: { label: 'Good to know', box: 'border-slate-200 bg-slate-50', badge: 'bg-slate-200 text-slate-700' },
}

export default function LeaseCheckPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheck(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      setResult(await checkLease(text))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const flags = result?.red_flags || []
  const order = { high: 0, medium: 1, low: 2 }
  const sortedFlags = [...flags].sort((a, b) => order[a.severity] - order[b.severity])

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-extrabold text-violet-800">✨ AI Lease Checker</span>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Check a lease before you sign</h1>
          <p className="text-sm text-slate-600">
            Paste your lease (or part of it). We point out hidden fees, deposit rules and risky clauses in plain
            language, plus questions to ask the landlord. Nothing you paste is saved.
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-3">
          <label htmlFor="lease-text" className="block text-xs font-bold text-slate-700">Lease text</label>
          <textarea
            id="lease-text"
            rows={10}
            required
            minLength={50}
            maxLength={20000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the lease text here…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={loading || text.trim().length < 50}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Check my lease'}
            </button>
            <button
              type="button"
              onClick={() => { setText(SAMPLE_LEASE); setResult(null); setError('') }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Try a sample lease
            </button>
            <span className="text-xs text-slate-500">{text.length.toLocaleString()} / 20,000 characters</span>
          </div>
        </form>

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">⚠️ {error}</div>
        )}
      </div>

      {result && (
        <div className="space-y-6" aria-live="polite">
          {/* Summary */}
          <section aria-labelledby="lease-summary" className="rounded-3xl border border-violet-200 bg-violet-50/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="lease-summary" className="text-xs font-extrabold uppercase tracking-wide text-violet-800">Summary</h2>
              <span className="text-[11px] font-semibold text-slate-500">
                {result.source === 'ai' ? '✨ Checked with AI (Gemini)' : 'Basic keyword check (AI unavailable right now)'}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{result.summary}</p>
          </section>

          {/* Red flags */}
          <section aria-labelledby="lease-flags" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 id="lease-flags" className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              🚩 Things to watch ({sortedFlags.length})
            </h2>
            {sortedFlags.length === 0 ? (
              <p className="text-sm text-slate-500">No red flags found. Still read the full lease carefully.</p>
            ) : (
              <ul className="space-y-3">
                {sortedFlags.map((f, i) => {
                  const s = SEVERITY[f.severity] || SEVERITY.low
                  return (
                    <li key={i} className={`rounded-2xl border p-4 ${s.box}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.badge}`}>{s.label}</span>
                        <h3 className="text-sm font-extrabold text-slate-900">{f.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{f.why}</p>
                      <blockquote className="mt-2 border-l-4 border-slate-300 pl-3 text-xs italic text-slate-600">“{f.quote}”</blockquote>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Costs */}
            <section aria-labelledby="lease-costs" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 id="lease-costs" className="text-sm font-extrabold uppercase tracking-wide text-slate-900">💵 Costs in this lease</h2>
              {result.costs.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No dollar amounts found.</p>
              ) : (
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-500">
                      <th className="py-1 font-bold">Item</th>
                      <th className="py-1 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.costs.map((c, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="py-2 text-slate-700">
                          {c.item}
                          {c.note && <span className="ml-1 text-[11px] font-semibold text-rose-700">({c.note})</span>}
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900">{c.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Questions */}
            <section aria-labelledby="lease-questions" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 id="lease-questions" className="text-sm font-extrabold uppercase tracking-wide text-slate-900">❓ Ask your landlord</h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                {result.questions.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </section>
          </div>

          <p className="text-center text-xs text-slate-500">
            This is not legal advice. For help with a lease, contact your campus student legal services or a local tenant rights group.
          </p>
        </div>
      )}
    </div>
  )
}
