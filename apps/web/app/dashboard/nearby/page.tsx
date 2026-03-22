'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@rural-ai/shared';
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  MapPin,
  Building2,
  Pill,
  Phone,
  Clock,
  Navigation,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

const TYPE_CONFIG: Record<string, { icon: LucideIcon; label: string; bg: string; text: string }> = {
  hospital: { icon: Building2, label: 'Hospital', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
  pharmacy: { icon: Pill, label: 'Pharmacy', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
  other: { icon: MapPin, label: 'Other', bg: 'bg-muted', text: 'text-muted-foreground' },
};

export default function NearbyPage() {
  const { t } = useLanguage();
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
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('You must be logged in to search nearby facilities.');

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        type,
        radius: (radiusKm * 1000).toString(),
      });

      const res = await fetch(`${apiBase}/api/location/nearby?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Location requires HTTPS. Please access via localhost or use a secure tunnel (e.g. ngrok).');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

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
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('nearby.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t('nearby.description')}
      </p>

      {/* Location permission */}
      {!locationGranted && !loading && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-8 text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">{t('nearby.enableLocation')}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We need your location to find nearby hospitals and pharmacies.
            Your location data is not stored.
          </p>
          <button
            onClick={requestLocation}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t('nearby.shareLocation')}
          </button>
        </div>
      )}

      {/* Filters */}
      {locationGranted && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2">
            {(['all', 'hospital', 'pharmacy'] as const).map((filterType) => {
              const icons = { all: MapPin, hospital: Building2, pharmacy: Pill };
              const FilterIcon = icons[filterType];
              return (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === filterType
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                    }`}
                >
                  <FilterIcon className="w-3.5 h-3.5" />
                  {filterType === 'all' ? t('nearby.all') : filterType === 'hospital' ? t('nearby.hospitals') : t('nearby.pharmacies')}
                </button>
              );
            })}
          </div>

          <select
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="px-3 py-2 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
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
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground font-medium">{t('nearby.searching')}</p>
          <p className="text-muted-foreground text-sm mt-1">{t('nearby.description')}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && locationGranted && !error && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''} found within {radius} km
          </p>

          {filteredPlaces.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">{t('nearby.noPlaces')}</p>
              <p className="text-muted-foreground text-sm">
                Try increasing the search radius or changing the filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map((place, i) => {
                const config = TYPE_CONFIG[place.type] || TYPE_CONFIG.other;
                const PlaceIcon = config.icon;
                return (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            <PlaceIcon className="w-3 h-3" /> {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{place.distance_km} km away</span>
                        </div>

                        <h3 className="font-semibold text-foreground">{place.name}</h3>

                        {place.address && (
                          <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                          {place.phone && (
                            <a
                              href={`tel:${place.phone}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Phone className="w-3 h-3" /> {place.phone}
                            </a>
                          )}
                          {place.opening_hours && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {place.opening_hours}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={getDirectionsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {t('nearby.directions')}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Emergency info */}
      {!locationGranted && !loading && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-5 mt-6">
          <h3 className="text-emerald-800 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t('nearby.emergencyNumbers')}
          </h3>
          <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
            <p><strong>108</strong> — Ambulance (free, all of India)</p>
            <p><strong>112</strong> — Emergency helpline</p>
            <p><strong>104</strong> — Health helpline</p>
          </div>
        </div>
      )}
    </div>
  );
}
