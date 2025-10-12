#!/usr/bin/env tsx

// Property Data Ingestion Script
// Runs the property data pipeline to ingest real estate data

import { propertyDataPipeline } from '../apps/web/src/services/propertyData';

async function runPropertyIngestion(): Promise<void> {
  console.log('🚀 Starting Property Data Ingestion Pipeline');
  console.log('=' .repeat(50));

  const startTime = Date.now();
  const results = [];

  // Get available sources
  const stats = propertyDataPipeline.getStats();
  console.log(`📊 Available data sources: ${stats.sources.length}`);

  // Enable sources for ingestion (in production, these would be enabled based on API access)
  const sourcesToIngest = ['ccbr', 'mls_cr', 'local_brokers']; // Skip bccr for now (requires special access)

  for (const sourceId of sourcesToIngest) {
    console.log(`\n🔄 Ingesting from ${sourceId}...`);

    try {
      const result = await propertyDataPipeline.ingestFromSource(sourceId);

      if (result.success) {
        console.log(`✅ ${sourceId}: ${result.propertiesIngested} properties ingested`);

        if (result.errors.length > 0) {
          console.log(`⚠️  ${result.errors.length} errors encountered:`);
          result.errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
          if (result.errors.length > 5) {
            console.log(`   ... and ${result.errors.length - 5} more`);
          }
        }
      } else {
        console.log(`❌ ${sourceId}: Ingestion failed`);
        result.errors.forEach(error => console.log(`   - ${error}`));
      }

      results.push({ sourceId, ...result });
    } catch (error) {
      console.error(`💥 ${sourceId}: Unexpected error - ${error}`);
      results.push({
        sourceId,
        success: false,
        propertiesIngested: 0,
        errors: [`Unexpected error: ${error}`]
      });
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📈 INGESTION SUMMARY');

  const totalIngested = results.reduce((sum, r) => sum + r.propertiesIngested, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const successfulSources = results.filter(r => r.success).length;

  console.log(`✅ Sources processed: ${results.length}`);
  console.log(`✅ Successful sources: ${successfulSources}`);
  console.log(`🏠 Properties ingested: ${totalIngested}`);
  console.log(`⚠️  Total errors: ${totalErrors}`);

  const duration = Date.now() - startTime;
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);

  // Cache statistics
  const finalStats = propertyDataPipeline.getStats();
  console.log(`💾 Cache entries: ${finalStats.cacheSize}`);

  if (totalIngested > 0) {
    console.log('\n🎉 Property data ingestion completed successfully!');
  } else {
    console.log('\n⚠️  No properties were ingested. Check source configurations.');
  }

  // Exit with appropriate code
  process.exit(totalIngested > 0 ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  runPropertyIngestion().catch(error => {
    console.error('💥 Fatal error during property ingestion:', error);
    process.exit(1);
  });
}

export { runPropertyIngestion };