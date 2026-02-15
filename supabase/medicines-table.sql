-- Create medicines table for Jan Aushadhi price comparison and medicine lookup
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  salt_composition TEXT,
  category TEXT NOT NULL,
  market_price NUMERIC(10,2),
  jan_aushadhi_name TEXT,
  jan_aushadhi_price NUMERIC(10,2),
  savings_percent NUMERIC(5,2),
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  uses TEXT[],
  side_effects TEXT[],
  contraindications TEXT[],
  hindi_name TEXT,
  is_nlem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Everyone can read medicines (public data)
CREATE POLICY "medicines_read_all" ON public.medicines
  FOR SELECT USING (true);

-- Only service role can insert/update (admin seeding)
CREATE POLICY "medicines_insert_service" ON public.medicines
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON public.medicines (generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name ON public.medicines (brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines (category);
CREATE INDEX IF NOT EXISTS idx_medicines_salt ON public.medicines (salt_composition);
