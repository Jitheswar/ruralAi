'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@rural-ai/shared';

interface NearbyPlace {
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance_km: number;
  address: string;
  phone: string;
  opening_hours: string;
}

interface NearbyResponse {
  results: NearbyPlace[];
  total: number;
  radius_km: number;
  error?: string;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  hospital: { icon: '🏥', label: 'Hospital', bg: 'bg-red-50', text: 'text-red-700' },
  pharmacy: { icon: '💊', label: 'Pharmacy', bg: 'bg-green-50', text: 'text-green-700' },
  other: { icon: '📍', label: 'Other', bg: 'bg-gray-50', text: 'text-gray-700' },
};

export default function NearbyPage() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'hospital' | 'pharmacy'>('all');
  const [radius, setRadius] = useState(10);
  const [locationGranted, setLocationGranted] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchNearby = useCallback(async (lat: number, lon: number, type: string, radiusKm: number) => {
    setLoading(true);
    setError('');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        type,
        radius: (radiusKm * 1000).toString(),
      });

      const res = await fetch(`${apiBase}/api/location/nearby?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: NearbyResponse = await res.json();
      if (data.error) {
        setError(data.error);
        setPlaces([]);
      } else {
        setPlaces(data.results);
      }
    } catch {
      setError('Could not fetch nearby places. Make sure the API server is running.');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function requestLocation() {
    // Check for secure context first
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Location requires HTTPS. Please access via localhost or use a secure tunnel (e.g. ngrok).');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        setLocationGranted(true);
        fetchNearby(latitude, longitude, filter, radius);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let msg = 'Location access denied. Please enable location in your browser settings.';
        if (err.code === 1) msg = 'Location access denied. Please allow location access.';
        if (err.code === 2) msg = 'Location unavailable. Check your GPS signal.';
        if (err.code === 3) msg = 'Location request timed out.';

        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  // Re-fetch when filter or radius changes (only if location is already granted)
  useEffect(() => {
    if (coords) {
      fetchNearby(coords.lat, coords.lon, filter, radius);
    }
  }, [filter, radius, coords, fetchNearby]);

  const filteredPlaces = places;

  function getDirectionsUrl(place: NearbyPlace) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nearby Help</h1>
      <p className="text-gray-500 text-sm mb-6">
        Find hospitals, clinics, and pharmacies near you.
      </p>

      {/* Location permission */}
      {!locationGranted && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-6">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Enable Location</h2>
          <p className="text-sm text-blue-700 mb-6">
            We need your location to find nearby hospitals and pharmacies.
            Your location data is not stored.
          </p>
          <button
            onClick={requestLocation}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Share My Location
          </button>
        </div>
      )}

      {/* Filters (shown after location granted) */}
      {locationGranted && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2">
            {(['all', 'hospital', 'pharmacy'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {t === 'all' ? 'All' : t === 'hospital' ? '🏥 Hospitals' : '💊 Pharmacies'}
              </button>
            ))}
          </div>

          <select
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">🔍</div>
          <p className="text-gray-700 font-medium">Searching nearby...</p>
          <p className="text-gray-400 text-sm mt-1">Looking for hospitals and pharmacies</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && locationGranted && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''} found within {radius} km
          </p>

          {filteredPlaces.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-3xl mb-3">🏥</div>
              <p className="text-gray-700 font-medium mb-1">No places found nearby</p>
              <p className="text-gray-400 text-sm">
                Try increasing the search radius or changing the filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map((place, i) => {
                const config = TYPE_CONFIG[place.type] || TYPE_CONFIG.other;
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            {config.icon} {config.label}
                          </span>
                          <span className="text-xs text-gray-400">{place.distance_km} km away</span>
                        </div>

                        <h3 className="font-semibold text-gray-900">{place.name}</h3>

                        {place.address && (
                          <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                          {place.phone && (
                            <a
                              href={`tel:${place.phone}`}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              📞 {place.phone}
                            </a>
                          )}
                          {place.opening_hours && (
                            <span className="text-xs text-gray-500">
                              🕐 {place.opening_hours}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={getDirectionsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Info box */}
      {!locationGranted && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
          <h3 className="text-green-800 font-semibold mb-2">Emergency Numbers</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>108</strong> — Ambulance (free, all of India)</p>
            <p><strong>112</strong> — Emergency helpline</p>
            <p><strong>104</strong> — Health helpline</p>
          </div>
        </div>
      )}
    </div>
  );
}
