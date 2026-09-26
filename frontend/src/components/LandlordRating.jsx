export default function LandlordRating({
  landlordName = 'Bay Management LLC',
  maintenanceScore = 4.2,
  depositFairness = 4.8,
  noiseScore = 3.5,
}) {
  const renderMetric = (label, score, max = 5) => {
    const percentage = (score / max) * 100
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-slate-600">{label}</span>
          <span className="text-slate-900">{score} / {max}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Landlord Transparency</span>
          <h4 className="text-xs font-black text-slate-900">{landlordName}</h4>
        </div>
        <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
          Verified Reviews
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {renderMetric('🔧 Maintenance Response Speed', maintenanceScore)}
        {renderMetric('💵 Deposit Return Fairness', depositFairness)}
        {renderMetric('🤫 Wall Insulation & Quietness', noiseScore)}
      </div>
    </div>
  )
}