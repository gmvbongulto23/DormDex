import React from 'react'

export default function FilterBar({ filters, onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Max True Cost */}
      <div>
        <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Max Cost</label>
        <select
          value={filters.max_cost}
          onChange={(e) => handleChange('max_cost', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Any Cost</option>
          <option value="1000">Under $1,000</option>
          <option value="1250">Under $1,250</option>
          <option value="1500">Under $1,500</option>
        </select>
      </div>

      {/* 2. Min Safety Rating */}
      <div>
        <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Min Safety</label>
        <select
          value={filters.min_safety}
          onChange={(e) => handleChange('min_safety', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Any Rating</option>
          <option value="4">4.0+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      {/* 3. Bedrooms */}
      <div>
        <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Bedrooms</label>
        <select
          value={filters.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Any Size</option>
          <option value="1">1 Bed</option>
          <option value="2">2 Beds</option>
          <option value="3">3+ Beds</option>
        </select>
      </div>

      {/* 4. Sort By Dropdown */}
      <div>
        <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Sort By</label>
        <select
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