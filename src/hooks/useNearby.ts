import { useState, useCallback } from 'react';
import { NearbyPlace, SupplyFilter } from '../types';
import { buildOverpassQuery } from '../utils/overpassQuery';
import { haversineDistance } from '../utils/distance';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS = 3000; // 3 km

export type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export function useNearby() {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback((): Promise<{ lat: number; lon: number } | null> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        setLocationState('error');
        setError('Geolocation is not supported by your browser.');
        resolve(null);
        return;
      }
      setLocationState('requesting');
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setLocationState('granted');
          resolve(loc);
        },
        () => {
          setLocationState('denied');
          setError('Location permission denied.');
          resolve(null);
        }
      );
    });
  }, []);

  const search = useCallback(
    async (loc: { lat: number; lon: number }, filters: SupplyFilter[]) => {
      setLoading(true);
      setError(null);
      try {
        const query = buildOverpassQuery(loc.lat, loc.lon, RADIUS, filters);
        const res = await fetch(OVERPASS_URL, {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const data = await res.json();
        const raw = data.elements as Array<{
          id: number;
          lat: number;
          lon: number;
          tags?: Record<string, string>;
        }>;

        const results: NearbyPlace[] = raw
          .filter(el => el.lat && el.lon)
          .map(el => ({
            id: el.id,
            name: el.tags?.name || el.tags?.amenity || el.tags?.shop || 'Unnamed Place',
            lat: el.lat,
            lon: el.lon,
            distance: haversineDistance(loc.lat, loc.lon, el.lat, el.lon),
            type: el.tags?.amenity || el.tags?.shop || 'store',
            phone: el.tags?.phone || el.tags?.['contact:phone'],
            address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']]
              .filter(Boolean)
              .join(', ') || undefined,
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 30);

        setPlaces(results);
      } catch (e) {
        setError('Failed to fetch nearby places. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchWithLocation = useCallback(
    async (filters: SupplyFilter[]) => {
      const loc = await requestLocation();
      if (loc) await search(loc, filters);
    },
    [requestLocation, search]
  );

  const searchWithManualLocation = useCallback(
    async (loc: { lat: number; lon: number }, filters: SupplyFilter[]) => {
      setUserLocation(loc);
      setLocationState('granted');
      await search(loc, filters);
    },
    [search]
  );

  return {
    locationState,
    userLocation,
    places,
    loading,
    error,
    searchWithLocation,
    searchWithManualLocation,
    requestLocation,
    search,
  };
}
