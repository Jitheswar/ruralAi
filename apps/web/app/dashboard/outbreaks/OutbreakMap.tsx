'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeocodedAlert } from './page';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Leaflet + webpack issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface OutbreakMapProps {
    alerts: GeocodedAlert[];
    userLocation: { lat: number; lng: number } | null;
    onAlertClick: (symptom: string) => void;
}

function severityMapColor(severity: string): string {
    switch (severity) {
        case 'critical': return '#ef4444'; // red-500
        case 'high': return '#f97316';     // orange-500
        case 'moderate': return '#eab308'; // yellow-500
        default: return '#22c55e';          // green-500
    }
}

function severityRadius(severity: string, cases: number): number {
    const base = Math.max(cases * 200, 800);
    switch (severity) {
        case 'critical': return base + 2000;
        case 'high': return base + 1200;
        case 'moderate': return base + 600;
        default: return base;
    }
}

function severityOpacity(severity: string): number {
    switch (severity) {
        case 'critical': return 0.4;
        case 'high': return 0.3;
        case 'moderate': return 0.25;
        default: return 0.15;
    }
}

function formatSymptom(symptom: string) {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Auto-fit map bounds to show all alerts
function FitBounds({ alerts, userLocation }: { alerts: GeocodedAlert[]; userLocation: { lat: number; lng: number } | null }) {
    const map = useMap();

    useEffect(() => {
        if (alerts.length > 0) {
            const bounds = L.latLngBounds(alerts.map(a => [a.lat, a.lng]));
            if (userLocation) {
                bounds.extend([userLocation.lat, userLocation.lng]);
            }
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        } else if (userLocation) {
            map.setView([userLocation.lat, userLocation.lng], 10);
        }
    }, [alerts, userLocation, map]);

    return null;
}

// User location marker
const userIcon = L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #3b82f6,0 0 12px rgba(59,130,246,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

export default function OutbreakMap({ alerts, userLocation, onAlertClick }: OutbreakMapProps) {
    const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [20.5937, 78.9629]; // Center of India

    return (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: '450px' }}>
            <MapContainer
                center={center}
                zoom={userLocation ? 10 : 5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds alerts={alerts} userLocation={userLocation} />

                {/* User's current location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-semibold text-sm">Your Location</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Outbreak zones as colored circles */}
                {alerts.map((alert, i) => {
                    const color = severityMapColor(alert.severity);
                    const radius = severityRadius(alert.severity, alert.recent_cases);
                    const opacity = severityOpacity(alert.severity);

                    return (
                        <Circle
                            key={`${alert.village}-${alert.district}-${alert.symptom}-${i}`}
                            center={[alert.lat, alert.lng]}
                            radius={radius}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: opacity,
                                weight: 2,
                                opacity: 0.8,
                            }}
                            eventHandlers={{
                                click: () => onAlertClick(alert.symptom),
                            }}
                        >
                            <Popup>
                                <div style={{ minWidth: '180px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '8px',
                                    }}>
                                        <span style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: color,
                                            display: 'inline-block',
                                        }} />
                                        <strong style={{ fontSize: '14px' }}>
                                            {formatSymptom(alert.symptom)}
                                        </strong>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                                        <p><strong>Location:</strong> {alert.village || 'Unknown'}, {alert.district || 'Unknown'}</p>
                                        <p><strong>Severity:</strong>{' '}
                                            <span style={{
                                                backgroundColor: color,
                                                color: 'white',
                                                padding: '1px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                            }}>
                                                {alert.severity}
                                            </span>
                                        </p>
                                        <p><strong>Cases (2 days):</strong> {alert.recent_cases}</p>
                                        <p><strong>Patients:</strong> {alert.recent_patients}</p>
                                        <p><strong>Z-Score:</strong> {alert.z_score.toFixed(1)}σ</p>
                                        <p><strong>Rate:</strong> {alert.rate_ratio.toFixed(1)}× baseline</p>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                                        Click to view 30-day trend
                                    </p>
                                </div>
                            </Popup>
                        </Circle>
                    );
                })}

                {/* Show green safe zone around user if no alerts nearby */}
                {userLocation && alerts.length === 0 && (
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={5000}
                        pathOptions={{
                            color: '#22c55e',
                            fillColor: '#22c55e',
                            fillOpacity: 0.1,
                            weight: 2,
                            opacity: 0.5,
                        }}
                    >
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', color: '#22c55e' }}>Safe Zone</p>
                                <p style={{ fontSize: '12px', color: '#666' }}>No outbreaks detected in your area</p>
                            </div>
                        </Popup>
                    </Circle>
                )}
            </MapContainer>
        </div>
    );
}
