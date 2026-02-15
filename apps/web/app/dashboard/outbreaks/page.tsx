'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';
import dynamic from 'next/dynamic';
import {
    AlertTriangle,
    TrendingUp,
    MapPin,
    Loader2,
    CheckCircle,
    X,
    Info,
    BarChart3,
    Map as MapIcon,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// --- Dynamically import the map (Leaflet doesn't support SSR) ---
const OutbreakMap = dynamic(() => import('./OutbreakMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[450px] rounded-xl bg-muted flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
    ),
});

// --- Types ---

interface OutbreakAlert {
    district: string | null;
    village: string | null;
    symptom: string;
    recent_cases: number;
    recent_patients: number;
    baseline_avg: number;
    z_score: number;
    rate_ratio: number;
    severity: 'critical' | 'high' | 'moderate' | 'normal';
}

export interface GeocodedAlert extends OutbreakAlert {
    lat: number;
    lng: number;
}

interface OutbreakSummary {
    total_active_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    most_affected_village: string | null;
    most_common_symptom: string | null;
    affected_districts: string[];
}

interface TrendPoint {
    date: string;
    case_count: number;
    unique_patients: number;
}

// --- Helpers ---

const API_BASE = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL)
    : API_CONFIG.BASE_URL;

function severityColor(severity: string) {
    switch (severity) {
        case 'critical': return { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-300', border: 'border-red-300 dark:border-red-500/30', badge: 'bg-red-600 text-white', dot: 'bg-red-500' };
        case 'high': return { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-500/30', badge: 'bg-orange-500 text-white', dot: 'bg-orange-500' };
        case 'moderate': return { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-500/30', badge: 'bg-yellow-500 text-white', dot: 'bg-yellow-500' };
        default: return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30', badge: 'bg-emerald-500 text-white', dot: 'bg-emerald-500' };
    }
}

function formatSymptom(symptom: string) {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function severityPriority(severity: OutbreakAlert['severity']) {
    switch (severity) {
        case 'critical': return 3;
        case 'high': return 2;
        case 'moderate': return 1;
        default: return 0;
    }
}

// --- Geocoding with Nominatim (OpenStreetMap, free, no API key) ---

const geocodeCache: Record<string, { lat: number; lng: number } | null> = {};

async function geocodeLocation(village: string | null, district: string | null): Promise<{ lat: number; lng: number } | null> {
    const query = [village, district, 'India'].filter(Boolean).join(', ');
    if (geocodeCache[query] !== undefined) return geocodeCache[query];

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
            { headers: { 'User-Agent': 'RuralHealthAI/1.0' } }
        );
        const data = await res.json();
        if (data.length > 0) {
            const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            geocodeCache[query] = result;
            return result;
        }
        // Fallback: try district only
        if (village && district) {
            const fallbackQuery = `${district}, India`;
            if (geocodeCache[fallbackQuery] !== undefined) {
                geocodeCache[query] = geocodeCache[fallbackQuery];
                return geocodeCache[fallbackQuery];
            }
            const fallbackRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1&countrycodes=in`,
                { headers: { 'User-Agent': 'RuralHealthAI/1.0' } }
            );
            const fallbackData = await fallbackRes.json();
            if (fallbackData.length > 0) {
                const result = { lat: parseFloat(fallbackData[0].lat), lng: parseFloat(fallbackData[0].lon) };
                geocodeCache[fallbackQuery] = result;
                geocodeCache[query] = result;
                return result;
            }
        }
    } catch (err) {
        console.error('Geocoding error:', err);
    }
    geocodeCache[query] = null;
    return null;
}

// --- Simple Bar Chart Component ---

function MiniBarChart({ data, maxBars = 14 }: { data: TrendPoint[], maxBars?: number }) {
    const sliced = data.slice(-maxBars);
    if (sliced.length === 0) return <div className="text-muted-foreground text-sm">No trend data</div>;
    const maxVal = Math.max(...sliced.map(d => d.case_count), 1);

    return (
        <div className="flex items-end gap-1 h-20">
            {sliced.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${(point.case_count / maxVal) * 100}%`, minHeight: point.case_count > 0 ? '4px' : '0' }}
                        title={`${point.date}: ${point.case_count} cases`}
                    />
                </div>
            ))}
        </div>
    );
}

// --- Main Page ---

