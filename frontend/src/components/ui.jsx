import React from 'react'

export function money(val) {
  if (val === undefined || val === null) return '$0'
  return `$${Math.round(val).toLocaleString()}`
}

export function Stars({ value = 0 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= Math.round(value) ? 'text-amber-400' : 'text-slate-200'}>
        ★
      </span>
    )
  }
  return <div className="inline-flex text-sm">{stars}</div>
}

export function SafetyBadge({ score }) {
  if (!score) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
      🛡️ Safety: <strong className="font-extrabold">{score}</strong>
      <span className="text-[10px] uppercase font-normal text-blue-500">(demo score)</span>
    </span>
  )
}