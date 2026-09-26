import React from 'react'

// Option values match the real data: true cost is about $1,400-$3,000, safety is a 1-10 demo score.
export default function FilterBar({ filters, onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const selectClass =
    'w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-violet-500'
  const labelClass = 'block text-[11px] font-extrabold uppercase text-slate-500 mb-1'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Max True Cost */}
      <div>
        <label htmlFor="filter-max-cost" className={labelClass}>Max Monthly Cost</label>
        <select
          id="filter-max-cost"
          value={filters.max_cost}
          onChange={(e) => handleChange('max_cost', e.target.value)}
          className={selectClass}
        >
          <option value="">Any Cost</option>
          <option value="1800">Under $1,800</option>
          <option value="2200">Under $2,200</option>
          <option value="2600">Under $2,600</option>
        </select>
      </div>

      {/* 2. Min Safety Score (1-10) */}
      <div>
        <label htmlFor="filter-min-safety" className={labelClass}>Min Safety</label>
        <select
          id="filter-min-safety"
          value={filters.min_safety}
          onChange={(e) => handleChange('min_safety', e.target.value)}
          className={selectClass}
        >
          <option value="">Any Safety</option>
          <option value="6">6+ / 10</option>
          <option value="7">7+ / 10</option>
          <option value="8">8+ / 10</option>
        </select>
      </div>

      {/* 3. Bedrooms */}
      <div>
        <label htmlFor="filter-bedrooms" className={labelClass}>Bedrooms</label>
        <select
          id="filter-bedrooms"
          value={filters.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          className={selectClass}
        >
          <option value="">Any Size</option>
          <option value="0">Studio</option>
          <option value="1">1 Bed</option>
          <option value="2">2 Beds</option>
          <option value="3">3 Beds</option>
        </select>
      </div>

      {/* 4. Sort By */}
      <div>
        <label htmlFor="filter-sort" className={labelClass}>Sort By</label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-violet-700 focus:ring-2 focus:ring-violet-500"
        >
          <option value="true_cost">Cheapest (True Cost)</option>
          <option value="safety">Safest (Safety Score)</option>
          <option value="rating">Top Rated (Student Reviews)</option>
          <option value="distance">Closest to Campus</option>
        </select>
      </div>
    </div>
  )
}
