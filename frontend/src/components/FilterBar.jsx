export default function FilterBar({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })
  const field = 'mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm'

  return (
    <form className="grid grid-cols-3 gap-2 border-b border-slate-200 bg-white p-3" onSubmit={(e) => e.preventDefault()}>
      <label className="text-xs font-medium text-slate-700">
        Max monthly cost
        <select className={field} value={filters.max_cost} onChange={set('max_cost')}>
          <option value="">Any</option>
          {[1600, 1800, 2000, 2400, 2800].map((v) => <option key={v} value={v}>${v.toLocaleString()}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-700">
        Min safety
        <select className={field} value={filters.min_safety} onChange={set('min_safety')}>
          <option value="">Any</option>
          {[5, 6, 7, 8].map((v) => <option key={v} value={v}>{v}+ / 10</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-700">
        Bedrooms
        <select className={field} value={filters.bedrooms} onChange={set('bedrooms')}>
          <option value="">Any</option>
          <option value="0">Studio</option>
          {[1, 2, 3].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
    </form>
  )
}
