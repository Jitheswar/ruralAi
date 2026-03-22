-- =============================================================================
-- MIGRATION: Shared ABDM OTP transaction store (stub mode)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.abdm_pending_otps (
  transaction_id TEXT PRIMARY KEY,
  abha_id TEXT NOT NULL,
  otp TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abdm_pending_otps_expires_at
  ON public.abdm_pending_otps(expires_at);

ALTER TABLE public.abdm_pending_otps ENABLE ROW LEVEL SECURITY;

-- No policies: access is service-role only.
REVOKE ALL ON public.abdm_pending_otps FROM anon;
REVOKE ALL ON public.abdm_pending_otps FROM authenticated;
GRANT ALL ON public.abdm_pending_otps TO service_role;
