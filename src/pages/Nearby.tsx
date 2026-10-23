import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNearby } from '../hooks/useNearby';
import { geocodeAddress } from '../utils/geocode';
import { formatDistance } from '../utils/distance';
import { NearbyPlace, SupplyFilter } from '../types';
import { MapPin, Phone, Navigation, Search, Loader } from 'lucide-react';

// Fix leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const FILTERS: { value: SupplyFilter; label: string; emoji: string }[] = [
  { value: 'pads', label: 'Pads', emoji: '🩸' },
  { value: 'tampons', label: 'Tampons', emoji: '🩹' },
  { value: 'cups', label: 'Cups', emoji: '🔻' },
  { value: 'pain_relief', label: 'Pain Relief', emoji: '💊' },
  { value: 'pregnancy_tests', label: 'Pregnancy Tests', emoji: '🔬' },
];

function MapCentre({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], 14); }, [lat, lon]);
  return null;
}

export default function Nearby() {
  const { locationState, userLocation, places, loading, error,
    searchWithLocation, searchWithManualLocation } = useNearby();
  const [activeFilters, setActiveFilters] = useState<SupplyFilter[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const toggleFilter = (f: SupplyFilter) => {
    setActiveFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const handleGPS = () => setShowPrompt(true);

  const confirmGPS = async () => {
    setShowPrompt(false);
    await searchWithLocation(activeFilters);
  };

  const handleManual = async () => {
    if (!manualInput.trim()) return;
    setGeocoding(true);
    const loc = await geocodeAddress(manualInput.trim());
    setGeocoding(false);
    if (loc) {
      await searchWithManualLocation(loc, activeFilters);
    } else {
      alert('Could not find that location. Please try a different search term.');
    }
  };

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      <div className="gradient-header px-4 pt-10 pb-5">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Find Supplies Nearby</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Pharmacies, supermarkets & chemists within 3 km.
        </p>
      </div>

      {/* Location prompt modal */}
      {showPrompt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 1000, padding: '0 0 32px',
        }}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: 428, margin: '0 16px', borderRadius: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Allow location access?</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Flowie will use your device location to find nearby stores. <strong>Your location is never stored or sent to any server</strong> — it's only used for the Overpass API query, which runs directly from your browser.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPrompt(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={confirmGPS}>
                Allow & Search
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 animate-in">
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`chip${activeFilters.includes(f.value) ? ' active' : ''}`}
              onClick={() => toggleFilter(f.value)}
              aria-pressed={activeFilters.includes(f.value)}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* Search controls */}
        {locationState === 'idle' || locationState === 'denied' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleGPS}>
              <MapPin size={18} /> Use my location
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-field"
                placeholder="Enter area, city or pincode…"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManual()}
                aria-label="Manual location search"
              />
              <button
                className="btn-secondary"
                onClick={handleManual}
                disabled={geocoding || !manualInput.trim()}
                aria-label="Search by address"
                style={{ padding: '0 16px', flexShrink: 0 }}
              >
                {geocoding ? <Loader size={16} className="animate-pulse-soft" /> : <Search size={16} />}
              </button>
            </div>
            {locationState === 'denied' && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                Location was denied. Search by area name above.
              </p>
            )}
          </div>
        ) : null}

        {/* Map */}
        {userLocation && (
          <div style={{ marginBottom: 16 }}>
            <MapContainer
              center={[userLocation.lat, userLocation.lon]}
              zoom={14}
              style={{ height: 260, width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapCentre lat={userLocation.lat} lon={userLocation.lon} />
              <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              {places.map(p => (
                <Marker key={p.id} position={[p.lat, p.lon]}>
                  <Popup>
                    <strong>{p.name}</strong><br />
                    {formatDistance(p.distance)} away<br />
                    {p.type}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="animate-pulse-soft" style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Searching nearby stores…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card card-sm" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)', marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>⚠ {error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && places.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              {places.length} places found
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {places.map(p => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </div>
        )}

        {!loading && userLocation && places.length === 0 && !error && (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏪</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No places found nearby</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Try removing filter chips or searching in a different area.
            </p>
          </div>
        )}

        {/* Privacy note */}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 20, opacity: 0.7, lineHeight: 1.6 }}>
          🔒 Your location is only used for the map query and is never stored or shared.
        </p>
      </div>
    </div>
  );
}

function PlaceCard({ place }: { place: NearbyPlace }) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
  const typeLabel = place.type.charAt(0).toUpperCase() + place.type.slice(1);

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>
            {place.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
            {typeLabel} · {formatDistance(place.distance)}
          </p>
          {place.address && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {place.address}
            </p>
          )}
        </div>
        <div style={{
          background: 'var(--primary-light)', borderRadius: 12, padding: '6px 10px',
          fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
        }}>
          {formatDistance(place.distance)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ flex: 1, fontSize: 13, padding: '10px 8px', textDecoration: 'none' }}
          aria-label={`Directions to ${place.name}`}
        >
          <Navigation size={14} /> Directions
        </a>
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="btn-secondary"
            style={{ flex: 1, fontSize: 13, padding: '10px 8px', textDecoration: 'none' }}
            aria-label={`Call ${place.name}`}
          >
            <Phone size={14} /> Call
          </a>
        )}
      </div>
    </div>
  );
}
