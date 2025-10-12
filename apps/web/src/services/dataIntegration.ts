// Data Integration Framework for Real Property Sources
// Prepares the system for integrating real property data from various sources

interface PropertySource {
  id: string;
  name: string;
  type: 'api' | 'feed' | 'scraping' | 'manual';
  endpoint?: string;
  apiKey?: string;
  enabled: boolean;
  lastSync?: Date;
  syncInterval: number; // minutes
  dataFormat: 'json' | 'xml' | 'csv';
  mapping: PropertyFieldMapping;
}

interface PropertyFieldMapping {
  title: string;
  price: string;
  currency: string;
  description: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  images: string;
  propertyType: string;
  listingDate: string;
  agent: string;
  contactInfo: string;
}

interface IntegrationStats {
  totalSources: number;
  activeSources: number;
  lastSyncTime: Date | null;
  totalProperties: number;
  newPropertiesToday: number;
  syncErrors: number;
}

class DataIntegrationService {
  private sources: PropertySource[] = [];
  private syncInProgress = false;

  constructor() {
    this.initializeDefaultSources();
    this.loadSourcesFromStorage();
  }

  // Initialize with common Costa Rican property sources
  private initializeDefaultSources(): void {
    this.sources = [
      {
        id: 'cri',
        name: 'Costa Rican Investments',
        type: 'api',
        endpoint: 'https://api.cri.cr/properties',
        enabled: false,
        syncInterval: 60, // 1 hour
        dataFormat: 'json',
        mapping: {
          title: 'title',
          price: 'price_usd',
          currency: 'USD',
          description: 'description',
          location: 'location',
          bedrooms: 'bedrooms',
          bathrooms: 'bathrooms',
          area: 'area_m2',
          images: 'images',
          propertyType: 'property_type',
          listingDate: 'created_at',
          agent: 'agent_name',
          contactInfo: 'contact_email'
        }
      },
      {
        id: 'century21',
        name: 'Century 21 Guanacaste',
        type: 'feed',
        endpoint: 'https://century21guanacaste.com/feed.xml',
        enabled: false,
        syncInterval: 120, // 2 hours
        dataFormat: 'xml',
        mapping: {
          title: 'title',
          price: 'price',
          currency: 'currency',
          description: 'description',
          location: 'location',
          bedrooms: 'bedrooms',
          bathrooms: 'bathrooms',
          area: 'area_sqft',
          images: 'images',
          propertyType: 'type',
          listingDate: 'pubDate',
          agent: 'agent',
          contactInfo: 'contact'
        }
      },
      {
        id: 'local_realtors',
        name: 'Local Realtor Network',
        type: 'api',
        endpoint: 'https://api.localrealtors.cr/listings',
        enabled: false,
        syncInterval: 180, // 3 hours
        dataFormat: 'json',
        mapping: {
          title: 'property_title',
          price: 'listing_price',
          currency: 'currency_code',
          description: 'property_description',
          location: 'property_location',
          bedrooms: 'bedroom_count',
          bathrooms: 'bathroom_count',
          area: 'total_area',
          images: 'photo_urls',
          propertyType: 'property_category',
          listingDate: 'date_listed',
          agent: 'listing_agent',
          contactInfo: 'agent_contact'
        }
      }
    ];
  }

  // Add a new data source
  addSource(source: Omit<PropertySource, 'id'>): string {
    const id = `source_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newSource: PropertySource = { ...source, id };
    this.sources.push(newSource);
    this.saveSourcesToStorage();
    return id;
  }

  // Update an existing source
  updateSource(id: string, updates: Partial<PropertySource>): boolean {
    const index = this.sources.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.sources[index] = { ...this.sources[index], ...updates };
    this.saveSourcesToStorage();
    return true;
  }

  // Remove a source
  removeSource(id: string): boolean {
    const index = this.sources.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.sources.splice(index, 1);
    this.saveSourcesToStorage();
    return true;
  }

  // Get all sources
  getSources(): PropertySource[] {
    return [...this.sources];
  }

  // Get active sources
  getActiveSources(): PropertySource[] {
    return this.sources.filter(s => s.enabled);
  }

  // Test a source connection
  async testSource(id: string): Promise<{ success: boolean; message: string; sampleData?: any }> {
    const source = this.sources.find(s => s.id === id);
    if (!source) {
      return { success: false, message: 'Source not found' };
    }

    try {
      // In production, this would make actual API calls
      // For now, simulate testing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Connection successful',
        sampleData: {
          totalProperties: Math.floor(Math.random() * 100) + 10,
          lastUpdated: new Date().toISOString(),
          sampleProperty: {
            title: 'Sample Property',
            price: 250000,
            location: 'Test Location'
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Sync data from all active sources
  async syncAllSources(): Promise<{
    success: boolean;
    syncedSources: number;
    totalProperties: number;
    errors: string[];
  }> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const results = {
      success: true,
      syncedSources: 0,
      totalProperties: 0,
      errors: [] as string[]
    };

    try {
      const activeSources = this.getActiveSources();

      for (const source of activeSources) {
        try {
          const syncResult = await this.syncSource(source);
          results.syncedSources++;
          results.totalProperties += syncResult.propertiesSynced;

          // Update last sync time
          this.updateSource(source.id, { lastSync: new Date() });
        } catch (error) {
          const errorMsg = `Failed to sync ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    results.success = results.errors.length === 0;
    return results;
  }

