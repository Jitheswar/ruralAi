-- =============================================================================
-- RURALAI SUPABASE DATABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE (extends auth.users with app-specific data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'sahayak', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  abha_id TEXT,
  abha_address TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed')),
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (safety net for alternative signup flows)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 2. ABDM OTP TABLE (shared stub transaction store)
-- -----------------------------------------------------------------------------
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
REVOKE ALL ON public.abdm_pending_otps FROM anon;
REVOKE ALL ON public.abdm_pending_otps FROM authenticated;
GRANT ALL ON public.abdm_pending_otps TO service_role;

-- -----------------------------------------------------------------------------
-- 3. DEVICES TABLE (device registry for session management)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_name TEXT,
  device_fingerprint TEXT,
  platform TEXT CHECK (platform IN ('android', 'ios', 'web')),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own devices
CREATE POLICY "Users can view own devices" ON public.devices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own devices" ON public.devices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own devices" ON public.devices
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all devices (for security monitoring)
CREATE POLICY "Admins can view all devices" ON public.devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can revoke any device
CREATE POLICY "Admins can update any device" ON public.devices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON public.devices(device_fingerprint);

-- -----------------------------------------------------------------------------
-- 4. AUDIT LOG TABLE (immutable access log for compliance)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  target_table TEXT,
  target_record UUID,
  details JSONB,
  device_id UUID,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (but with special insert-only rules)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert logs (via authenticated request)
CREATE POLICY "Authenticated users can insert logs" ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can read all logs
CREATE POLICY "Admins can read audit logs" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own logs
CREATE POLICY "Users can read own audit logs" ON public.audit_log
  FOR SELECT USING (user_id = auth.uid());

-- NO UPDATE OR DELETE policies - audit log is immutable
-- Revoke direct update/delete to enforce immutability
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated;
REVOKE UPDATE, DELETE ON public.audit_log FROM anon;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- -----------------------------------------------------------------------------
-- 5. PATIENTS TABLE (for WatermelonDB sync)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  village TEXT,
  district TEXT,
  abha_id TEXT,
  user_id UUID REFERENCES auth.users(id),  -- Link patient to their own auth account (nullable)
  is_self_profile BOOLEAN DEFAULT false,
  is_synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- WatermelonDB sync fields
  _status TEXT DEFAULT 'synced',
  _changed TEXT DEFAULT '',
  server_created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Sahayaks can view patients they created
CREATE POLICY "Sahayaks can view own patients" ON public.patients
  FOR SELECT USING (created_by = auth.uid());

-- Sahayaks can create patients
CREATE POLICY "Sahayaks can create patients" ON public.patients
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Sahayaks can update their patients
CREATE POLICY "Sahayaks can update own patients" ON public.patients
  FOR UPDATE USING (created_by = auth.uid());

-- Admins can view all patients
CREATE POLICY "Admins can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_abha_id ON public.patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_self_profile_unique
  ON public.patients(created_by)
  WHERE is_self_profile = true;

-- Citizens can view their own patient record (linked via user_id)
CREATE POLICY "Citizens can view own patient record" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. HEALTH LOGS TABLE (vitals, symptoms, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  log_type TEXT NOT NULL CHECK (log_type IN ('vitals', 'symptoms', 'diagnosis', 'prescription')),
  data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- WatermelonDB sync fields
  _status TEXT DEFAULT 'synced',
  _changed TEXT DEFAULT '',
  server_created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

-- Medical records are APPEND-ONLY (no updates allowed per auth-roadmap.md)
CREATE POLICY "Users can view health logs for their patients" ON public.health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients WHERE id = patient_id AND created_by = auth.uid()
    )
  );

-- Users can also view health logs they personally recorded
CREATE POLICY "Users can view own recorded logs" ON public.health_logs
  FOR SELECT USING (recorded_by = auth.uid());

CREATE POLICY "Users can insert health logs" ON public.health_logs
  FOR INSERT WITH CHECK (recorded_by = auth.uid());

-- Admins can view all health logs
CREATE POLICY "Admins can view all health logs" ON public.health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NO UPDATE POLICY - medical records are append-only
REVOKE UPDATE ON public.health_logs FROM authenticated;
REVOKE UPDATE ON public.health_logs FROM anon;

-- Citizens can view health logs linked to their patient record
CREATE POLICY "Citizens can view own health logs" ON public.health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = health_logs.patient_id
        AND patients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_health_logs_patient_id ON public.health_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_recorded_by ON public.health_logs(recorded_by);

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- After running this script:
-- 1. Go to Authentication → Settings → Enable Phone Auth
-- 2. Configure SMS provider if needed (or use test mode for development)
-- 3. Create an admin user via the Auth dashboard
-- =============================================================================
