import { Client } from 'pg';

// Direct PostgreSQL connection to bypass PostgREST schema cache issues
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

interface MockProperty {
  title: string;
  type: 'lot' | 'house' | 'condo' | 'commercial' | 'farm' | 'hotel' | 'mixed';
  price_numeric: number;
  town: string;
  lat: number;
  lng: number;
  beds?: number;
  baths?: number;
  area_m2?: number;
  lot_m2?: number;
  description_md: string;
}

// Mock properties for beta testing - clearly labeled as demo data
const mockProperties: MockProperty[] = [
  // Tamarindo Properties
  {
    title: '[BETA DEMO] Oceanfront 3BR Villa - Tamarindo',
    type: 'house',
    price_numeric: 650000,
    town: 'Tamarindo',
    lat: 10.295,
    lng: -85.837,
    beds: 3,
    baths: 2,
    area_m2: 180,
    lot_m2: 800,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nStunning oceanfront villa with panoramic Pacific views. This demo property features 3 bedrooms, 2 bathrooms, and a private pool. Perfect for families seeking the ultimate beach lifestyle in Tamarindo.\n\n*Features:*\n- Ocean views\n- Private pool\n- Modern kitchen\n- 2-car garage\n\n*Note: This is sample data for testing purposes only.*'
  },
  {
    title: '[BETA DEMO] Downtown Tamarindo Condo',
    type: 'condo',
    price_numeric: 425000,
    town: 'Tamarindo',
    lat: 10.301,
    lng: -85.841,
    beds: 2,
    baths: 2,
    area_m2: 95,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nModern 2BR/2BA condo in the heart of Tamarindo. Walking distance to restaurants, shops, and the beach. This demo property showcases urban living with Guanacaste charm.\n\n*Features:*\n- Central location\n- Balcony with partial ocean views\n- Underground parking\n- Community pool\n\n*Note: This is sample data for testing purposes only.*'
  },
  {
    title: '[BETA DEMO] Tamarindo Beachfront Lot',
    type: 'lot',
    price_numeric: 180000,
    town: 'Tamarindo',
    lat: 10.298,
    lng: -85.835,
    lot_m2: 600,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nPrime beachfront lot in Tamarindo perfect for building your dream home. This demo property offers 600m² of land with direct beach access and stunning sunsets.\n\n*Features:*\n- Beachfront location\n- Utilities available\n- Zoned for residential construction\n- Ocean views\n\n*Note: This is sample data for testing purposes only.*'
  },

  // Nosara Properties
  {
    title: '[BETA DEMO] Yoga Retreat Villa - Nosara',
    type: 'house',
    price_numeric: 750000,
    town: 'Nosara',
    lat: 9.981,
    lng: -85.654,
    beds: 4,
    baths: 3,
    area_m2: 220,
    lot_m2: 1200,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nPeaceful 4BR villa in the heart of Nosara\'s spiritual community. This demo property features meditation spaces, organic gardens, and proximity to world-class surfing and yoga.\n\n*Features:*\n- Yoga/meditation room\n- Organic vegetable garden\n- Mountain views\n- Walking distance to beach\n\n*Note: This is sample data for testing purposes only.*'
  },
  {
    title: '[BETA DEMO] Nosara Jungle Estate',
    type: 'house',
    price_numeric: 950000,
    town: 'Nosara',
    lat: 9.975,
    lng: -85.648,
    beds: 5,
    baths: 4,
    area_m2: 350,
    lot_m2: 2000,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nLuxurious jungle estate with wildlife viewing decks and a private trail system. This demo property offers the ultimate nature retreat experience in Nosara.\n\n*Features:*\n- Wildlife viewing areas\n- Private trails\n- Infinity pool\n- Guest house\n- Solar power system\n\n*Note: This is sample data for testing purposes only.*'
  },

  // Playa Grande Properties
  {
    title: '[BETA DEMO] Playa Grande Golf Course Home',
    type: 'house',
    price_numeric: 1200000,
    town: 'Playa Grande',
    lat: 10.327,
    lng: -85.854,
    beds: 4,
    baths: 3,
    area_m2: 280,
    lot_m2: 1000,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nElegant 4BR home overlooking the championship golf course in Playa Grande. This demo property combines luxury living with resort amenities.\n\n*Features:*\n- Golf course views\n- Tennis court access\n- Resort pool membership\n- 3-car garage\n- Wine cellar\n\n*Note: This is sample data for testing purposes only.*'
  },

  // Flamingo Properties
  {
    title: '[BETA DEMO] Flamingo Marina Condo',
    type: 'condo',
    price_numeric: 580000,
    town: 'Playa Flamingo',
    lat: 10.428,
    lng: -85.785,
    beds: 3,
    baths: 2,
    area_m2: 140,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nSpacious 3BR marina condo with boat dock and resort amenities. This demo property offers the best of Flamingo\'s luxury lifestyle.\n\n*Features:*\n- Private boat dock\n- Marina views\n- Spa access\n- Fitness center\n- Concierge service\n\n*Note: This is sample data for testing purposes only.*'
  },

  // Samara Properties
  {
    title: '[BETA DEMO] Samara Beach Bungalow',
    type: 'house',
    price_numeric: 395000,
    town: 'Sámara',
    lat: 9.882,
    lng: -85.527,
    beds: 2,
    baths: 1,
    area_m2: 85,
    lot_m2: 400,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nCharming beach bungalow perfect for retirees or young families. This demo property captures Samara\'s laid-back charm and beautiful bay location.\n\n*Features:*\n- Bay views\n- Short walk to beach\n- Tropical garden\n- Hammock porch\n- Community feel\n\n*Note: This is sample data for testing purposes only.*'
  },

  // Liberia Properties
  {
    title: '[BETA DEMO] Liberia Suburban Home',
    type: 'house',
    price_numeric: 285000,
    town: 'Liberia',
    lat: 10.634,
    lng: -85.437,
    beds: 3,
    baths: 2,
    area_m2: 160,
    lot_m2: 600,
    description_md: '**BETA TEST PROPERTY - NOT REAL LISTING**\n\nComfortable family home in Liberia\'s growing suburbs. This demo property offers convenience, community, and proximity to the international airport.\n\n*Features:*\n- Quiet neighborhood\n- Near schools and shopping\n- 15-min to airport\n- Mature landscaping\n- 2-car carport\n\n*Note: This is sample data for testing purposes only.*'
  }
];

