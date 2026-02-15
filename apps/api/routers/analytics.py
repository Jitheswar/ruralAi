"""
Analytics Router — Outbreak detection and disease trend analysis.
Uses statistical anomaly detection (Z-score) on symptom frequency data.
"""

import logging
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from services.auth import get_current_user_id, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Response Models ---


class OutbreakAlert(BaseModel):
    district: str | None
    village: str | None
    symptom: str
    recent_cases: int
    recent_patients: int
    baseline_avg: float
    z_score: float
    rate_ratio: float
    severity: str  # critical, high, moderate, normal


class OutbreakResponse(BaseModel):
    alerts: list[OutbreakAlert]
    total_alerts: int
    critical_count: int
    high_count: int
    moderate_count: int


class TrendPoint(BaseModel):
    date: str
    case_count: int
    unique_patients: int


class TrendResponse(BaseModel):
    district: str | None
    village: str | None
    symptom: str | None
    data: list[TrendPoint]
    total_cases: int


class OutbreakSummary(BaseModel):
    total_active_alerts: int
    critical_alerts: int
    high_alerts: int
    most_affected_village: str | None
    most_common_symptom: str | None
    affected_districts: list[str]


# --- Endpoints ---


@router.get("/outbreaks", response_model=OutbreakResponse)
async def get_outbreaks(
    district: str | None = Query(None, description="Filter by district"),
    severity: str | None = Query(None, description="Filter by severity: critical, high, moderate"),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get active outbreak alerts based on Z-score anomaly detection.

    Z-score measures how many standard deviations the current symptom rate
    is above the historical baseline. A Z-score >= 2.0 indicates a statistically
    significant spike (95th percentile).

    Severity levels:
    - critical: Z-score >= 3.0 AND >= 5 unique patients (99.7th percentile)
    - high: Z-score >= 2.0 AND >= 3 unique patients (95th percentile)
    - moderate: rate_ratio > 1.5x baseline AND >= 3 patients
    """
    try:
        supabase = get_supabase_client()
        query = supabase.table("outbreak_alerts").select("*")

        if district:
            query = query.eq("district", district)

        if severity:
            query = query.eq("severity", severity)
        else:
            # Exclude 'normal' by default — only show actual alerts
            query = query.neq("severity", "normal")

        result = query.execute()
        alerts_data = result.data or []

        alerts = []
        critical_count = 0
        high_count = 0
        moderate_count = 0

        for row in alerts_data:
            alert = OutbreakAlert(
                district=row.get("district"),
                village=row.get("village"),
                symptom=row.get("symptom", ""),
                recent_cases=row.get("recent_cases", 0),
                recent_patients=row.get("recent_patients", 0),
                baseline_avg=float(row.get("baseline_avg", 0)),
                z_score=float(row.get("z_score", 0)),
                rate_ratio=float(row.get("rate_ratio", 0)),
                severity=row.get("severity", "normal"),
            )
            alerts.append(alert)

            if alert.severity == "critical":
                critical_count += 1
            elif alert.severity == "high":
                high_count += 1
            elif alert.severity == "moderate":
                moderate_count += 1

        return OutbreakResponse(
            alerts=alerts,
            total_alerts=len(alerts),
            critical_count=critical_count,
            high_count=high_count,
            moderate_count=moderate_count,
        )
    except Exception as e:
        logger.error("Outbreak detection error: %s", e)
        return OutbreakResponse(
            alerts=[], total_alerts=0,
            critical_count=0, high_count=0, moderate_count=0,
        )


@router.get("/trends", response_model=TrendResponse)
async def get_trends(
    district: str | None = Query(None, description="Filter by district"),
    village: str | None = Query(None, description="Filter by village"),
    symptom: str | None = Query(None, description="Filter by symptom"),
    days: int = Query(30, description="Number of days to look back (max 90)"),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get symptom trend data (time-series) for charts.
    Returns daily case counts for the specified filters.
    """
    days = max(1, min(days, 90))

    try:
        supabase = get_supabase_client()
        query = supabase.table("symptom_daily_counts").select("*")
        cutoff_date = (date.today() - timedelta(days=days)).isoformat()

        if district:
            query = query.eq("district", district)
        if village:
            query = query.eq("village", village)
        if symptom:
            query = query.eq("symptom", symptom)
        query = query.gte("log_date", cutoff_date)

        # Order by date ascending for chart rendering
        query = query.order("log_date", desc=False)

        result = query.execute()
        rows = result.data or []

        data = []
        total_cases = 0
        for row in rows:
            point = TrendPoint(
                date=row.get("log_date", ""),
                case_count=row.get("case_count", 0),
                unique_patients=row.get("unique_patients", 0),
            )
            data.append(point)
            total_cases += point.case_count

        return TrendResponse(
            district=district,
            village=village,
            symptom=symptom,
            data=data,
            total_cases=total_cases,
        )
    except Exception as e:
        logger.error("Trend data error: %s", e)
        return TrendResponse(
            district=district, village=village, symptom=symptom,
            data=[], total_cases=0,
        )


@router.get("/summary", response_model=OutbreakSummary)
async def get_outbreak_summary(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get a high-level outbreak summary for dashboard cards.
    """
    try:
        supabase = get_supabase_client()
        result = supabase.table("outbreak_alerts").select("*").neq("severity", "normal").execute()
        alerts = result.data or []

        critical = [a for a in alerts if a.get("severity") == "critical"]
        high = [a for a in alerts if a.get("severity") == "high"]

        # Find the most affected village
        village_counts: dict[str, int] = {}
        symptom_counts: dict[str, int] = {}
        districts: set[str] = set()

        for a in alerts:
            v = a.get("village") or "Unknown"
            s = a.get("symptom") or "Unknown"
            d = a.get("district")
            village_counts[v] = village_counts.get(v, 0) + a.get("recent_cases", 0)
            symptom_counts[s] = symptom_counts.get(s, 0) + a.get("recent_cases", 0)
            if d:
                districts.add(d)

        most_affected = max(village_counts, key=village_counts.get) if village_counts else None
        most_common = max(symptom_counts, key=symptom_counts.get) if symptom_counts else None

        return OutbreakSummary(
            total_active_alerts=len(alerts),
            critical_alerts=len(critical),
            high_alerts=len(high),
            most_affected_village=most_affected,
            most_common_symptom=most_common,
            affected_districts=sorted(districts),
        )
    except Exception as e:
        logger.error("Outbreak summary error: %s", e)
        return OutbreakSummary(
            total_active_alerts=0, critical_alerts=0, high_alerts=0,
            most_affected_village=None, most_common_symptom=None,
            affected_districts=[],
        )
