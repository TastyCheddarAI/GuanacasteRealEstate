#!/usr/bin/env tsx

// Market Data Integration Testing Script
// Tests and validates market data API integrations

import { marketDataService } from '../apps/web/src/services/marketData';

async function testMarketDataIntegration(): Promise<void> {
  console.log('🧪 Testing Market Data Integration');
  console.log('=' .repeat(50));

  const startTime = Date.now();
  const results = [];

  try {
    // Test 1: Economic Indicators
    console.log('\n📊 Testing Economic Indicators...');
    const economics = await marketDataService.getEconomicIndicators();
    if (economics) {
      console.log(`✅ USD/CRC Rate: ${economics.usdToCrc}`);
      console.log(`✅ Interest Rate: ${economics.interestRate}%`);
      console.log(`✅ Inflation Rate: ${economics.inflation}%`);
      console.log(`📅 Last Updated: ${new Date(economics.lastUpdated).toLocaleString()}`);
      results.push({ test: 'Economic Indicators', success: true });
    } else {
      console.log('❌ Failed to fetch economic indicators');
      results.push({ test: 'Economic Indicators', success: false });
    }

    // Test 2: Market Data for Popular Locations
    const locations = ['tamarindo', 'nosara', 'samara', 'playa grande'];

    for (const location of locations) {
      console.log(`\n🏠 Testing Market Data for ${location}...`);
      const marketData = await marketDataService.getMarketData(location);

      if (marketData) {
        console.log(`✅ Average Price: $${marketData.averagePrice.toLocaleString()}`);
        console.log(`✅ Price Change: ${marketData.priceChange}%`);
        console.log(`✅ Inventory: ${marketData.inventoryCount} properties`);
        console.log(`✅ Days on Market: ${marketData.daysOnMarket}`);
        results.push({ test: `Market Data - ${location}`, success: true });
      } else {
        console.log(`❌ Failed to fetch market data for ${location}`);
        results.push({ test: `Market Data - ${location}`, success: false });
      }
    }

    // Test 3: Market Trends
    console.log('\n📈 Testing Market Trends...');
    const trends = await marketDataService.getMarketTrends();
    if (trends && trends.length > 0) {
      console.log('✅ Market trends data retrieved:');
      trends.forEach(trend => {
        console.log(`   ${trend.period}: ${trend.priceChange}% price change, ${trend.volumeChange}% volume change`);
      });
      results.push({ test: 'Market Trends', success: true });
    } else {
      console.log('❌ Failed to fetch market trends');
      results.push({ test: 'Market Trends', success: false });
    }

    // Test 4: Market Analysis
    console.log('\n🔍 Testing Market Analysis...');
    const analysis = await marketDataService.getMarketAnalysis('tamarindo');
    if (analysis) {
      console.log('✅ Market analysis generated:');
      if (analysis.locationData) {
        console.log(`   Location: ${analysis.locationData.location}`);
        console.log(`   Average Price: $${analysis.locationData.averagePrice.toLocaleString()}`);
      }
      console.log(`   Insights: ${analysis.insights.length} generated`);
      analysis.insights.forEach(insight => console.log(`   - ${insight}`));
      results.push({ test: 'Market Analysis', success: true });
    } else {
      console.log('❌ Failed to generate market analysis');
      results.push({ test: 'Market Analysis', success: false });
    }

    // Test 5: Market Health Report
    console.log('\n🏥 Testing Market Health Report...');
    const healthReport = await marketDataService.getMarketHealthReport();
    if (healthReport) {
      console.log(`✅ Overall Market Health: ${healthReport.overallHealth.toUpperCase()}`);
      console.log(`📊 Indicators:`);
      console.log(`   - Price Growth: ${healthReport.indicators.priceGrowth}%`);
      console.log(`   - Inventory: ${healthReport.indicators.inventory} listings`);
      console.log(`   - Interest Rates: ${healthReport.indicators.interestRates}%`);
      console.log(`   - Economic Stability: ${healthReport.indicators.economicStability}%`);
      console.log(`💡 Recommendations:`);
      healthReport.recommendations.forEach(rec => console.log(`   - ${rec}`));
      results.push({ test: 'Market Health Report', success: true });
    } else {
      console.log('❌ Failed to generate market health report');
      results.push({ test: 'Market Health Report', success: false });
    }

    // Test 6: Cache Performance
    console.log('\n💾 Testing Cache Performance...');
    const cacheStats = marketDataService.getCacheStats();
    console.log(`✅ Cache entries: ${cacheStats.entries}`);
    console.log(`📊 Hit rate: ${(cacheStats.metrics.hitRate * 100).toFixed(1)}%`);
    console.log(`⏱️  Avg access time: ${cacheStats.metrics.avgAccessTime.toFixed(2)}ms`);

    // Test cache clearing
    marketDataService.clearCache();
    const clearedStats = marketDataService.getCacheStats();
    console.log(`🧹 Cache cleared: ${clearedStats.entries} entries remaining`);
    results.push({ test: 'Cache Performance', success: true });

  } catch (error) {
    console.error('💥 Fatal error during market data testing:', error);
    results.push({ test: 'Fatal Error', success: false });
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 MARKET DATA INTEGRATION TEST SUMMARY');

  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`✅ Tests passed: ${successfulTests}/${totalTests}`);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
  });

  const duration = Date.now() - startTime;
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);

  if (successfulTests === totalTests) {
    console.log('\n🎉 All market data integration tests passed!');
  } else {
    console.log(`\n⚠️  ${totalTests - successfulTests} test(s) failed. Check API configurations.`);
  }

  // Exit with appropriate code
  process.exit(successfulTests === totalTests ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  testMarketDataIntegration().catch(error => {
    console.error('💥 Fatal error during market data testing:', error);
    process.exit(1);
  });
}

export { testMarketDataIntegration };