export const money = (n) => `$${Number(n).toLocaleString()}`

export function Stars({ value, label = 'rating' }) {
  if (value == null) return <span className="text-sm text-slate-500">No ratings yet</span>
  const full = Math.round(value)
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} out of 5 ${label}`}>
      <span aria-hidden="true" className="text-amber-500">
        {'★'.repeat(full)}<span className="text-slate-300">{'★'.repeat(5 - full)}</span>
      </span>
      <span className="text-sm font-medium">{value}</span>
    </span>
  )
}

export function SafetyBadge({ score }) {
  const [bg, word] =
    score >= 7.5 ? ['bg-emerald-100 text-emerald-800', 'Safer']
    : score >= 5.5 ? ['bg-amber-100 text-amber-800', 'Mixed']
    : ['bg-rose-100 text-rose-800', 'Use caution']
  // Word + number, never color alone
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bg}`}>
      Safety {score}/10 · {word}
    </span>
  )
}
