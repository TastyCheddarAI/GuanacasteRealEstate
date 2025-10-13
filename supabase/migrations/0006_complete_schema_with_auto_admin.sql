-- Extensions (graceful failure for vector)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
  EXCEPTION WHEN insufficient_privilege OR undefined_file THEN
    RAISE NOTICE 'vector extension unavailable; continuing';
  END;
END $$;

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- Enums
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'user_role';
  IF NOT FOUND THEN
    CREATE TYPE public.user_role AS ENUM ('buyer','owner','realtor','admin');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'property_status';
  IF NOT FOUND THEN
    CREATE TYPE public.property_status AS ENUM ('draft','pending','published','suspended','archived');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'property_type';
  IF NOT FOUND THEN
    CREATE TYPE public.property_type AS ENUM ('lot','house','condo','commercial','farm','hotel','mixed');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'currency_code';
  IF NOT FOUND THEN
    CREATE TYPE public.currency_code AS ENUM ('USD','CRC');
  END IF;
END $$;

-- Profiles table with auto-sync
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'buyer',
  full_name text,
  phone_e164 text,
  locale text NOT NULL DEFAULT 'en',
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT phone_format_chk CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{6,14}$')
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-provision profiles for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;
ALTER FUNCTION public.is_admin(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO public;

-- Properties table (complete schema)
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.property_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  type public.property_type NOT NULL,
  price_numeric numeric(14,2) NOT NULL CHECK (price_numeric >= 0),
  currency public.currency_code NOT NULL DEFAULT 'USD',
  area_m2 integer CHECK (area_m2 IS NULL OR area_m2 >= 0),
  lot_m2 integer CHECK (lot_m2 IS NULL OR lot_m2 >= 0),
  beds integer CHECK (beds IS NULL OR beds >= 0),
  baths integer CHECK (baths IS NULL OR baths >= 0),
  year_built integer CHECK (year_built IS NULL OR year_built BETWEEN 1800 AND 2100),
  hoa boolean,
  address_text text,
  town text,
  lat numeric(8,6) CHECK (lat IS NULL OR (lat >= -90 AND lat <= 90)),
  lng numeric(9,6) CHECK (lng IS NULL OR (lng >= -180 AND lng <= 180)),
  zoning_text text,
  title_type text NOT NULL DEFAULT 'titled',
  concession_until date,
  water_source text,
  electric_provider text,
  internet_provider text,
  description_md text,
  quality_score integer NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(town,'')),  'B') ||
    setweight(to_tsvector('simple', coalesce(description_md,'')), 'C')
  ) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_pub_at ON public.properties(published_at);
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_town ON public.properties(town);

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='props_public_read') THEN
    CREATE POLICY props_public_read
    ON public.properties FOR SELECT
    TO public
    USING (status = 'published' OR is_demo = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='props_owner_write') THEN
    CREATE POLICY props_owner_write
    ON public.properties FOR INSERT TO authenticated
    WITH CHECK (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='props_owner_update') THEN
    CREATE POLICY props_owner_update
    ON public.properties FOR UPDATE TO authenticated
    USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='props_owner_delete') THEN
    CREATE POLICY props_owner_delete
    ON public.properties FOR DELETE TO authenticated
    USING (owner_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='props_admin_all') THEN
    CREATE POLICY props_admin_all
    ON public.properties FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Promote admin by email (runtime configurable)
DO $$
DECLARE
  admin_email text := current_setting('app.admin_email', true);
  admin_uid uuid;
