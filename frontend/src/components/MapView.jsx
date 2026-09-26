import { MapContainer, TileLayer, Marker, Tooltip, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'

const CAMPUS = [37.6566, -122.0567] // CSUEB

const pin = (price, active) =>
  L.divIcon({
    className: '',
    html: `<div class="price-pin ${active ? 'active' : ''}">$${Math.round(price / 100) / 10}k</div>`,
    iconSize: [48, 22],
    iconAnchor: [24, 11],
  })

export default function MapView({ listings, activeId, onHover }) {
  const navigate = useNavigate()
  return (
    <MapContainer center={CAMPUS} zoom={14} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={CAMPUS} radius={10} pathOptions={{ color: '#dc2626', fillOpacity: 0.8 }}>
        <Tooltip permanent direction="top">CSUEB</Tooltip>
      </CircleMarker>
      {listings.map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={pin(l.true_cost, l.id === activeId)}
          title={`${l.name}, $${l.true_cost} per month`}
          eventHandlers={{
            click: () => navigate(`/listing/${l.id}`),
            mouseover: () => onHover?.(l.id),
          }}
        />
      ))}
    </MapContainer>
  )
}
