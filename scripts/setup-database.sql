-- =====================================================
-- GUANACASTE REAL ESTATE DATABASE SETUP
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PROFILES TABLE (for user management)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'owner', 'realtor', 'admin')),
  full_name TEXT,
  phone_e164 TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROPERTIES TABLE (main listings)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lot', 'house', 'condo', 'commercial', 'farm', 'hotel', 'mixed')),
  price_numeric NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  area_m2 INTEGER,
  lot_m2 INTEGER,
  beds INTEGER,
  baths INTEGER,
  town TEXT,
  lat NUMERIC(8,6),
  lng NUMERIC(9,6),
  description_md TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MESSAGES TABLE (for communication)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  from_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SAVED PROPERTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, property_id)
);

-- =====================================================
-- LEADS TABLE (contact forms)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  visitor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  contact_method TEXT NOT NULL,
  message TEXT,
  consent_flags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROPERTY VIEWS TABLE (analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT,
  filters JSONB,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SAVED SEARCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CONTENT PAGES TABLE (for CMS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_town ON public.properties(town);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON public.properties(verified);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price_numeric);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_profile ON public.messages(from_profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_profile ON public.messages(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Properties: Anyone can read published properties, owners can manage their own
CREATE POLICY "Anyone can view published properties" ON public.properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Owners can manage own properties" ON public.properties
  FOR ALL USING (auth.uid() = owner_id);

-- Messages: Users can read messages they're involved in
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = from_profile_id OR auth.uid() = to_profile_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = from_profile_id);

-- Saved Properties: Users can manage their own saved properties
CREATE POLICY "Users can view own saved properties" ON public.saved_properties
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can save/unsave properties" ON public.saved_properties
  FOR ALL USING (auth.uid() = profile_id);

-- Leads: Property owners can view leads on their properties
CREATE POLICY "Property owners can view leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = leads.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Property Views: Users can view their own activity
CREATE POLICY "Users can view own property views" ON public.property_views
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can record property views" ON public.property_views
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Search History: Users can view their own search history
CREATE POLICY "Users can view own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can record search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Saved Searches: Users can manage their own saved searches
CREATE POLICY "Users can view own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own saved searches" ON public.saved_searches
  FOR ALL USING (auth.uid() = profile_id);

-- Content Pages: Anyone can read published content
CREATE POLICY "Anyone can view published content" ON public.content_pages
  FOR SELECT USING (published = true);

-- =====================================================
-- INSERT SAMPLE ADMIN PROFILE
-- =====================================================
INSERT INTO public.profiles (id, role, full_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin', 'Admin User')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE PROPERTIES
-- =====================================================

-- FEATURED PROPERTIES (Premium listings)
INSERT INTO public.properties (
  owner_id, status, title, type, price_numeric, town, lat, lng, beds, baths, area_m2, lot_m2,
  featured, verified, is_demo, published_at, description_md
) VALUES
('00000000-0000-0000-0000-000000000000', 'published', 'Oceanfront Luxury Villa - Tamarindo', 'house', 1250000, 'Tamarindo', 10.295, -85.837, 4, 3, 320, 1200, true, true, true, NOW(),
 '**PREMIUM FEATURED LISTING - Oceanfront Paradise**

Experience the ultimate luxury lifestyle in this stunning 4BR/3BA oceanfront villa. Panoramic Pacific views, infinity pool, and resort-style amenities make this the perfect Guanacaste retreat.

*Premium Features:*
- Direct beach access
- Infinity pool with ocean views
- Gourmet kitchen with top appliances
- 3-car garage
- Home theater
- Wine cellar
- Smart home automation
- 24/7 security

*Location Benefits:*
- Walking distance to Tamarindo town center
- Near world-class restaurants and shopping
- International airport access (30 min)

*Investment Potential:*
- High rental demand from tourists
- Strong appreciation in Tamarindo market
- Turnkey investment opportunity'),

('00000000-0000-0000-0000-000000000000', 'published', 'Championship Golf Course Estate - Playa Grande', 'house', 1850000, 'Playa Grande', 10.327, -85.854, 5, 4, 450, 2000, true, true, true, NOW(),
 '**PREMIUM FEATURED LISTING - Golf Course Luxury**

Magnificent 5BR/4BA estate overlooking the championship golf course in exclusive Playa Grande. This resort-style home offers unparalleled luxury living with championship golf views.

*Premium Features:*
- Championship golf course views
- Resort-style pool and spa
- Home gym and sauna
- Gourmet kitchen with professional appliances
- Wine tasting room
- 4-car garage
- Guest casita
- Smart irrigation system

*Resort Amenities:*
- 24/7 gated security
- Tennis courts
- Fitness center access
- Beach club membership
- Concierge services

*Prime Location:*
- Guarded community
- Minutes from pristine beaches
- Near Tamarindo and Flamingo'),

('00000000-0000-0000-0000-000000000000', 'published', 'Marinafront Penthouse - Playa Flamingo', 'condo', 895000, 'Playa Flamingo', 10.428, -85.785, 3, 3, 220, null, true, true, true, NOW(),
 '**PREMIUM FEATURED LISTING - Marina Luxury Living**

Spectacular 3BR/3BA marina penthouse with breathtaking water views and resort amenities. Experience the pinnacle of Flamingo luxury living.

*Premium Features:*
- Private marina with boat dock
- Floor-to-ceiling glass windows
- Italian marble floors
- Gourmet kitchen with Sub-Zero appliances
- Master suite with spa bathroom
- Private elevator
- Rooftop terrace with jacuzzi
- 2-car private garage

*Resort Lifestyle:*
- 5-star hotel amenities
- World-class spa access
- Multiple restaurants
- Beach club
- Water sports center
- Kids club

*Investment Value:*
- Strong rental income potential
- Appreciating Flamingo market
- International buyer appeal'),

('00000000-0000-0000-0000-000000000000', 'published', 'Conchal Ocean View Condo', 'condo', 525000, 'Playa Conchal', 10.395, -85.695, 2, 2, 110, null, true, true, true, NOW(),
 '**PREMIUM FEATURED LISTING - Conchal Luxury**

Elegant 2BR/2BA ocean view condo in exclusive Playa Conchal. Powder-soft beaches and resort amenities make this a true paradise destination.

*Premium Features:*
- Direct ocean views
- Powder sand beach access
- Resort pool and spa
- Fitness center
- Restaurant and bar
- 24/7 security
- Concierge services

*Conchal Lifestyle:*
- World-famous beach
- Luxury resort living
- International community
- Water sports paradise
- Fine dining options

*Investment Value:*
- Premium beach location
- Strong rental potential
- Limited inventory
- Appreciating market'),

-- FREE LISTINGS (Standard listings)
('00000000-0000-0000-0000-000000000000', 'published', 'Charming Tamarindo Beach Cottage', 'house', 425000, 'Tamarindo', 10.301, -85.841, 2, 2, 120, 300, false, true, true, NOW(),
 '**FREE LISTING - Tamarindo Beach Cottage**

Adorable 2BR/2BA beach cottage in the heart of Tamarindo. Perfect for first-time buyers or investors looking for a charming property in Costa Rica''s most popular beach town.

*Features:*
- Walking distance to beach
- Central Tamarindo location
- Tropical garden
- Updated kitchen
- Community feel

*Location:*
- Near restaurants and shops
- Short walk to surf schools
- Close to Tamarindo Airport

*Perfect For:*
- First-time Costa Rica buyers
- Vacation rental investment
- Year-round living'),

('00000000-0000-0000-0000-000000000000', 'published', 'Nosara Yoga Retreat Property', 'house', 675000, 'Nosara', 9.981, -85.654, 3, 2, 180, 800, false, true, true, NOW(),
 '**FREE LISTING - Nosara Wellness Property**

Peaceful 3BR/2BA home in the heart of Nosara''s spiritual community. Surrounded by nature with easy access to yoga studios, organic cafes, and world-class surfing.

*Features:*
- Meditation garden
- Open floor plan
- Natural light throughout
- Mature fruit trees
- Walking distance to beach

*Nosara Lifestyle:*
- Yoga and wellness community
- Organic and healthy living
- Surfing paradise
- Nature trails
- International vibe

*Investment Potential:*
- Growing wellness tourism
- Strong expat community
- Rental demand from yogis and surfers'),

('00000000-0000-0000-0000-000000000000', 'published', 'Sámara Bay View Home', 'house', 385000, 'Sámara', 9.882, -85.527, 2, 1, 95, 250, false, false, true, NOW(),
 '**FREE LISTING - Sámara Bay Property**

Charming 2BR/1BA home with beautiful bay views in laid-back Sámara. Perfect for those seeking the quintessential Costa Rican beach town experience.

*Features:*
- Bay views from living room
- Short walk to beach
- Tropical landscaping
- Open kitchen design
- Hammock-ready porch

*Sámara Lifestyle:*
- Laid-back beach town vibe
- Great for families
- Walking town center
- Surfing and water sports
- International community

*Why Sámara:*
- Safe and family-friendly
- No high-rises allowed
- Preserved natural beauty
- Strong sense of community'),

('00000000-0000-0000-0000-000000000000', 'published', 'Liberia Family Home', 'house', 295000, 'Liberia', 10.634, -85.437, 3, 2, 140, 500, false, true, true, NOW(),
 '**FREE LISTING - Liberia Suburban Home**

Comfortable 3BR/2BA family home in Liberia''s growing suburbs. Excellent value with proximity to the international airport and modern amenities.

*Features:*
- Spacious family rooms
- Modern kitchen
- Private backyard
- 2-car carport
- Mature landscaping

*Location Benefits:*
- 15 minutes to airport
- Near schools and shopping
- Growing suburban area
- Easy access to beaches

*Perfect For:*
- Families relocating to Costa Rica
- Airport accessibility
- First-time homebuyers
- Investment properties'),

('00000000-0000-0000-0000-000000000000', 'published', 'Development Land - Brasilito', 'lot', 165000, 'Brasilito', 10.395, -85.745, null, null, null, 800, false, false, true, NOW(),
 '**FREE LISTING - Brasilito Development Land**

800m² development parcel in up-and-coming Brasilito. Perfect for building your dream home or investment property in a growing beach community.

*Land Features:*
- Flat, buildable terrain
- Utilities nearby
- Ocean access road
- Mature trees
- Quiet location

*Development Potential:*
- Zoned for residential construction
- Growing tourism area
- Near beaches and town
- Investment opportunity

*Brasilito Growth:*
- Emerging beach destination
- New developments underway
- International appeal
- Strong appreciation potential');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify the setup
SELECT
  'Profiles' as table_name,
  COUNT(*) as count
FROM public.profiles
UNION ALL
SELECT
  'Properties' as table_name,
  COUNT(*) as count
FROM public.properties
WHERE status = 'published';

-- Show featured vs free breakdown
SELECT
  featured,
  COUNT(*) as count,
  MIN(price_numeric) as min_price,
  MAX(price_numeric) as max_price,
  ROUND(AVG(price_numeric), 0) as avg_price
FROM public.properties
WHERE status = 'published'
GROUP BY featured
ORDER BY featured DESC;