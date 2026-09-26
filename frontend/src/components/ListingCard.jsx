import { Link } from 'react-router-dom'
import { money, Stars, SafetyBadge } from './ui'

export default function ListingCard({ listing: l, active, onHover }) {
  return (
    <li>
      <Link
        to={`/listing/${l.id}`}
        onMouseEnter={() => onHover?.(l.id)}
        onFocus={() => onHover?.(l.id)}
        className={`block rounded-lg border bg-white p-3 transition hover:shadow-md ${active ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{l.name}</h3>
            <p className="text-xs text-slate-500">
              {l.bedrooms === 0 ? 'Studio' : `${l.bedrooms} bd`} · {l.distance_miles} mi to campus · {l.landlord_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-brand-dark">{money(l.true_cost)}</p>
            <p className="text-[11px] text-slate-500">true cost/mo</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Stars value={l.avg_rating} />
          <span className="text-xs text-slate-500">({l.review_count})</span>
          <SafetyBadge score={l.safety_score} />
        </div>
      </Link>
    </li>
  )
}
