-- Suche: Trigramme für tippfehlertolerante Produktsuche
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS products_search_trgm_idx ON products USING gin (search_text gin_trgm_ops);
--> statement-breakpoint
-- Fortlaufende Bestellnummern (PL-100001, PL-100002, …)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 100001;
--> statement-breakpoint
-- Row Level Security: Alle Tabellen sind für die öffentlichen Supabase-Rollen (anon, authenticated)
-- gesperrt. Der Shop greift ausschließlich serverseitig als Tabellen-Eigentümer zu.
-- Ohne Policies verweigert RLS jeden Zugriff über die Supabase-REST-API.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '__drizzle%' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated';
  END IF;
END $$;