  // Sync data from a specific source
  private async syncSource(source: PropertySource): Promise<{ propertiesSynced: number }> {
    // In production, this would:
    // 1. Make API calls to the source
    // 2. Transform data according to mapping
    // 3. Validate data quality
    // 4. Insert/update properties in database
    // 5. Handle duplicates and conflicts

    // For now, simulate syncing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const propertiesSynced = Math.floor(Math.random() * 50) + 5;
    console.log(`Synced ${propertiesSynced} properties from ${source.name}`);

    return { propertiesSynced };
  }

  // Get integration statistics
  getIntegrationStats(): IntegrationStats {
    const activeSources = this.sources.filter(s => s.enabled).length;
    const lastSyncTime = this.sources
      .filter(s => s.lastSync)
      .sort((a, b) => (b.lastSync!.getTime() - a.lastSync!.getTime()))[0]?.lastSync || null;

    return {
      totalSources: this.sources.length,
      activeSources,
      lastSyncTime,
      totalProperties: 0, // Would be calculated from database
      newPropertiesToday: 0, // Would be calculated from recent syncs
      syncErrors: 0 // Would track recent errors
    };
  }

  // Validate data mapping
  validateMapping(sourceId: string): { valid: boolean; errors: string[] } {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source) {
      return { valid: false, errors: ['Source not found'] };
    }

    const errors: string[] = [];
    const requiredFields = ['title', 'price', 'location'];

    for (const field of requiredFields) {
      if (!source.mapping[field as keyof PropertyFieldMapping]) {
        errors.push(`Missing mapping for required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export configuration for backup
  exportConfiguration(): string {
    return JSON.stringify({
      sources: this.sources,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Import configuration
  importConfiguration(configJson: string): { success: boolean; errors: string[] } {
    try {
      const config = JSON.parse(configJson);

      if (!config.sources || !Array.isArray(config.sources)) {
        return { success: false, errors: ['Invalid configuration format'] };
      }

      // Validate each source
      const errors: string[] = [];
      for (const source of config.sources) {
        if (!source.id || !source.name) {
          errors.push(`Invalid source: ${JSON.stringify(source)}`);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      this.sources = config.sources;
      this.saveSourcesToStorage();

      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse configuration: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // Private methods
  private saveSourcesToStorage(): void {
    try {
      localStorage.setItem('guanacaste-data-sources', JSON.stringify(this.sources));
    } catch (error) {
      console.warn('Failed to save sources to storage:', error);
    }
  }

  private loadSourcesFromStorage(): void {
    try {
      const stored = localStorage.getItem('guanacaste-data-sources');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults, preferring stored sources
        const merged = this.sources.map(defaultSource => {
          const storedSource = parsed.find((s: PropertySource) => s.id === defaultSource.id);
          return storedSource || defaultSource;
        });

        // Add any new sources not in defaults
        const newSources = parsed.filter((s: PropertySource) =>
          !this.sources.find(defaultSource => defaultSource.id === s.id)
        );

        this.sources = [...merged, ...newSources];
      }
    } catch (error) {
      console.warn('Failed to load sources from storage:', error);
    }
  }
}

// Export singleton instance
export const dataIntegrationService = new DataIntegrationService();

// Export types
export type { PropertySource, PropertyFieldMapping, IntegrationStats };