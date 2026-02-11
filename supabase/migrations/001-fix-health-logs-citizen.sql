-- =============================================================================
-- MIGRATION: Fix health_logs for citizen self-assessments
-- Citizens should be able to save & view their own symptom checks,
-- prescription scans, etc. without needing a patient_id.
-- =============================================================================

-- 1. Make patient_id nullable (citizens don't have a patient record)
ALTER TABLE public.health_logs ALTER COLUMN patient_id DROP NOT NULL;

-- 2. Add policy: Citizens can view their own health logs (by recorded_by)
CREATE POLICY "Citizens can view own health logs" ON public.health_logs
  FOR SELECT USING (recorded_by = auth.uid());

-- =============================================================================
-- DONE. Now citizens can:
-- - Save symptom assessments with patient_id = NULL
-- - Save prescription scans with patient_id = NULL
-- - View all health logs they recorded (via recorded_by)
-- =============================================================================
