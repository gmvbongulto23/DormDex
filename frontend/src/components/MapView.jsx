import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { money, Stars } from "./ui";
import MapExtras, { PopupTags } from "./MapExtras";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon path issues in React/Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// CSU East Bay Hayward Main Campus coordinates
const CAMPUS_CENTER = [37.658, -122.059];

// Custom Leaflet Icons for normal vs hover state
const createCustomIcon = (isActive, cost) => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `<div style="
      background-color: ${isActive ? "#182b49" : "#635bff"};
      color: white;
      font-weight: 600;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      border: 2px solid white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
      transform: ${isActive ? "scale(1.15)" : "scale(1)"};
      transition: all 0.2s ease;
      white-space: nowrap;
    ">${money(cost)}</div>`,
    iconSize: [64, 30],
    iconAnchor: [32, 15],
  });
};

// Recenter component when listings change
function AutoCenterMap({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapView({ listings = [], hoveredId, onHover }) {
  const [openPopupId, setOpenPopupId] = React.useState(null);

  // Safely filter listings with valid numerical latitude & longitude
  const validListings = listings.filter((item) => {
    const lat = item?.lat ?? item?.latitude;
    const lng = item?.lng ?? item?.longitude;
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[500px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoCenterMap center={CAMPUS_CENTER} />
        <MapExtras listings={validListings} />

        {validListings.map((listing) => {
          const lat = listing.lat ?? listing.latitude;
          const lng = listing.lng ?? listing.longitude;
          const isActive = String(listing.id) === String(hoveredId);

          return (
            <Marker
              key={listing.id}
              position={[lat, lng]}
              icon={createCustomIcon(isActive, listing.true_cost)}
              eventHandlers={{
                mouseover: () => onHover && onHover(listing.id),
                mouseout: () => onHover && onHover(null),
              }}
            >
              <Popup
                className="custom-map-popup"
                eventHandlers={{
                  add: () => setOpenPopupId(listing.id),
                  remove: () => setOpenPopupId((current) => current === listing.id ? null : current),
                }}
              >
                <div className="p-1 space-y-1.5 text-xs">
                  <span className="font-extrabold text-slate-900 block leading-tight">
                    {listing.name}
                  </span>
                  <p className="text-[11px] font-semibold text-emerald-600">
                    {money(listing.true_cost)} / mo true cost
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <Stars value={listing.avg_rating || 0} />
                    <span>{listing.distance_miles} mi away</span>
                  </div>

                  <PopupTags listingId={listing.id} isOpen={openPopupId === listing.id} />

                  <Link
                    to={`/listing/${listing.id}`}
                    className="block w-full text-center rounded-lg bg-violet-600 py-1 mt-2 text-[10px] font-bold text-white hover:bg-violet-700 transition"
                  >
                    View Property →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