export default function OutbreaksPage() {
    const { t } = useLanguage();
    const [summary, setSummary] = useState<OutbreakSummary | null>(null);
    const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
    const [geocodedAlerts, setGeocodedAlerts] = useState<GeocodedAlert[]>([]);
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(false);
    const [geocodeTotal, setGeocodeTotal] = useState(0);
    const [geocodeCompleted, setGeocodeCompleted] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get user's current location
    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    // Default to center of India
                    setUserLocation({ lat: 20.5937, lng: 78.9629 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserLocation({ lat: 20.5937, lng: 78.9629 });
        }
    }, []);

    // Fetch outbreak data
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setMapLoading(false);
                setGeocodeTotal(0);
                setGeocodeCompleted(0);
                setGeocodedAlerts([]);
                const supabase = getSupabaseClient();
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const [summaryRes, alertsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/analytics/summary`, { headers }),
                    fetch(`${API_BASE}/api/analytics/outbreaks`, { headers }),
                ]);

                if (summaryRes.ok) {
                    const summaryJson = await summaryRes.json();
                    if (!cancelled) setSummary(summaryJson);
                }
                if (alertsRes.ok) {
                    const alertData = await alertsRes.json();
                    const alertsList: OutbreakAlert[] = alertData.alerts || [];
                    if (cancelled) return;

                    setAlerts(alertsList);

                    // Geocode all alerts for the map
                    if (alertsList.length > 0) {
                        setMapLoading(true);
                        setGeocodedAlerts([]);
                        setGeocodeCompleted(0);
                        // Deduplicate locations to minimize API calls
                        const locationMap = new Map<string, OutbreakAlert[]>();
                        for (const a of alertsList) {
                            const key = `${a.village || ''}|${a.district || ''}`;
                            if (!locationMap.has(key)) locationMap.set(key, []);
                            locationMap.get(key)!.push(a);
                        }

                        const locationBuckets = Array.from(locationMap.values()).sort((a, b) => {
                            const aPriority = Math.max(...a.map((item) => severityPriority(item.severity)));
                            const bPriority = Math.max(...b.map((item) => severityPriority(item.severity)));
                            return bPriority - aPriority;
                        });
                        setGeocodeTotal(locationBuckets.length);

                        for (let i = 0; i < locationBuckets.length; i++) {
                            if (cancelled) break;
                            const alertsAtLocation = locationBuckets[i];
                            const first = alertsAtLocation[0];
                            const coords = await geocodeLocation(first.village, first.district);
                            if (cancelled) break;
                            if (coords) {
                                const batch = alertsAtLocation.map((alert) => ({
                                    ...alert,
                                    lat: coords.lat,
                                    lng: coords.lng,
                                }));
                                setGeocodedAlerts((prev) => [...prev, ...batch]);
                            }
                            setGeocodeCompleted((prev) => prev + 1);
                            // Small delay to respect Nominatim rate limit (1 req/sec)
                            if (i < locationBuckets.length - 1) {
                                await new Promise((r) => setTimeout(r, 1100));
                            }
                        }
                        if (!cancelled) setMapLoading(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load outbreak data:', err);
                if (!cancelled) setError('Could not load outbreak data. Is the API running?');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Fetch trend when symptom selected
    useEffect(() => {
        if (!selectedSymptom) return;
        async function loadTrend() {
            try {
                const supabase = getSupabaseClient();
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(
                    `${API_BASE}/api/analytics/trends?symptom=${encodeURIComponent(selectedSymptom!)}&days=30`,
                    { headers }
                );
                if (res.ok) {
                    const data = await res.json();
                    setTrendData(data.data || []);
                }
            } catch (err) {
                console.error('Trend fetch error:', err);
            }
        }
        loadTrend();
    }, [selectedSymptom]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing outbreak data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                    {t('outbreak.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('outbreak.description')}
                </p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`bg-card rounded-xl p-5 border ${summary.critical_alerts > 0 ? 'border-red-200 dark:border-red-500/20' : 'border-border'}`}>
                        <p className="text-sm text-muted-foreground font-medium">{t('outbreak.activeAlerts')}</p>
                        <p className={`text-2xl font-bold mt-1 ${summary.total_active_alerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {summary.total_active_alerts}
                        </p>
                    </div>
                    <div className="bg-card rounded-xl p-5 border border-border">
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> {t('outbreak.critical')}
                        </p>
                        <p className="text-2xl font-bold mt-1 text-red-700 dark:text-red-400">{summary.critical_alerts}</p>
                    </div>
                    <div className="bg-card rounded-xl p-5 border border-border">
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500" /> {t('outbreak.high')}
                        </p>
                        <p className="text-2xl font-bold mt-1 text-orange-700 dark:text-orange-400">{summary.high_alerts}</p>
                    </div>
                    <div className="bg-card rounded-xl p-5 border border-border">
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {t('outbreak.mostAffected')}
                        </p>
                        <p className="text-lg font-bold mt-1 text-foreground truncate">
                            {summary.most_affected_village || 'None'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.most_common_symptom ? formatSymptom(summary.most_common_symptom) : '—'}
                        </p>
                    </div>
                </div>
            )}

            {/* Outbreak Map */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <MapIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{t('outbreak.outbreakMap')}</h2>
                    {mapLoading && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {geocodeTotal > 0
                                ? `Locating areas ${Math.min(geocodeCompleted, geocodeTotal)}/${geocodeTotal}`
                                : 'Locating areas...'}
                        </span>
                    )}
                </div>

                {/* Zone Legend */}
                <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">Red Zone (Critical)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">Orange Zone (High)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">Yellow Zone (Moderate)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">Green Zone (Safe)</span>
                    </div>
                </div>

                <OutbreakMap
                    alerts={geocodedAlerts}
                    userLocation={userLocation}
                    onAlertClick={(symptom) => setSelectedSymptom(symptom)}
                />
            </div>

            {/* Trend Chart */}
            {selectedSymptom && (
                <div className="bg-card rounded-xl border border-border p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            30-Day Trend: {formatSymptom(selectedSymptom)}
                        </h3>
                        <button
                            onClick={() => setSelectedSymptom(null)}
                            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <MiniBarChart data={trendData} maxBars={30} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{trendData[0]?.date || ''}</span>
                        <span>{trendData[trendData.length - 1]?.date || ''}</span>
                    </div>
                </div>
            )}

            {/* Alert List */}
            {alerts.length === 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-8 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-lg">{t('outbreak.noOutbreaks')}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                        All symptom rates are within normal baseline levels.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground mb-2">{t('outbreak.activeAlerts')}</h2>
                    {alerts.map((alert, i) => {
                        const colors = severityColor(alert.severity);
                        return (
                            <div
                                key={i}
                                className={`${colors.bg} border ${colors.border} rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow`}
                                onClick={() => setSelectedSymptom(alert.symptom)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${colors.dot} animate-pulse`} />
                                        <div>
                                            <h3 className={`font-bold text-lg ${colors.text}`}>
                                                {formatSymptom(alert.symptom)}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {alert.village || 'Unknown'}, {alert.district || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                                        {alert.severity}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-border/50">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('outbreak.recentCases')} (2d)</p>
                                        <p className={`text-xl font-bold ${colors.text}`}>{alert.recent_cases}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('outbreak.uniquePatients')}</p>
                                        <p className="text-xl font-bold text-foreground">{alert.recent_patients}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('outbreak.baseline')}</p>
                                        <p className="text-xl font-bold text-muted-foreground">{alert.baseline_avg.toFixed(1)}/day</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Z-Score</p>
                                        <p className={`text-xl font-bold ${alert.z_score >= 3 ? 'text-red-600 dark:text-red-400' : alert.z_score >= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                            {alert.z_score.toFixed(1)}σ
                                        </p>
                                    </div>
                                </div>

                                {alert.rate_ratio > 1 && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <BarChart3 className="w-3 h-3" />
                                        {alert.rate_ratio.toFixed(1)}× above baseline rate · Click to view trend
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Explanation */}
            <div className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> {t('outbreak.howDetectionWorks')}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>· <strong className="text-foreground">Z-Score ≥ 3.0 + ≥5 patients → Critical</strong>: 99.7th percentile, statistically very rare</li>
                    <li>· <strong className="text-foreground">Z-Score ≥ 2.0 + ≥3 patients → High</strong>: 95th percentile, significant spike</li>
                    <li>· <strong className="text-foreground">Rate ≥ 1.5× baseline + ≥3 patients → Moderate</strong>: Notable increase</li>
                    <li>· Baseline is computed from the last 14 days of historical symptom data per village</li>
                </ul>
            </div>
        </div>
    );
}
