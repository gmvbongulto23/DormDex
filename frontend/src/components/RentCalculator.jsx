import { useState } from 'react'

export default function RentCalculator({ baseRent = 1800, utilities = 150, transitCost = 45 }) {
  const [roommates, setRoommates] = useState(2)

  const totalMonthly = Number(baseRent) + Number(utilities) + Number(transitCost)
  const perPersonTotal = Math.round(totalMonthly / roommates)
  const perPersonRent = Math.round(Number(baseRent) / roommates)
  const perPersonUtils = Math.round((Number(utilities) + Number(transitCost)) / roommates)

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-violet-100">
        <div>
          <h3 className="text-sm font-black text-slate-900">🧮 Interactive True Cost Splitter</h3>
          <p className="text-[11px] font-medium text-slate-500">Adjust roommates to see per-person monthly total</p>
        </div>
        <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white shadow-sm">
          ${perPersonTotal} <span className="text-[10px] font-normal opacity-80">/person</span>
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Roommate Slider */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Roommates Sharing:</span>
            <span className="text-violet-700 font-extrabold">{roommates} {roommates === 1 ? 'Person (Solo)' : 'People'}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={roommates}
            onChange={(e) => setRoommates(Number(e.target.value))}
            className="w-full accent-violet-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Cost Breakdown Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1.5">
            <span>Rent: ${perPersonRent}</span>
            <span>Utils + Transit: ${perPersonUtils}</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              style={{ width: `${(perPersonRent / perPersonTotal) * 100}%` }}
              className="bg-violet-600 transition-all duration-300"
            />
            <div
              style={{ width: `${(perPersonUtils / perPersonTotal) * 100}%` }}
              className="bg-amber-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Itemized Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="rounded-xl bg-white p-2 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-semibold text-slate-400">Base Rent</span>
            <span className="font-extrabold text-slate-800">${perPersonRent}</span>
          </div>
          <div className="rounded-xl bg-white p-2 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-semibold text-slate-400">Utilities</span>
            <span className="font-extrabold text-amber-600">${Math.round(utilities / roommates)}</span>
          </div>
          <div className="rounded-xl bg-white p-2 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-semibold text-slate-400">Transit Pass</span>
            <span className="font-extrabold text-indigo-600">${Math.round(transitCost / roommates)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}