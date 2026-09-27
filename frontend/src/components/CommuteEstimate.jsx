// Estimated commute from a listing to CSUEB for each way of getting there.
// Estimates use distance only (no live traffic or schedules), so the UI labels them "estimated"
// and links to Google Maps for real directions.

const CAMPUS = { lat: 37.6566, lng: -122.0567, name: 'Cal State East Bay' }
const ROAD_FACTOR = 1.3 // streets are longer than a straight line

const MODES = [
  // speed in mph, extra minutes for waiting / parking / walking to a stop
  { key: 'walking', icon: '🚶', label: 'Walk', mph: 3, extra: 0, maxMiles: 2.5 },
  { key: 'bicycling', icon: '🚲', label: 'Bike', mph: 9, extra: 3, maxMiles: 6 },
  { key: 'transit', icon: '🚌', label: 'Bus / shuttle', mph: 12, extra: 12, maxMiles: 30 },
  { key: 'driving', icon: '🚗', label: 'Drive', mph: 20, extra: 7, maxMiles: 100 },
]

export function commuteOptions(distanceMiles) {
  const roadMiles = Number(distanceMiles) * ROAD_FACTOR
  return MODES.filter((m) => roadMiles <= m.maxMiles).map((m) => ({
    ...m,
    minutes: Math.max(2, Math.round((roadMiles / m.mph) * 60 + m.extra)),
  }))
}

// Suggested option for a student without a car: walk if 20 min or less, else bike if 20 min or less, else bus/shuttle
export function bestCommute(distanceMiles) {
  const options = commuteOptions(distanceMiles)
  return (
    options.find((o) => o.key === 'walking' && o.minutes <= 20) ||
    options.find((o) => o.key === 'bicycling' && o.minutes <= 20) ||
    options.find((o) => o.key === 'transit') ||
    options[0]
  )
}

function mapsLink(listing, mode) {
  const params = new URLSearchParams({
    api: '1',
    origin: `${listing.lat},${listing.lng}`,
    destination: `${CAMPUS.lat},${CAMPUS.lng}`,
    travelmode: mode,
  })
  return `https://www.google.com/maps/dir/?${params}`
}

export default function CommuteEstimate({ listing }) {
  const options = commuteOptions(listing.distance_miles)
  const best = bestCommute(listing.distance_miles)

  return (
    <section aria-labelledby="commute-heading" className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="commute-heading" className="text-sm font-extrabold uppercase tracking-wide text-teal-900">
          🎓 Getting to campus
        </h2>
        <span className="text-xs font-semibold text-teal-800">
          {listing.distance_miles} mi to {CAMPUS.name}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-700">
        Suggested: <strong>{best.icon} {best.label}</strong>, about <strong>{best.minutes} min</strong>
        {best.key !== 'driving' && <span className="text-slate-500"> (no car needed)</span>}.
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((o) => (
          <li key={o.key}>
            <a
              href={mapsLink(listing, o.key)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${o.label}: about ${o.minutes} minutes. Open directions in Google Maps`}
              className={`block rounded-xl border p-3 text-center transition hover:shadow-sm ${
                o.key === best.key ? 'border-teal-500 bg-white ring-2 ring-teal-200' : 'border-slate-200 bg-white'
              }`}
            >
              <span className="block text-xl" aria-hidden="true">{o.icon}</span>
              <span className="block text-xs font-bold text-slate-700">{o.label}</span>
              <span className="block text-lg font-black text-slate-900">~{o.minutes} min</span>
              {o.key === best.key && <span className="text-[10px] font-bold uppercase text-teal-700">Suggested</span>}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-slate-500">
        Estimated from distance; the campus is uphill, so walking and biking may take longer. Tap a mode for real
        directions in Google Maps.
      </p>
    </section>
  )
}
