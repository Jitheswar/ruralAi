-- =============================================================================
-- MIGRATION: Create outbreak detection views and functions
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================================

-- 1. Function to unnest symptoms from JSONB health_logs.data
-- health_logs.data stores: {"input": {"symptoms": ["fever","cough",...]}, ...}
-- We extract each symptom as a separate row for aggregation.

CREATE OR REPLACE FUNCTION public.extract_symptoms(data JSONB)
RETURNS SETOF TEXT AS $$
BEGIN
  -- Try input.symptoms path (from symptom analysis endpoint)
  IF data->'input'->'symptoms' IS NOT NULL THEN
    RETURN QUERY SELECT jsonb_array_elements_text(data->'input'->'symptoms');
  -- Try symptoms path directly (from triage engine)
  ELSIF data->'symptoms' IS NOT NULL THEN
    RETURN QUERY SELECT jsonb_array_elements_text(data->'symptoms');
  END IF;
  RETURN;
END;
$$ LANGUAGE plpgsql STABLE;


-- 2. View: Daily symptom counts by village/district
-- This is the core data source for outbreak detection.

CREATE OR REPLACE VIEW public.symptom_daily_counts AS
SELECT
  p.district,
  p.village,
  s.symptom,
  DATE(hl.created_at) AS log_date,
  COUNT(*) AS case_count,
  COUNT(DISTINCT hl.patient_id) AS unique_patients
FROM public.health_logs hl
JOIN public.patients p ON hl.patient_id = p.id
CROSS JOIN LATERAL public.extract_symptoms(hl.data) AS s(symptom)
WHERE hl.log_type IN ('symptoms', 'triage')
GROUP BY p.district, p.village, s.symptom, DATE(hl.created_at);


-- 3. View: 7-day outbreak detection with Z-score anomaly detection
-- Compares last 2 days vs previous 5 days using statistical deviation.
-- A Z-score > 2.0 means the current rate is 2+ standard deviations above normal.

CREATE OR REPLACE VIEW public.outbreak_alerts AS
WITH daily AS (
  SELECT
    district,
    village,
    symptom,
    log_date,
    case_count,
    unique_patients
  FROM public.symptom_daily_counts
  WHERE log_date >= CURRENT_DATE - INTERVAL '14 days'
),
recent_raw AS (
  SELECT
    p.district,
    p.village,
    s.symptom,
    hl.patient_id,
    COUNT(*) AS case_count
  FROM public.health_logs hl
  JOIN public.patients p ON hl.patient_id = p.id
  CROSS JOIN LATERAL public.extract_symptoms(hl.data) AS s(symptom)
  WHERE hl.log_type IN ('symptoms', 'triage')
    AND DATE(hl.created_at) >= CURRENT_DATE - INTERVAL '2 days'
  GROUP BY p.district, p.village, s.symptom, hl.patient_id
),
-- Recent window: last 2 days
recent AS (
  SELECT
    district,
    village,
    symptom,
    SUM(case_count) AS recent_cases,
    COUNT(DISTINCT patient_id) AS recent_patients
  FROM recent_raw
  GROUP BY district, village, symptom
),
-- Baseline window: 3-14 days ago (historical normal)
baseline AS (
  SELECT
    district,
    village,
    symptom,
    AVG(case_count) AS avg_daily_cases,
    STDDEV_POP(case_count) AS stddev_cases,
    SUM(case_count) AS total_baseline_cases,
    COUNT(DISTINCT log_date) AS baseline_days
  FROM daily
  WHERE log_date < CURRENT_DATE - INTERVAL '2 days'
    AND log_date >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY district, village, symptom
)
SELECT
  r.district,
  r.village,
  r.symptom,
  r.recent_cases,
  r.recent_patients,
  COALESCE(b.avg_daily_cases, 0) AS baseline_avg,
  COALESCE(b.stddev_cases, 0) AS baseline_stddev,
  COALESCE(b.baseline_days, 0) AS baseline_days,
  -- Z-score: how many standard deviations above the mean
  CASE
    WHEN COALESCE(b.stddev_cases, 0) > 0
    THEN ROUND(((r.recent_cases::NUMERIC / 2.0) - b.avg_daily_cases) / b.stddev_cases, 2)
    WHEN COALESCE(b.avg_daily_cases, 0) > 0
    THEN ROUND((r.recent_cases::NUMERIC / 2.0) / b.avg_daily_cases, 2)
    ELSE 0
  END AS z_score,
  -- Rate ratio: current daily rate / baseline daily rate
  CASE
    WHEN COALESCE(b.avg_daily_cases, 0) > 0
    THEN ROUND((r.recent_cases::NUMERIC / 2.0) / b.avg_daily_cases, 2)
    ELSE r.recent_cases::NUMERIC
  END AS rate_ratio,
  -- Severity classification
  CASE
    WHEN COALESCE(b.stddev_cases, 0) > 0
         AND ((r.recent_cases::NUMERIC / 2.0) - b.avg_daily_cases) / b.stddev_cases >= 3.0
         AND r.recent_patients >= 5
    THEN 'critical'
    WHEN COALESCE(b.stddev_cases, 0) > 0
         AND ((r.recent_cases::NUMERIC / 2.0) - b.avg_daily_cases) / b.stddev_cases >= 2.0
         AND r.recent_patients >= 3
    THEN 'high'
    WHEN (r.recent_cases::NUMERIC / 2.0) > COALESCE(b.avg_daily_cases, 0) * 1.5
         AND r.recent_patients >= 3
    THEN 'moderate'
    ELSE 'normal'
  END AS severity,
  CURRENT_TIMESTAMP AS computed_at
FROM recent r
LEFT JOIN baseline b ON r.district IS NOT DISTINCT FROM b.district
  AND r.village IS NOT DISTINCT FROM b.village
  AND r.symptom = b.symptom
WHERE r.recent_cases >= 3  -- Minimum threshold to avoid noise
ORDER BY
  CASE
    WHEN COALESCE(b.stddev_cases, 0) > 0
    THEN ((r.recent_cases::NUMERIC / 2.0) - b.avg_daily_cases) / b.stddev_cases
    ELSE r.recent_cases::NUMERIC
  END DESC;


-- 4. Grant access to the views
GRANT SELECT ON public.symptom_daily_counts TO authenticated;
GRANT SELECT ON public.outbreak_alerts TO authenticated;

-- =============================================================================
-- DONE: The outbreak_alerts view now provides real-time anomaly detection.
-- Query it with: SELECT * FROM outbreak_alerts WHERE severity != 'normal';
-- =============================================================================
