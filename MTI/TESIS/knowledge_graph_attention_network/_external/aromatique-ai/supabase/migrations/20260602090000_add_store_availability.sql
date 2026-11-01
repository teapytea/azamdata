-- Store availability layer for pilot-test improvement.
-- This keeps product metadata/model artifacts stable while allowing stock status
-- to vary per store.

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_product_availability (
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  availability_status TEXT NOT NULL DEFAULT 'out_of_stock'
    CHECK (availability_status IN ('in_stock', 'out_of_stock')),
  stock_qty INTEGER CHECK (stock_qty IS NULL OR stock_qty >= 0),
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_stores_active
  ON public.stores(is_active, display_name);

CREATE INDEX IF NOT EXISTS idx_store_availability_store_status
  ON public.store_product_availability(store_id, availability_status);

CREATE INDEX IF NOT EXISTS idx_store_availability_product
  ON public.store_product_availability(product_id);

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_store
  ON public.conversations(store_id, created_at DESC);

ALTER TABLE public.experiment_sessions
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_experiment_sessions_store_condition
  ON public.experiment_sessions(store_id, condition, assigned_at DESC);

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT,
  ADD COLUMN IF NOT EXISTS candidate_products_before_store_filter JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS filtered_out_unavailable_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_recommendations_store
  ON public.recommendations(store_id, created_at DESC);

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_store
  ON public.feedback(store_id, created_at DESC);

INSERT INTO public.stores (store_slug, store_name, display_name)
VALUES
  ('aromatique_jamal', 'Aromatique Jamal', 'Aromatique Jamal'),
  ('urban_tajem', 'Urban Tajem', 'Urban Tajem')
ON CONFLICT (store_slug) DO UPDATE
SET
  store_name = EXCLUDED.store_name,
  display_name = EXCLUDED.display_name,
  is_active = true,
  updated_at = now();

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_product_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read stores" ON public.stores;
CREATE POLICY "public read stores"
  ON public.stores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public read store availability" ON public.store_product_availability;
CREATE POLICY "public read store availability"
  ON public.store_product_availability FOR SELECT
  USING (true);
