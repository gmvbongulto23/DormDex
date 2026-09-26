export default function FilterPresets({ activeFilter, onFilterChange }) {
  const presets = [
    { id: 'all', label: '✨ All Listings' },
    { id: 'under1200', label: '💸 Under $1,200 Total' },
    { id: 'walkable', label: '🚶 Walkable (<15 min)' },
    { id: 'utilsIncluded', label: '⚡ Utilities Included' },
    { id: 'petFriendly', label: '🐾 Pet Friendly' },
    { id: 'shuttleAccess', label: '🚌 Direct Shuttle' },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {presets.map((preset) => {
        const isActive = activeFilter === preset.id
        return (
          <button
            key={preset.id}
            onClick={() => onFilterChange(preset.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}