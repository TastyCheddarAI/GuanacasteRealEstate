import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from local supabase
dotenv.config({ path: '../supabase/.env' })

// Initialize Supabase client for LOCAL instance
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createPropertiesSimple() {
  console.log('🏗️ Creating sample properties directly...')

  const properties = [
    // FEATURED PROPERTIES (Premium listings)
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Oceanfront Luxury Villa - Tamarindo',
      type: 'house',
      price_numeric: 1250000,
      town: 'Tamarindo',
      lat: 10.295,
      lng: -85.837,
      beds: 4,
      baths: 3,
      area_m2: 320,
      lot_m2: 1200,
      quality_score: 100,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**PREMIUM FEATURED LISTING - Oceanfront Paradise**\n\nExperience the ultimate luxury lifestyle in this stunning 4BR/3BA oceanfront villa. Panoramic Pacific views, infinity pool, and resort-style amenities make this the perfect Guanacaste retreat.\n\n*Premium Features:*\n- Direct beach access\n- Infinity pool with ocean views\n- Gourmet kitchen with top appliances\n- 3-car garage\n- Home theater\n- Wine cellar\n- Smart home automation\n- 24/7 security\n\n*Location Benefits:*\n- Walking distance to Tamarindo town center\n- Near world-class restaurants and shopping\n- International airport access (30 min)\n\n*Investment Potential:*\n- High rental demand from tourists\n- Strong appreciation in Tamarindo market\n- Turnkey investment opportunity'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Championship Golf Course Estate - Playa Grande',
      type: 'house',
      price_numeric: 1850000,
      town: 'Playa Grande',
      lat: 10.327,
      lng: -85.854,
      beds: 5,
      baths: 4,
      area_m2: 450,
      lot_m2: 2000,
      quality_score: 100,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**PREMIUM FEATURED LISTING - Golf Course Luxury**\n\nMagnificent 5BR/4BA estate overlooking the championship golf course in exclusive Playa Grande. This resort-style home offers unparalleled luxury living with championship golf views.\n\n*Premium Features:*\n- Championship golf course views\n- Resort-style pool and spa\n- Home gym and sauna\n- Gourmet kitchen with professional appliances\n- Wine tasting room\n- 4-car garage\n- Guest casita\n- Smart irrigation system\n\n*Resort Amenities:*\n- 24/7 gated security\n- Tennis courts\n- Fitness center access\n- Beach club membership\n- Concierge services\n\n*Prime Location:*\n- Guarded community\n- Minutes from pristine beaches\n- Near Tamarindo and Flamingo'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Marinafront Penthouse - Playa Flamingo',
      type: 'condo',
      price_numeric: 895000,
      town: 'Playa Flamingo',
      lat: 10.428,
      lng: -85.785,
      beds: 3,
      baths: 3,
      area_m2: 220,
      quality_score: 100,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**PREMIUM FEATURED LISTING - Marina Luxury Living**\n\nSpectacular 3BR/3BA marina penthouse with breathtaking water views and resort amenities. Experience the pinnacle of Flamingo luxury living.\n\n*Premium Features:*\n- Private marina with boat dock\n- Floor-to-ceiling glass windows\n- Italian marble floors\n- Gourmet kitchen with Sub-Zero appliances\n- Master suite with spa bathroom\n- Private elevator\n- Rooftop terrace with jacuzzi\n- 2-car private garage\n\n*Resort Lifestyle:*\n- 5-star hotel amenities\n- World-class spa access\n- Multiple restaurants\n- Beach club\n- Water sports center\n- Kids club\n\n*Investment Value:*\n- Strong rental income potential\n- Appreciating Flamingo market\n- International buyer appeal'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Conchal Ocean View Condo',
      type: 'condo',
      price_numeric: 525000,
      town: 'Playa Conchal',
      lat: 10.395,
      lng: -85.695,
      beds: 2,
      baths: 2,
      area_m2: 110,
      quality_score: 100,
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**PREMIUM FEATURED LISTING - Conchal Luxury**\n\nElegant 2BR/2BA ocean view condo in exclusive Playa Conchal. Powder-soft beaches and resort amenities make this a true paradise destination.\n\n*Premium Features:*\n- Direct ocean views\n- Powder sand beach access\n- Resort pool and spa\n- Fitness center\n- Restaurant and bar\n- 24/7 security\n- Concierge services\n\n*Conchal Lifestyle:*\n- World-famous beach\n- Luxury resort living\n- International community\n- Water sports paradise\n- Fine dining options\n\n*Investment Value:*\n- Premium beach location\n- Strong rental potential\n- Limited inventory\n- Appreciating market'
    },

    // FREE LISTINGS (Standard listings)
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Charming Tamarindo Beach Cottage',
      type: 'house',
      price_numeric: 425000,
      town: 'Tamarindo',
      lat: 10.301,
      lng: -85.841,
      beds: 2,
      baths: 2,
      area_m2: 120,
      lot_m2: 300,
      quality_score: 0,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**FREE LISTING - Tamarindo Beach Cottage**\n\nAdorable 2BR/2BA beach cottage in the heart of Tamarindo. Perfect for first-time buyers or investors looking for a charming property in Costa Rica\'s most popular beach town.\n\n*Features:*\n- Walking distance to beach\n- Central Tamarindo location\n- Tropical garden\n- Updated kitchen\n- Community feel\n\n*Location:*\n- Near restaurants and shops\n- Short walk to surf schools\n- Close to Tamarindo Airport\n\n*Perfect For:*\n- First-time Costa Rica buyers\n- Vacation rental investment\n- Year-round living'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Nosara Yoga Retreat Property',
      type: 'house',
      price_numeric: 675000,
      town: 'Nosara',
      lat: 9.981,
      lng: -85.654,
      beds: 3,
      baths: 2,
      area_m2: 180,
      lot_m2: 800,
      quality_score: 0,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**FREE LISTING - Nosara Wellness Property**\n\nPeaceful 3BR/2BA home in the heart of Nosara\'s spiritual community. Surrounded by nature with easy access to yoga studios, organic cafes, and world-class surfing.\n\n*Features:*\n- Meditation garden\n- Open floor plan\n- Natural light throughout\n- Mature fruit trees\n- Walking distance to beach\n\n*Nosara Lifestyle:*\n- Yoga and wellness community\n- Organic and healthy living\n- Surfing paradise\n- Nature trails\n- International vibe\n\n*Investment Potential:*\n- Growing wellness tourism\n- Strong expat community\n- Rental demand from yogis and surfers'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Sámara Bay View Home',
      type: 'house',
      price_numeric: 385000,
      town: 'Sámara',
      lat: 9.882,
      lng: -85.527,
      beds: 2,
      baths: 1,
      area_m2: 95,
      lot_m2: 250,
      quality_score: 0,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**FREE LISTING - Sámara Bay Property**\n\nCharming 2BR/1BA home with beautiful bay views in laid-back Sámara. Perfect for those seeking the quintessential Costa Rican beach town experience.\n\n*Features:*\n- Bay views from living room\n- Short walk to beach\n- Tropical landscaping\n- Open kitchen design\n- Hammock-ready porch\n\n*Sámara Lifestyle:*\n- Laid-back beach town vibe\n- Great for families\n- Walking town center\n- Surfing and water sports\n- International community\n\n*Why Sámara:*\n- Safe and family-friendly\n- No high-rises allowed\n- Preserved natural beauty\n- Strong sense of community'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Liberia Family Home',
      type: 'house',
      price_numeric: 295000,
      town: 'Liberia',
      lat: 10.634,
      lng: -85.437,
      beds: 3,
      baths: 2,
      area_m2: 140,
      lot_m2: 500,
      quality_score: 0,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**FREE LISTING - Liberia Suburban Home**\n\nComfortable 3BR/2BA family home in Liberia\'s growing suburbs. Excellent value with proximity to the international airport and modern amenities.\n\n*Features:*\n- Spacious family rooms\n- Modern kitchen\n- Private backyard\n- 2-car carport\n- Mature landscaping\n\n*Location Benefits:*\n- 15 minutes to airport\n- Near schools and shopping\n- Growing suburban area\n- Easy access to beaches\n\n*Perfect For:*\n- Families relocating to Costa Rica\n- Airport accessibility\n- First-time homebuyers\n- Investment properties'
    },
    {
      owner_id: '00000000-0000-0000-0000-000000000000',
      status: 'published',
      title: 'Development Land - Brasilito',
      type: 'lot',
      price_numeric: 165000,
      town: 'Brasilito',
      lat: 10.395,
      lng: -85.745,
      lot_m2: 800,
      quality_score: 0,
      
      is_demo: true,
      published_at: new Date().toISOString(),
      description_md: '**FREE LISTING - Brasilito Development Land**\n\n800m² development parcel in up-and-coming Brasilito. Perfect for building your dream home or investment property in a growing beach community.\n\n*Land Features:*\n- Flat, buildable terrain\n- Utilities nearby\n- Ocean access road\n- Mature trees\n- Quiet location\n\n*Development Potential:*\n- Zoned for residential construction\n- Growing tourism area\n- Near beaches and town\n- Investment opportunity\n\n*Brasilito Growth:*\n- Emerging beach destination\n- New developments underway\n- International appeal\n- Strong appreciation potential'
    }
  ]

  for (const property of properties) {
    try {
      console.log(`📝 Creating property: ${property.title}`)
      const { data, error } = await supabase
        .from('properties')
        .insert(property)

      if (error) {
        console.error(`❌ Error creating property: ${property.title}`, error.message)
      } else {
        console.log(`✅ Created property: ${property.title} (${property.quality_score > 0 ? 'FEATURED' : 'FREE'})`)
      }
    } catch (error) {
      console.error(`❌ Failed to create property: ${property.title}`, error)
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('🎉 All properties created successfully!')

  // Verify the creation
  console.log('🔍 Verifying creation...')
  const { data: allProperties, error: verifyError } = await supabase
    .from('properties')
    .select('id, title, quality_score, price_numeric')
    .eq('status', 'published')
    .limit(10)

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError.message)
  } else {
    console.log(`✅ Found ${allProperties?.length || 0} properties in database:`)
    allProperties?.forEach(prop => {
      console.log(`  - ${prop.title}: ${prop.price_numeric.toLocaleString()} (${prop.quality_score > 0 ? 'FEATURED' : 'FREE'})`)
    })
  }
}

createPropertiesSimple().catch(console.error)