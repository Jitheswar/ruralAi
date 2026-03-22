-- =============================================================================
-- MIGRATION: Add user_id to patients for citizen self-service access
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================================

-- 1. Add user_id column to patients table (nullable — not all patients have accounts)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- 3. RLS: Citizens can view their own patient record
CREATE POLICY "Citizens can view own patient record" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

-- 4. RLS: Citizens can view health logs linked to their patient record
CREATE POLICY "Citizens can view own health logs" ON public.health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = health_logs.patient_id
        AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- USAGE:
-- After running this migration, link a patient to their auth account by setting:
--   UPDATE public.patients SET user_id = '<auth-user-uuid>' WHERE id = '<patient-uuid>';
-- Once linked, that citizen can see all health_logs for their patient record.
-- =============================================================================
