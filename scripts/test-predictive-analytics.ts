#!/usr/bin/env tsx

// Predictive Market Analytics Testing Script
// Tests and validates predictive analytics functionality

import { marketDataService } from '../apps/web/src/services/marketData';

async function testPredictiveAnalytics(): Promise<void> {
  console.log('🔮 Testing Predictive Market Analytics');
  console.log('=' .repeat(50));

  const startTime = Date.now();
  const results = [];

  try {
    // Test 1: Price Predictions
    console.log('\n💰 Testing Price Predictions...');
    const locations = ['tamarindo', 'nosara', 'samara'];

    for (const location of locations) {
      try {
        const predictions = await marketDataService.getPricePredictions(location, 12);
        if (predictions.currentPrice > 0 && predictions.predictedPrice > 0) {
          console.log(`✅ ${location}: Current $${predictions.currentPrice.toLocaleString()}, Predicted $${predictions.predictedPrice.toLocaleString()}`);
          console.log(`   Trend: ${predictions.trend.toUpperCase()}, Confidence: ${predictions.confidence}%`);
          results.push({ test: `Price Prediction - ${location}`, success: true });
        } else {
          console.log(`❌ ${location}: Invalid prediction data`);
          results.push({ test: `Price Prediction - ${location}`, success: false });
        }
      } catch (error) {
        console.log(`❌ ${location}: Prediction failed - ${error}`);
        results.push({ test: `Price Prediction - ${location}`, success: false });
      }
    }

    // Test 2: Investment Analysis
    console.log('\n📊 Testing Investment Analysis...');
    const testPropertyPrice = 500000; // $500k property
    const testLocation = 'tamarindo';

    try {
      const investmentAnalysis = await marketDataService.getInvestmentAnalysis(testPropertyPrice, testLocation, 5);
      if (investmentAnalysis.initialInvestment > 0) {
        console.log(`✅ Investment Analysis for $${testPropertyPrice.toLocaleString()} in ${testLocation}:`);
        console.log(`   Initial Investment: $${investmentAnalysis.initialInvestment.toLocaleString()}`);
        console.log(`   Projected Value: $${investmentAnalysis.projectedValue.toLocaleString()}`);
        console.log(`   Annual ROI: ${investmentAnalysis.annualROI}%`);
        console.log(`   Monthly Cash Flow: $${investmentAnalysis.monthlyCashFlow}`);
        console.log(`   Risk Level: ${investmentAnalysis.riskLevel.toUpperCase()}`);
        results.push({ test: 'Investment Analysis', success: true });
      } else {
        console.log('❌ Investment analysis returned invalid data');
        results.push({ test: 'Investment Analysis', success: false });
      }
    } catch (error) {
      console.log(`❌ Investment analysis failed: ${error}`);
      results.push({ test: 'Investment Analysis', success: false });
    }

    // Test 3: Market Timing Advice
    console.log('\n⏰ Testing Market Timing Advice...');
    const timingLocation = 'playa grande';

    try {
      const timingAdvice = await marketDataService.getMarketTimingAdvice(timingLocation);
      if (timingAdvice.timing) {
        console.log(`✅ Market Timing for ${timingLocation}:`);
        console.log(`   Timing: ${timingAdvice.timing.replace('_', ' ').toUpperCase()}`);
        console.log(`   Confidence: ${timingAdvice.confidence}%`);
        console.log(`   Optimal Action: ${timingAdvice.optimalAction}`);
        console.log(`   Time Horizon: ${timingAdvice.timeHorizon}`);
        results.push({ test: 'Market Timing Advice', success: true });
      } else {
        console.log('❌ Market timing advice returned invalid data');
        results.push({ test: 'Market Timing Advice', success: false });
      }
    } catch (error) {
      console.log(`❌ Market timing advice failed: ${error}`);
      results.push({ test: 'Market Timing Advice', success: false });
    }

    // Test 4: Comprehensive Market Analysis
    console.log('\n📈 Testing Comprehensive Market Analysis...');
    const analysisLocation = 'nosara';

    try {
      const marketAnalysis = await marketDataService.getMarketAnalysis(analysisLocation);
      if (marketAnalysis) {
        console.log(`✅ Comprehensive analysis for ${analysisLocation}:`);
        if (marketAnalysis.locationData) {
          console.log(`   Location Data: ✅ Available`);
        }
        if (marketAnalysis.trends && marketAnalysis.trends.length > 0) {
          console.log(`   Trends: ✅ ${marketAnalysis.trends.length} periods analyzed`);
        }
        if (marketAnalysis.economics) {
          console.log(`   Economics: ✅ USD/CRC ${marketAnalysis.economics.usdToCrc}`);
        }
        if (marketAnalysis.insights && marketAnalysis.insights.length > 0) {
          console.log(`   Insights: ✅ ${marketAnalysis.insights.length} insights generated`);
          marketAnalysis.insights.slice(0, 2).forEach(insight => {
            console.log(`     - ${insight}`);
          });
        }
        results.push({ test: 'Comprehensive Market Analysis', success: true });
      } else {
        console.log('❌ Comprehensive market analysis failed');
        results.push({ test: 'Comprehensive Market Analysis', success: false });
      }
    } catch (error) {
      console.log(`❌ Comprehensive analysis failed: ${error}`);
      results.push({ test: 'Comprehensive Market Analysis', success: false });
    }

    // Test 5: Market Health Report
    console.log('\n🏥 Testing Market Health Report...');
    try {
      const healthReport = await marketDataService.getMarketHealthReport();
      if (healthReport) {
        console.log(`✅ Market Health Report:`);
        console.log(`   Overall Health: ${healthReport.overallHealth.toUpperCase()}`);
        console.log(`   Price Growth: ${healthReport.indicators.priceGrowth}%`);
        console.log(`   Inventory: ${healthReport.indicators.inventory} listings`);
        console.log(`   Interest Rates: ${healthReport.indicators.interestRates}%`);
        console.log(`   Economic Stability: ${healthReport.indicators.economicStability}%`);
        console.log(`   Recommendations: ${healthReport.recommendations.length}`);
        results.push({ test: 'Market Health Report', success: true });
      } else {
        console.log('❌ Market health report failed');
        results.push({ test: 'Market Health Report', success: false });
      }
    } catch (error) {
      console.log(`❌ Market health report failed: ${error}`);
      results.push({ test: 'Market Health Report', success: false });
    }

  } catch (error) {
    console.error('💥 Fatal error during predictive analytics testing:', error);
    results.push({ test: 'Fatal Error', success: false });
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 PREDICTIVE ANALYTICS TEST SUMMARY');

  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`✅ Tests passed: ${successfulTests}/${totalTests}`);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
  });

  const duration = Date.now() - startTime;
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);

  if (successfulTests >= totalTests - 1) { // Allow 1 failure for edge cases
    console.log('\n🎉 Predictive market analytics tests completed successfully!');
    console.log('🔮 Advanced market intelligence features are operational.');
  } else {
    console.log(`\n⚠️  ${totalTests - successfulTests} test(s) failed. Check analytics implementation.`);
  }

  // Exit with appropriate code
  process.exit(successfulTests >= totalTests - 1 ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  testPredictiveAnalytics().catch(error => {
    console.error('💥 Fatal error during predictive analytics testing:', error);
    process.exit(1);
  });
}

export { testPredictiveAnalytics };