// Property Data Pipeline Service
// Handles ingestion, validation, and synchronization of real estate data

interface PropertyDataSource {
  id: string;
  name: string;
  type: 'mls' | 'registry' | 'broker' | 'api';
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
  lastSync?: Date;
  syncInterval: number; // minutes
}

interface RawPropertyData {
  sourceId: string;
  externalId: string;
  rawData: any;
  ingestedAt: Date;
}

interface NormalizedProperty {
  // Core property data
  title: string;
  description?: string;
  propertyType: 'house' | 'condo' | 'lot' | 'commercial' | 'farm' | 'hotel' | 'mixed';

  // Location data
  address?: string;
  town: string;
  province?: string;
  country: string;
  lat?: number;
  lng?: number;

  // Financial data
  price?: number;
  currency: string;
  priceHistory?: Array<{ price: number; date: Date; source: string }>;

  // Physical characteristics
  areaM2?: number;
  lotM2?: number;
  beds?: number;
  baths?: number;
  yearBuilt?: number;
  floors?: number;

  // Legal data
  titleType?: 'titled' | 'concession';
  folioReal?: string;
  ownerName?: string;
  taxId?: string;

  // Metadata
  sourceId: string;
  externalId: string;
  sourceUrl?: string;
  images?: string[];
  lastUpdated: Date;
  status: 'active' | 'sold' | 'pending' | 'off_market';
}

class PropertyDataPipeline {
  private sources: PropertyDataSource[] = [
    {
      id: 'ccbr',
      name: 'Costa Rican Chamber of Real Estate',
      type: 'registry',
      baseUrl: 'https://api.ccbr.cr/v1',
      enabled: false, // Enable when API access is available
      syncInterval: 60 // 1 hour
    },
    {
      id: 'bccr_registry',
      name: 'Public Registry (BCCR)',
      type: 'registry',
      baseUrl: 'https://www.registronacional.go.cr',
      enabled: false, // Requires special access
      syncInterval: 1440 // 24 hours
    },
    {
      id: 'mls_cr',
      name: 'MLS Costa Rica',
      type: 'mls',
      baseUrl: 'https://api.mlscostarica.com/v2',
      enabled: false, // Enable when partnership established
      syncInterval: 30 // 30 minutes
    },
    {
      id: 'local_brokers',
      name: 'Local Broker Feeds',
      type: 'broker',
      baseUrl: 'https://feeds.localbrokers.cr',
      enabled: false, // Enable when broker partnerships established
      syncInterval: 15 // 15 minutes
    }
  ];

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

  // Ingest data from a specific source
  async ingestFromSource(sourceId: string): Promise<{
    success: boolean;
    propertiesIngested: number;
    errors: string[];
  }> {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source || !source.enabled) {
      return {
        success: false,
        propertiesIngested: 0,
        errors: [`Source ${sourceId} is not available or disabled`]
      };
    }

