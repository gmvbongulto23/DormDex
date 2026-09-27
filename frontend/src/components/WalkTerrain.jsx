// Walking conditions from a listing to CSUEB.
// CSUEB sits on a hill above Hayward, so walks from the flatlands (west, north, south of campus)
// are uphill; places east of campus are in the Hayward hills. Close + below campus = steep.
// Extra route notes are fictional demo data, like the safety scores.

const CAMPUS_LNG = -122.0567

// Fictional per-listing route notes (demo data)
const ROUTE_NOTES = {
  19: [{ icon: '🪨', text: 'Uneven sidewalk' }],
  4: [{ icon: '🪨', text: 'Gravel shortcut' }],
  17: [{ icon: '🪜', text: 'Stairs on route' }],
  10: [{ icon: '🚧', text: 'No sidewalk in places' }],
}

export function walkTerrain(listing) {
  const miles = Number(listing.distance_miles)
  const east = listing.lng > CAMPUS_LNG + 0.005
  const tags = []

  if (east) {
    tags.push({ icon: '⛰️', text: 'Hilly both ways', level: 'warn' })
  } else if (miles <= 0.8) {
    tags.push({ icon: '⬆️', text: 'Steep uphill to campus', level: 'warn' })
    tags.push({ icon: '♿', text: 'Not wheelchair-friendly', level: 'warn' })
  } else {
    tags.push({ icon: '⬆️', text: 'Uphill to campus', level: 'info' })
    tags.push({ icon: '⬇️', text: 'Downhill home', level: 'info' })
  }

  for (const note of ROUTE_NOTES[listing.id] || []) tags.push({ ...note, level: 'warn' })
  return tags
}

export default function WalkTerrain({ listing }) {
  const tags = walkTerrain(listing)
  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">🚶 Walk to campus</p>
      <ul aria-label="Walking conditions to campus" className="mt-1.5 flex flex-wrap gap-1">
        {tags.map((t) => (
          <li
            key={t.text}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              t.level === 'warn'
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <span aria-hidden="true">{t.icon}</span> {t.text}
            <span className="sr-only">{t.level === 'warn' ? ' (warning)' : ' (no warning)'}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full border border-amber-300 bg-amber-100" />
          Yellow = warning
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full border border-slate-300 bg-slate-100" />
          Gray = no warning
        </span>
      </p>
    </div>
  )
}
