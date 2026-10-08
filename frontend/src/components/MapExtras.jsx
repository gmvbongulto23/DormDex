import React from "react";
import { Circle, CircleMarker, Marker, Popup } from "react-leaflet";
import { getListingTags } from "../api";

const CAMPUS_POSITION = [37.6566, -122.0567];
const COST_COLORS = ["#15803d", "#d97706", "#dc2626"];

function formatCost(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function getCostTier(cost, lowLimit, highLimit) {
  if (cost <= lowLimit) return 0;
  if (cost <= highLimit) return 1;
  return 2;
}

export default function MapExtras({ listings }) {
  const [legendOpen, setLegendOpen] = React.useState(true);
  const costs = listings
    .map((listing) => Number(listing.true_cost))
    .filter(Number.isFinite)
    .sort((first, second) => first - second);
  const lowLimit = costs[Math.floor((costs.length - 1) / 3)] ?? 0;
  const highLimit = costs[Math.floor(((costs.length - 1) * 2) / 3)] ?? lowLimit;
  const legendRows = [
    ["Lower third", `Up to ${formatCost(lowLimit)}`, COST_COLORS[0]],
    ["Middle third", `${formatCost(lowLimit + 1)} to ${formatCost(highLimit)}`, COST_COLORS[1]],
    ["Upper third", `Over ${formatCost(highLimit)}`, COST_COLORS[2]],
  ];

  return (
    <>
      <Circle
        center={CAMPUS_POSITION}
        radius={1609}
        pathOptions={{ color: "#0f766e", fillColor: "#0f766e", fillOpacity: 0.04, weight: 2 }}
      />
      <Circle
        center={CAMPUS_POSITION}
        radius={3218}
        pathOptions={{ color: "#0f766e", fillColor: "#0f766e", fillOpacity: 0.015, weight: 2, dashArray: "6 7" }}
      />
      <Marker position={CAMPUS_POSITION}>
        <Popup>CSU East Bay campus</Popup>
      </Marker>
      {listings.map((listing) => {
        const cost = Number(listing.true_cost);
        if (!Number.isFinite(cost) || !costs.length) return null;
        const tier = getCostTier(cost, lowLimit, highLimit);
        return (
          <CircleMarker
            key={`cost-ring-${listing.id}`}
            center={[listing.lat ?? listing.latitude, listing.lng ?? listing.longitude]}
            radius={31}
            pathOptions={{ color: COST_COLORS[tier], fillOpacity: 0, weight: 3 }}
          />
        );
      })}
      <div className="absolute right-3 top-3 z-[1000] max-w-[220px] rounded-md border border-slate-200 bg-white/95 text-xs shadow-md">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-3 py-2 font-semibold text-slate-800"
          aria-expanded={legendOpen}
          onClick={(event) => {
            event.stopPropagation();
            setLegendOpen((open) => !open);
          }}
        >
          <span>Map legend</span>
          <span aria-hidden="true">{legendOpen ? "−" : "+"}</span>
        </button>
        {legendOpen && (
          <div className="space-y-2 border-t border-slate-100 px-3 py-2 text-slate-600">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-teal-700 bg-teal-700/10" />
              1-mile radius
            </p>
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-dashed border-teal-700 bg-teal-700/10" />
              2-mile radius
            </p>
            {legendRows.map(([label, range, color]) => (
              <p key={label} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-[3px]" style={{ borderColor: color }} />
                <span>{label}: {range}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function PopupTags({ listingId, isOpen }) {
  const [state, setState] = React.useState({ status: "idle", tags: [] });

  React.useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;
    getListingTags(listingId)
      .then((result) => {
        if (active) setState({ status: "ready", tags: result.tags || [] });
      })
      .catch(() => {
        if (active) setState({ status: "error", tags: [] });
      });

    return () => {
      active = false;
    };
  }, [isOpen, listingId]);

  if (!isOpen) return null;
  if (state.status === "loading" || (isOpen && state.status === "idle")) {
    return <p className="text-[10px] text-slate-500">Loading review tags...</p>;
  }
  if (state.status === "error") return <p className="text-[10px] text-slate-500">Review tags unavailable.</p>;
  if (!state.tags.length) return <p className="text-[10px] text-slate-500">No verified review tags yet.</p>;

  return (
    <div className="flex flex-wrap gap-1" aria-label="Verified review tags">
      {state.tags.map((tag) => (
        <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
          {tag}
        </span>
      ))}
    </div>
  );
}