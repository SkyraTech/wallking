-- Wall King — Stock Management Database Schema
-- Run this migration in: Supabase Dashboard → SQL Editor → Run
-- Or via: supabase db push (if using Supabase CLI)
--
-- Tables:
--   stock_items           — master inventory
--   stock_imports         — import session log
--   stock_audit_events    — row-level change history (auto-populated by trigger)
--   whatsapp_inbound_events — WhatsApp message deduplication + reply log

-- =============================================================================
-- Enable extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy design number search

-- =============================================================================
-- 1. stock_imports  (create first — referenced by stock_items)
-- =============================================================================
CREATE TABLE IF NOT EXISTS stock_imports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename            TEXT,
  import_mode         TEXT NOT NULL CHECK (import_mode IN ('incremental', 'full_snapshot')),
  uploaded_by         TEXT NOT NULL DEFAULT 'admin',
  imported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_rows          INTEGER NOT NULL DEFAULT 0,
  created_rows        INTEGER NOT NULL DEFAULT 0,
  updated_rows        INTEGER NOT NULL DEFAULT 0,
  skipped_rows        INTEGER NOT NULL DEFAULT 0,
  invalid_rows        INTEGER NOT NULL DEFAULT 0,
  error_summary       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. stock_items  — the authoritative inventory table
-- =============================================================================
CREATE TABLE IF NOT EXISTS stock_items (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_number_display       TEXT NOT NULL,           -- original casing, e.g. "7517-04"
  design_number_normalized    TEXT NOT NULL,           -- UPPERCASE, canonical, e.g. "7517-04"
  brand                       TEXT NOT NULL DEFAULT '',
  collection                  TEXT,
  quantity_rolls              INTEGER NOT NULL DEFAULT 0 CHECK (quantity_rolls >= 0),
  warehouse_location          TEXT NOT NULL DEFAULT 'Hyderabad Central Depot',
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_import_id            UUID REFERENCES stock_imports(id) ON DELETE SET NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique per brand + normalized design number
  -- If design numbers are globally unique across all brands, use just design_number_normalized
  CONSTRAINT uq_brand_design UNIQUE (brand, design_number_normalized)
);

-- GiST index for trigram search (fuzzy design number lookup)
CREATE INDEX IF NOT EXISTS idx_stock_items_design_trgm
  ON stock_items USING GIN (design_number_normalized gin_trgm_ops);

-- B-tree index for exact normalized lookup (primary lookup path)
CREATE INDEX IF NOT EXISTS idx_stock_items_design_exact
  ON stock_items (design_number_normalized);

-- =============================================================================
-- 3. stock_audit_events  — populated automatically by trigger
-- =============================================================================
CREATE TABLE IF NOT EXISTS stock_audit_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_item_id   UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  old_quantity    INTEGER,
  new_quantity    INTEGER,
  old_brand       TEXT,
  new_brand       TEXT,
  action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  actor           TEXT NOT NULL DEFAULT 'system',
  import_id       UUID REFERENCES stock_imports(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_stock_item
  ON stock_audit_events (stock_item_id, created_at DESC);

-- Trigger function: auto-populate audit on stock_items changes
CREATE OR REPLACE FUNCTION fn_stock_audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO stock_audit_events
      (stock_item_id, old_quantity, new_quantity, old_brand, new_brand, action, actor, import_id)
    VALUES
      (NEW.id, NULL, NEW.quantity_rolls, NULL, NEW.brand, 'INSERT', 'system', NEW.source_import_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if quantity or brand actually changed
    IF OLD.quantity_rolls IS DISTINCT FROM NEW.quantity_rolls
       OR OLD.brand IS DISTINCT FROM NEW.brand THEN
      INSERT INTO stock_audit_events
        (stock_item_id, old_quantity, new_quantity, old_brand, new_brand, action, actor, import_id)
      VALUES
        (NEW.id, OLD.quantity_rolls, NEW.quantity_rolls, OLD.brand, NEW.brand, 'UPDATE', 'system', NEW.source_import_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO stock_audit_events
      (stock_item_id, old_quantity, new_quantity, old_brand, new_brand, action, actor, import_id)
    VALUES
      (OLD.id, OLD.quantity_rolls, NULL, OLD.brand, NULL, 'DELETE', 'system', NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_audit ON stock_items;
CREATE TRIGGER trg_stock_audit
  AFTER INSERT OR UPDATE OR DELETE ON stock_items
  FOR EACH ROW EXECUTE FUNCTION fn_stock_audit_trigger();

-- =============================================================================
-- 4. whatsapp_inbound_events  — deduplication + reply tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_inbound_events (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_message_id           TEXT NOT NULL UNIQUE,    -- from Meta webhook payload
  sender_reference          TEXT,                    -- masked phone (last 4 digits only)
  received_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_text              TEXT,
  normalized_design_number  TEXT,
  processing_status         TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'replied', 'not_found', 'out_of_stock', 'db_error', 'ignored', 'command_handled')),
  reply_message_id          TEXT,                    -- Meta message ID from send response
  error_summary             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_events_received
  ON whatsapp_inbound_events (received_at DESC);

-- =============================================================================
-- 5. Seed data — matches the original mock database for continuity
-- =============================================================================
INSERT INTO stock_items
  (design_number_display, design_number_normalized, brand, collection, quantity_rolls, warehouse_location)
VALUES
  ('7517-04',  '7517-04',  'Erismann',        'Eco-X Premier',     99,  'Hyderabad Central Depot'),
  ('ONYX-102', 'ONYX-102', 'Marburg',          'Onyx Statement',    45,  'Hyderabad Central Depot'),
  ('BEL-804',  'BEL-804',  'Grandeco',         'Belvedere Gold',   120,  'Hyderabad Central Depot'),
  ('LOH-201',  'LOH-201',  'BN Walls',         'Lohas Botanical',    0,  'Hyderabad Central Depot'),
  ('GEO-509',  'GEO-509',  'Sangetsu',         'Geometric Luxe',    12,  'Hyderabad Central Depot'),
  ('MAR-304',  'MAR-304',  'Zambaiti Parati',  'Marble Silk',       78,  'Hyderabad Central Depot'),
  ('BOT-401',  'BOT-401',  'Shinhan',          'Botanical Canopy', 210,  'Hyderabad Central Depot'),
  ('ECO-105',  'ECO-105',  'Erismann',         'Eco-X Premier',      0,  'Hyderabad Central Depot'),
  ('TEX-902',  'TEX-902',  'Lutèce',           'Textured Linen',    64,  'Hyderabad Central Depot'),
  ('VEL-603',  'VEL-603',  'Sirpi',            'Velvet Renaissance', 32,  'Hyderabad Central Depot')
ON CONFLICT (brand, design_number_normalized) DO NOTHING;