    try {
      const rawData = await this.fetchFromSource(source);
      const normalizedProperties = await this.normalizeData(rawData, source);

      // Validate and store properties
      const validProperties = [];
      const errors = [];

      for (const property of normalizedProperties) {
        try {
          await this.validateProperty(property);
          validProperties.push(property);
        } catch (error) {
          errors.push(`Validation failed for property ${property.externalId}: ${error}`);
        }
      }

      // Store valid properties
      await this.storeProperties(validProperties);

      // Update source sync timestamp
      source.lastSync = new Date();

      return {
        success: true,
        propertiesIngested: validProperties.length,
        errors
      };
    } catch (error) {
      console.error(`Error ingesting from ${sourceId}:`, error);
      return {
        success: false,
        propertiesIngested: 0,
        errors: [`Ingestion failed: ${error}`]
      };
    }
  }

  // Fetch raw data from a source
  private async fetchFromSource(source: PropertyDataSource): Promise<any[]> {
    const cacheKey = `source_${source.id}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // In production, this would make actual API calls
    // For now, simulate data fetching with realistic structure
    const mockData = await this.generateMockSourceData(source);

    // Cache the result
    this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });

    return mockData;
  }

  // Normalize raw data to standard format
  private async normalizeData(rawData: any[], source: PropertyDataSource): Promise<NormalizedProperty[]> {
    return rawData.map(item => this.normalizeProperty(item, source));
  }

  // Normalize a single property
  private normalizeProperty(rawItem: any, source: PropertyDataSource): NormalizedProperty {
    // This would contain the actual normalization logic
    // For now, return a basic normalized structure
    return {
      title: rawItem.title || rawItem.name || 'Property',
      description: rawItem.description,
      propertyType: this.mapPropertyType(rawItem.type),

      address: rawItem.address,
      town: rawItem.town || rawItem.city || 'Unknown',
      province: rawItem.province || 'Guanacaste',
      country: 'Costa Rica',
      lat: rawItem.latitude || rawItem.lat,
      lng: rawItem.longitude || rawItem.lng,

      price: rawItem.price || rawItem.listPrice,
      currency: rawItem.currency || 'USD',

      areaM2: rawItem.areaSqm || rawItem.areaM2,
      lotM2: rawItem.lotSqm || rawItem.lotM2,
      beds: rawItem.bedrooms || rawItem.beds,
      baths: rawItem.bathrooms || rawItem.baths,
      yearBuilt: rawItem.yearBuilt || rawItem.constructionYear,

      titleType: rawItem.titleType === 'titled' ? 'titled' : 'concession',
      folioReal: rawItem.folioReal || rawItem.registryNumber,
      ownerName: rawItem.ownerName,

      sourceId: source.id,
      externalId: rawItem.id || rawItem.listingId || rawItem.externalId,
      sourceUrl: rawItem.url || rawItem.listingUrl,
      images: rawItem.images || rawItem.photos || [],
      lastUpdated: new Date(rawItem.lastModified || rawItem.updatedAt || Date.now()),
      status: this.mapStatus(rawItem.status)
    };
  }

  // Validate property data
  private async validateProperty(property: NormalizedProperty): Promise<void> {
    // Required fields validation
    if (!property.title) throw new Error('Title is required');
    if (!property.town) throw new Error('Town is required');
    if (!property.externalId) throw new Error('External ID is required');

    // Data type validation
    if (property.price && typeof property.price !== 'number') {
      throw new Error('Price must be a number');
    }

    if (property.lat && (property.lat < -90 || property.lat > 90)) {
      throw new Error('Invalid latitude');
    }

    if (property.lng && (property.lng < -180 || property.lng > 180)) {
      throw new Error('Invalid longitude');
    }

    // Business logic validation
    if (property.price && property.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (property.areaM2 && property.areaM2 < 0) {
      throw new Error('Area cannot be negative');
    }
  }

  // Store properties in database
  private async storeProperties(properties: NormalizedProperty[]): Promise<void> {
    // In production, this would insert/update properties in Supabase
    // For now, simulate storage
    console.log(`Storing ${properties.length} properties`);

    // Group by source for batch operations
    const bySource = properties.reduce((acc, prop) => {
      if (!acc[prop.sourceId]) acc[prop.sourceId] = [];
      acc[prop.sourceId].push(prop);
      return acc;
    }, {} as Record<string, NormalizedProperty[]>);

    // Process each source batch
    for (const [sourceId, sourceProperties] of Object.entries(bySource)) {
      await this.storeSourceBatch(sourceId, sourceProperties);
    }
  }

  // Store a batch of properties from one source
  private async storeSourceBatch(sourceId: string, properties: NormalizedProperty[]): Promise<void> {
    // In production, this would use Supabase client
    // For now, simulate database operations
    console.log(`Storing ${properties.length} properties from ${sourceId}`);

    // Simulate upsert logic (insert or update based on external_id + source_id)
    for (const property of properties) {
      // Check if property exists
      const exists = await this.propertyExists(property.sourceId, property.externalId);

      if (exists) {
        // Update existing property
        await this.updateProperty(property);
      } else {
        // Insert new property
        await this.insertProperty(property);
      }
    }
  }

  // Check if property exists
  private async propertyExists(sourceId: string, externalId: string): Promise<boolean> {
    // In production: Query Supabase
    // For now: Simulate database check
    return Math.random() > 0.7; // 30% chance of existing
  }

  // Insert new property
  private async insertProperty(property: NormalizedProperty): Promise<void> {
    // In production: Insert into Supabase properties table
    console.log(`Inserting new property: ${property.title}`);
  }

  // Update existing property
  private async updateProperty(property: NormalizedProperty): Promise<void> {
    // In production: Update Supabase properties table
    console.log(`Updating property: ${property.title}`);
  }

  // Helper methods
  private mapPropertyType(type: string): NormalizedProperty['propertyType'] {
    const typeMap: Record<string, NormalizedProperty['propertyType']> = {
      'house': 'house',
      'home': 'house',
      'single family': 'house',
      'condo': 'condo',
      'condominium': 'condo',
      'apartment': 'condo',
      'lot': 'lot',
      'land': 'lot',
      'terreno': 'lot',
      'commercial': 'commercial',
      'business': 'commercial',
      'farm': 'farm',
      'finca': 'farm',
      'hotel': 'hotel',
      'mixed': 'mixed'
    };

    return typeMap[type?.toLowerCase()] || 'house';
  }

  private mapStatus(status: string): NormalizedProperty['status'] {
    const statusMap: Record<string, NormalizedProperty['status']> = {
      'active': 'active',
      'available': 'active',
      'for sale': 'active',
      'sold': 'sold',
      'pending': 'pending',
      'under contract': 'pending',
      'off market': 'off_market',
      'withdrawn': 'off_market'
    };

    return statusMap[status?.toLowerCase()] || 'active';
  }

  // Generate mock data for development/testing
  private async generateMockSourceData(source: PropertyDataSource): Promise<any[]> {
    // Simulate API response with realistic property data
    const mockProperties = [
      {
        id: 'mock_001',
        title: 'Modern Beachfront Villa',
        type: 'house',
        price: 850000,
        currency: 'USD',
        town: 'Tamarindo',
        lat: 10.295,
        lng: -85.837,
        beds: 4,
        baths: 3,
        areaM2: 250,
        lotM2: 1000,
        description: 'Stunning modern villa with ocean views',
        images: ['https://example.com/image1.jpg'],
        status: 'active',
        lastModified: new Date().toISOString()
      },
      {
        id: 'mock_002',
        title: 'Downtown Condo',
        type: 'condo',
        price: 425000,
        currency: 'USD',
        town: 'Tamarindo',
        lat: 10.301,
        lng: -85.841,
        beds: 2,
        baths: 2,
        areaM2: 95,
        description: 'Modern condo in the heart of Tamarindo',
        images: ['https://example.com/image2.jpg'],
        status: 'active',
        lastModified: new Date().toISOString()
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return mockProperties;
  }

  // Get pipeline statistics
  getStats(): {
    sources: PropertyDataSource[];
    cacheSize: number;
    cacheKeys: string[];
  } {
    return {
      sources: this.sources,
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }

  // Enable/disable data source
  setSourceEnabled(sourceId: string, enabled: boolean): void {
    const source = this.sources.find(s => s.id === sourceId);
    if (source) {
      source.enabled = enabled;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const propertyDataPipeline = new PropertyDataPipeline();

// Export types
export type { PropertyDataSource, RawPropertyData, NormalizedProperty };