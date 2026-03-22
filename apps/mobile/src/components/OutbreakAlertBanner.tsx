import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { API_CONFIG } from '@rural-ai/shared';

const API_BASE =
    Platform.OS === 'android' ? API_CONFIG.ANDROID_EMULATOR_URL : API_CONFIG.BASE_URL;

interface OutbreakAlert {
    village: string | null;
    district: string | null;
    symptom: string;
    severity: 'critical' | 'high' | 'moderate';
    recent_cases: number;
    z_score: number;
}

function formatSymptom(symptom: string) {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const severityConfig = {
    critical: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B', icon: '🔴', label: 'CRITICAL' },
    high: { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', icon: '🟠', label: 'HIGH' },
    moderate: { bg: '#FEFCE8', border: '#FDE68A', text: '#854D0E', icon: '🟡', label: 'MODERATE' },
};

export default function OutbreakAlertBanner() {
    const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const res = await fetch(`${API_BASE}/api/analytics/outbreaks`);
                if (res.ok) {
                    const data = await res.json();
                    // Only show critical and high alerts on mobile
                    const filtered = (data.alerts || []).filter(
                        (a: OutbreakAlert) => a.severity === 'critical' || a.severity === 'high'
                    );
                    setAlerts(filtered.slice(0, 3)); // Max 3 alerts on mobile
                }
            } catch {
                // Silently fail — outbreak alerts are supplementary
            }
        }
        fetchAlerts();
    }, []);

    if (alerts.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>⚠️ Local Health Alerts</Text>
            {alerts.map((alert, i) => {
                const config = severityConfig[alert.severity];
                return (
                    <View
                        key={i}
                        style={[styles.alertCard, { backgroundColor: config.bg, borderColor: config.border }]}
                    >
                        <View style={styles.alertHeader}>
                            <Text style={[styles.alertSymptom, { color: config.text }]}>
                                {config.icon} {formatSymptom(alert.symptom)}
                            </Text>
                            <Text style={[styles.severityBadge, { backgroundColor: config.text }]}>
                                {config.label}
                            </Text>
                        </View>
                        <Text style={styles.alertLocation}>
                            {alert.village || 'Unknown'}, {alert.district || 'Unknown'}
                        </Text>
                        <Text style={styles.alertDetail}>
                            {alert.recent_cases} cases reported in last 2 days • Z-score: {alert.z_score.toFixed(1)}σ
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
    },
    alertCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginBottom: 8,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    alertSymptom: {
        fontSize: 16,
        fontWeight: '700',
    },
    severityBadge: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 99,
        overflow: 'hidden',
    },
    alertLocation: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    alertDetail: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