BEGIN
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE NOTICE 'app.admin_email not set; skipping admin promotion';
    RETURN;
  END IF;

  SELECT id INTO admin_uid FROM auth.users WHERE email = admin_email;
  IF admin_uid IS NULL THEN
    RAISE NOTICE 'No auth.user with email %; create the user first', admin_email;
    RETURN;
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (admin_uid, 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- Insert sample properties
INSERT INTO public.properties (
  owner_id, status, title, type, price_numeric, town, lat, lng, beds, baths, area_m2, lot_m2,
  quality_score, is_demo, published_at, description_md
) VALUES
-- FEATURED PROPERTIES (quality_score = 100)
((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Oceanfront Luxury Villa - Tamarindo', 'house', 1250000, 'Tamarindo', 10.295, -85.837, 4, 3, 320, 1200, 100, true, NOW(),
 '**PREMIUM FEATURED LISTING - Oceanfront Paradise**\n\nExperience the ultimate luxury lifestyle in this stunning 4BR/3BA oceanfront villa. Panoramic Pacific views, infinity pool, and resort-style amenities make this the perfect Guanacaste retreat.\n\n*Premium Features:*\n- Direct beach access\n- Infinity pool with ocean views\n- Gourmet kitchen with top appliances\n- 3-car garage\n- Home theater\n- Wine cellar\n- Smart home automation\n- 24/7 security\n\n*Location Benefits:*\n- Walking distance to Tamarindo town center\n- Near world-class restaurants and shopping\n- International airport access (30 min)\n\n*Investment Potential:*\n- High rental demand from tourists\n- Strong appreciation in Tamarindo market\n- Turnkey investment opportunity'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Championship Golf Course Estate - Playa Grande', 'house', 1850000, 'Playa Grande', 10.327, -85.854, 5, 4, 450, 2000, 100, true, NOW(),
 '**PREMIUM FEATURED LISTING - Golf Course Luxury**\n\nMagnificent 5BR/4BA estate overlooking the championship golf course in exclusive Playa Grande. This resort-style home offers unparalleled luxury living with championship golf views.\n\n*Premium Features:*\n- Championship golf course views\n- Resort-style pool and spa\n- Home gym and sauna\n- Gourmet kitchen with professional appliances\n- Wine tasting room\n- 4-car garage\n- Guest casita\n- Smart irrigation system\n\n*Resort Amenities:*\n- 24/7 gated security\n- Tennis courts\n- Fitness center access\n- Beach club membership\n- Concierge services\n\n*Prime Location:*\n- Guarded community\n- Minutes from pristine beaches\n- Near Tamarindo and Flamingo'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Marinafront Penthouse - Playa Flamingo', 'condo', 895000, 'Playa Flamingo', 10.428, -85.785, 3, 3, 220, null, 100, true, NOW(),
 '**PREMIUM FEATURED LISTING - Marina Luxury Living**\n\nSpectacular 3BR/3BA marina penthouse with breathtaking water views and resort amenities. Experience the pinnacle of Flamingo luxury living.\n\n*Premium Features:*\n- Private marina with boat dock\n- Floor-to-ceiling glass windows\n- Italian marble floors\n- Gourmet kitchen with Sub-Zero appliances\n- Master suite with spa bathroom\n- Private elevator\n- Rooftop terrace with jacuzzi\n- 2-car private garage\n\n*Resort Lifestyle:*\n- 5-star hotel amenities\n- World-class spa access\n- Multiple restaurants\n- Beach club\n- Water sports center\n- Kids club\n\n*Investment Value:*\n- Strong rental income potential\n- Appreciating Flamingo market\n- International buyer appeal'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Conchal Ocean View Condo', 'condo', 525000, 'Playa Conchal', 10.395, -85.695, 2, 2, 110, null, 100, true, NOW(),
 '**PREMIUM FEATURED LISTING - Conchal Luxury**\n\nElegant 2BR/2BA ocean view condo in exclusive Playa Conchal. Powder-soft beaches and resort amenities make this a true paradise destination.\n\n*Premium Features:*\n- Direct ocean views\n- Powder sand beach access\n- Resort pool and spa\n- Fitness center\n- Restaurant and bar\n- 24/7 security\n- Concierge services\n\n*Conchal Lifestyle:*\n- World-famous beach\n- Luxury resort living\n- International community\n- Water sports paradise\n- Fine dining options\n\n*Investment Value:*\n- Premium beach location\n- Strong rental potential\n- Limited inventory\n- Appreciating market'),

-- FREE LISTINGS (quality_score = 0)
((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Charming Tamarindo Beach Cottage', 'house', 425000, 'Tamarindo', 10.301, -85.841, 2, 2, 120, 300, 0, true, NOW(),
 '**FREE LISTING - Tamarindo Beach Cottage**\n\nAdorable 2BR/2BA beach cottage in the heart of Tamarindo. Perfect for first-time buyers or investors looking for a charming property in Costa Rica''s most popular beach town.\n\n*Features:*\n- Walking distance to beach\n- Central Tamarindo location\n- Tropical garden\n- Updated kitchen\n- Community feel\n\n*Location:*\n- Near restaurants and shops\n- Short walk to surf schools\n- Close to Tamarindo Airport\n\n*Perfect For:*\n- First-time Costa Rica buyers\n- Vacation rental investment\n- Year-round living'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Nosara Yoga Retreat Property', 'house', 675000, 'Nosara', 9.981, -85.654, 3, 2, 180, 800, 0, true, NOW(),
 '**FREE LISTING - Nosara Wellness Property**\n\nPeaceful 3BR/2BA home in the heart of Nosara''s spiritual community. Surrounded by nature with easy access to yoga studios, organic cafes, and world-class surfing.\n\n*Features:*\n- Meditation garden\n- Open floor plan\n- Natural light throughout\n- Mature fruit trees\n- Walking distance to beach\n\n*Nosara Lifestyle:*\n- Yoga and wellness community\n- Organic and healthy living\n- Surfing paradise\n- Nature trails\n- International vibe\n\n*Investment Potential:*\n- Growing wellness tourism\n- Strong expat community\n- Rental demand from yogis and surfers'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Sámara Bay View Home', 'house', 385000, 'Sámara', 9.882, -85.527, 2, 1, 95, 250, 0, true, NOW(),
 '**FREE LISTING - Sámara Bay Property**\n\nCharming 2BR/1BA home with beautiful bay views in laid-back Sámara. Perfect for those seeking the quintessential Costa Rican beach town experience.\n\n*Features:*\n- Bay views from living room\n- Short walk to beach\n- Tropical landscaping\n- Open kitchen design\n- Hammock-ready porch\n\n*Sámara Lifestyle:*\n- Laid-back beach town vibe\n- Great for families\n- Walking town center\n- Surfing and water sports\n- International community\n\n*Why Sámara:*\n- Safe and family-friendly\n- No high-rises allowed\n- Preserved natural beauty\n- Strong sense of community'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Liberia Family Home', 'house', 295000, 'Liberia', 10.634, -85.437, 3, 2, 140, 500, 0, true, NOW(),
 '**FREE LISTING - Liberia Suburban Home**\n\nComfortable 3BR/2BA family home in Liberia''s growing suburbs. Excellent value with proximity to the international airport and modern amenities.\n\n*Features:*\n- Spacious family rooms\n- Modern kitchen\n- Private backyard\n- 2-car carport\n- Mature landscaping\n\n*Location Benefits:*\n- 15 minutes to airport\n- Near schools and shopping\n- Growing suburban area\n- Easy access to beaches\n\n*Perfect For:*\n- Families relocating to Costa Rica\n- Airport accessibility\n- First-time homebuyers\n- Investment properties'),

((SELECT id FROM auth.users WHERE email = current_setting('app.admin_email', true) LIMIT 1), 'published', 'Development Land - Brasilito', 'lot', 165000, 'Brasilito', 10.395, -85.745, null, null, null, 800, 0, true, NOW(),
 '**FREE LISTING - Brasilito Development Land**\n\n800m² development parcel in up-and-coming Brasilito. Perfect for building your dream home or investment property in a growing beach community.\n\n*Land Features:*\n- Flat, buildable terrain\n- Utilities nearby\n- Ocean access road\n- Mature trees\n- Quiet location\n\n*Development Potential:*\n- Zoned for residential construction\n- Growing tourism area\n- Near beaches and town\n- Investment opportunity\n\n*Brasilito Growth:*\n- Emerging beach destination\n- New developments underway\n- International appeal\n- Strong appreciation potential');

-- Verification
SELECT
  'Properties Created' as status,
  COUNT(*) as count
FROM public.properties
WHERE status = 'published';

SELECT
  CASE WHEN quality_score > 0 THEN 'FEATURED' ELSE 'FREE' END as type,
  COUNT(*) as count,
  MIN(price_numeric) as min_price,
  MAX(price_numeric) as max_price
FROM public.properties
WHERE status = 'published'
GROUP BY CASE WHEN quality_score > 0 THEN 'FEATURED' ELSE 'FREE' END
ORDER BY type;