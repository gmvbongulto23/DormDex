export default function CommuteBadges({ tags = [] }) {
  // Predefined style dictionary for consistent badge colors
  const badgeStyles = {
    uphill: 'bg-rose-50 text-rose-700 border-rose-200 icon-⛰️',
    flat: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shuttle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    lit: 'bg-amber-50 text-amber-800 border-amber-200',
    bike: 'bg-teal-50 text-teal-700 border-teal-200',
    walkable: 'bg-sky-50 text-sky-700 border-sky-200',
  }

  const defaultBadges = [
    { label: '⛰️ Uphill Walk', style: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: '🚌 AC Transit Line 60 Direct', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: '🌙 Well-Lit Route', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    { label: '🚲 Dedicated Bike Lane', style: 'bg-teal-50 text-teal-700 border-teal-200' },
  ]

  const itemsToRender = tags.length > 0 ? tags : defaultBadges

  return (
    <div className="flex flex-wrap gap-1.5">
      {itemsToRender.map((badge, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-2xs ${
            typeof badge === 'string' ? 'bg-slate-100 text-slate-700 border-slate-200' : badge.style
          }`}
        >
          {typeof badge === 'string' ? badge : badge.label}
        </span>
      ))}
    </div>
  )
}