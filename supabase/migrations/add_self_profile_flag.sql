-- =============================================================================
-- MIGRATION: Add explicit self-profile marker to patients
-- =============================================================================

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS is_self_profile BOOLEAN DEFAULT false;

-- Backfill legacy self records created before this flag existed.
WITH ranked AS (
  SELECT
    id,
    created_by,
    ROW_NUMBER() OVER (
      PARTITION BY created_by
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.patients
  WHERE name = 'My Health Profile'
)
UPDATE public.patients p
SET is_self_profile = CASE WHEN ranked.rn = 1 THEN true ELSE false END
FROM ranked
WHERE p.id = ranked.id;

-- Keep linked auth identity for self profiles when not already set.
UPDATE public.patients
SET user_id = created_by
WHERE is_self_profile = true
  AND user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_self_profile_unique
  ON public.patients(created_by)
  WHERE is_self_profile = true;