async function seedMockProperties(): Promise<void> {
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');

    // Create tables if they don't exist
    const setupSQL = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL DEFAULT 'buyer',
        full_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'draft',
        title TEXT NOT NULL,
        type TEXT NOT NULL,
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
        is_demo BOOLEAN NOT NULL DEFAULT false,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await client.query(setupSQL);
    console.log('Tables created/verified');

    // Get or create admin profile ID
    let adminResult = await client.query(
      'SELECT id FROM public.profiles WHERE role = \'admin\' LIMIT 1'
    );

    let adminId: string;
    if (adminResult.rows.length === 0) {
      const insertResult = await client.query(
        'INSERT INTO public.profiles (role, full_name) VALUES (\'admin\', \'Admin User\') RETURNING id'
      );
      adminId = insertResult.rows[0].id;
      console.log(`Created admin profile: ${adminId}`);
    } else {
      adminId = adminResult.rows[0].id;
      console.log(`Using existing admin profile: ${adminId}`);
    }

    // Insert mock properties
    for (const property of mockProperties) {
      const query = `
        INSERT INTO public.properties (
          owner_id, status, title, type, price_numeric, currency, town, lat, lng,
          beds, baths, area_m2, lot_m2, description_md, is_demo, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        ON CONFLICT DO NOTHING
      `;

      const values = [
        adminId,
        'published',
        property.title,
        property.type,
        property.price_numeric,
        'USD',
        property.town,
        property.lat,
        property.lng,
        property.beds || null,
        property.baths || null,
        property.area_m2 || null,
        property.lot_m2 || null,
        property.description_md,
        true // is_demo = true
      ];

      await client.query(query, values);
      console.log(`✅ Inserted mock property: ${property.title}`);
    }

    console.log('🎉 Mock properties seeded successfully!');

  } finally {
    // Close database connection
    await client.end();
    console.log('Database connection closed');
  }
}

seedMockProperties().catch(console.error);