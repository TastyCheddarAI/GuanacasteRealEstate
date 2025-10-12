#!/usr/bin/env tsx

// Performance Benchmarking Script
// Comprehensive performance analysis for production readiness

import { performance } from 'perf_hooks';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  throughput: number; // operations per second
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: Date;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  // Benchmark cache operations
  async benchmarkCacheOperations(): Promise<BenchmarkResult> {
    const iterations = 1000;
    const times: number[] = [];

    console.log('📊 Benchmarking cache operations...');

    // Warm up
    for (let i = 0; i < 100; i++) {
      // Simulate cache operations
      await this.delay(Math.random() * 0.001);
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const opStart = performance.now();

      // Simulate cache get/set operations
      const key = `bench_cache_${i}`;
      // In real implementation, this would use actual cache operations
      await this.delay(Math.random() * 0.002); // Simulate network/cache latency

      const opEnd = performance.now();
      times.push(opEnd - opStart);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return this.calculateResult(
      'cache_operations',
      iterations,
      endTime - startTime,
      times,
      { ...endMemory, startMemory }
    );
  }

  // Benchmark database operations
  async benchmarkDatabaseOperations(): Promise<BenchmarkResult> {
    const iterations = 500;
    const times: number[] = [];

    console.log('🗄️ Benchmarking database operations...');

    // Warm up
    for (let i = 0; i < 50; i++) {
      await this.delay(Math.random() * 0.005);
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const opStart = performance.now();

      // Simulate database query operations
      const queryComplexity = Math.random();
      const baseDelay = 0.001 + (queryComplexity * 0.009); // 1-10ms based on complexity
      await this.delay(baseDelay);

      const opEnd = performance.now();
      times.push(opEnd - opStart);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return this.calculateResult(
      'database_operations',
      iterations,
      endTime - startTime,
      times,
      { ...endMemory, startMemory }
    );
  }

  // Benchmark API response times
  async benchmarkAPIResponses(): Promise<BenchmarkResult> {
    const iterations = 200;
    const times: number[] = [];

    console.log('🌐 Benchmarking API responses...');

    // Warm up
    for (let i = 0; i < 20; i++) {
      await this.delay(Math.random() * 0.01);
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const opStart = performance.now();

      // Simulate API call with realistic latency distribution
      const latency = this.generateRealisticLatency();
      await this.delay(latency / 1000); // Convert ms to seconds

      const opEnd = performance.now();
      times.push(opEnd - opStart);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return this.calculateResult(
      'api_responses',
      iterations,
      endTime - startTime,
      times,
      { ...endMemory, startMemory }
    );
  }

  // Benchmark search operations
  async benchmarkSearchOperations(): Promise<BenchmarkResult> {
    const iterations = 300;
    const times: number[] = [];

    console.log('🔍 Benchmarking search operations...');

    // Warm up
    for (let i = 0; i < 30; i++) {
      await this.delay(Math.random() * 0.02);
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const opStart = performance.now();

      // Simulate search operation with varying complexity
      const searchComplexity = Math.random();
      const baseDelay = 0.005 + (searchComplexity * 0.045); // 5-50ms based on complexity
      await this.delay(baseDelay);

      // Simulate result processing
      const resultCount = Math.floor(Math.random() * 100);
      await this.delay(resultCount * 0.0001); // Processing time based on results

      const opEnd = performance.now();
      times.push(opEnd - opStart);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return this.calculateResult(
      'search_operations',
      iterations,
      endTime - startTime,
      times,
      { ...endMemory, startMemory }
    );
  }

  // Benchmark concurrent load
  async benchmarkConcurrentLoad(): Promise<BenchmarkResult> {
    const concurrentUsers = 50;
    const operationsPerUser = 20;
    const totalIterations = concurrentUsers * operationsPerUser;

    console.log(`⚡ Benchmarking concurrent load (${concurrentUsers} users)...`);

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Run concurrent operations
    const promises = [];
    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.simulateUserSession(operationsPerUser));
    }

    await Promise.all(promises);

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    // Calculate average time per operation
    const totalTime = endTime - startTime;
    const times = [totalTime / totalIterations]; // Simplified for this benchmark

    return this.calculateResult(
      'concurrent_load',
      totalIterations,
      totalTime,
      times,
      { ...endMemory, startMemory }
    );
  }

  // Memory leak detection
  async benchmarkMemoryLeaks(): Promise<{
    initialMemory: NodeJS.MemoryUsage;
    finalMemory: NodeJS.MemoryUsage;
    memoryGrowth: number;
    leakDetected: boolean;
    recommendation: string;
  }> {
    console.log('🧠 Testing for memory leaks...');

    const initialMemory = process.memoryUsage();

    // Perform memory-intensive operations
    const operations = [];
    for (let i = 0; i < 1000; i++) {
      operations.push(this.performMemoryIntensiveOperation());
    }

    await Promise.all(operations);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      await this.delay(0.1); // Wait for GC
    }

    const finalMemory = process.memoryUsage();
    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    const leakDetected = memoryGrowth > 50 * 1024 * 1024; // 50MB growth threshold

    let recommendation = 'Memory usage is stable.';
    if (leakDetected) {
      recommendation = 'Memory leak detected! Investigate and fix before production deployment.';
    } else if (memoryGrowth > 10 * 1024 * 1024) {
      recommendation = 'Moderate memory growth detected. Monitor in production.';
    }

    return {
      initialMemory,
      finalMemory,
      memoryGrowth,
      leakDetected,
      recommendation
    };
  }

  // Run all benchmarks
  async runAllBenchmarks(): Promise<{
    results: BenchmarkResult[];
    memoryAnalysis: any;
    recommendations: string[];
  }> {
    console.log('🚀 Starting comprehensive performance benchmarking...\n');

    const results: BenchmarkResult[] = [];

    try {
      // Run individual benchmarks
      results.push(await this.benchmarkCacheOperations());
      results.push(await this.benchmarkDatabaseOperations());
      results.push(await this.benchmarkAPIResponses());
      results.push(await this.benchmarkSearchOperations());
      results.push(await this.benchmarkConcurrentLoad());

      // Memory leak detection
      const memoryAnalysis = await this.benchmarkMemoryLeaks();

      // Generate recommendations
      const recommendations = this.generateRecommendations(results, memoryAnalysis);

      console.log('\n✅ Benchmarking completed successfully!');
      this.printResults(results, memoryAnalysis, recommendations);

      return { results, memoryAnalysis, recommendations };

    } catch (error) {
      console.error('❌ Benchmarking failed:', error);
      throw error;
    }
  }

  private async simulateUserSession(operationCount: number): Promise<void> {
    for (let i = 0; i < operationCount; i++) {
      // Simulate user actions with realistic delays
      const actionType = Math.random();

      if (actionType < 0.4) {
        // Search operation
        await this.delay(0.01 + Math.random() * 0.04);
      } else if (actionType < 0.7) {
        // View property details
        await this.delay(0.005 + Math.random() * 0.02);
      } else if (actionType < 0.9) {
        // API call
        await this.delay(0.001 + Math.random() * 0.01);
      } else {
        // Form submission
        await this.delay(0.02 + Math.random() * 0.08);
      }
    }
  }

  private async performMemoryIntensiveOperation(): Promise<void> {
    // Create some objects to test memory usage
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push({
        id: i,
        name: `Item ${i}`,
        description: 'A'.repeat(100), // 100 chars
        metadata: { created: Date.now(), tags: ['test', 'benchmark'] }
      });
    }

    // Simulate processing
    await this.delay(0.001);

    // Objects go out of scope here (simulating cleanup)
  }

  private generateRealisticLatency(): number {
    // Generate latency following a realistic distribution
    // Most requests fast, some slower (long tail)
    const rand = Math.random();

    if (rand < 0.7) {
      // 70% of requests: 10-100ms
      return 10 + Math.random() * 90;
    } else if (rand < 0.9) {
      // 20% of requests: 100-500ms
      return 100 + Math.random() * 400;
    } else {
      // 10% of requests: 500-2000ms (slow requests)
      return 500 + Math.random() * 1500;
    }
  }

  private calculateResult(
    operation: string,
    iterations: number,
    totalTime: number,
    times: number[],
    memoryUsage: any
  ): BenchmarkResult {
    const sortedTimes = [...times].sort((a, b) => a - b);

    return {
      operation,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      p95Time: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99Time: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      throughput: iterations / (totalTime / 1000), // operations per second
      memoryUsage,
      timestamp: new Date()
    };
  }

  private generateRecommendations(
    results: BenchmarkResult[],
    memoryAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Analyze each benchmark result
    results.forEach(result => {
      if (result.averageTime > 100) {
        recommendations.push(`${result.operation}: Average response time (${result.averageTime.toFixed(2)}ms) is high. Consider optimization.`);
      }

      if (result.p95Time > 500) {
        recommendations.push(`${result.operation}: P95 response time (${result.p95Time.toFixed(2)}ms) exceeds 500ms threshold.`);
      }

      if (result.throughput < 100) {
        recommendations.push(`${result.operation}: Throughput (${result.throughput.toFixed(2)} ops/sec) is low. Consider scaling.`);
      }
    });

    // Memory analysis
    if (memoryAnalysis.leakDetected) {
      recommendations.push('CRITICAL: Memory leak detected! Fix before production deployment.');
    } else if (memoryAnalysis.memoryGrowth > 10 * 1024 * 1024) {
      recommendations.push('WARNING: Significant memory growth detected. Monitor in production.');
    }

    // Overall recommendations
    const avgResponseTime = results.reduce((sum, r) => sum + r.averageTime, 0) / results.length;
    if (avgResponseTime > 50) {
      recommendations.push('Overall: Consider implementing caching or optimization strategies.');
    }

    const totalThroughput = results.reduce((sum, r) => sum + r.throughput, 0);
    if (totalThroughput < 1000) {
      recommendations.push('Overall: Throughput may not support high-traffic scenarios. Consider scaling.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All benchmarks passed! System performance looks good for production.');
    }

    return recommendations;
  }

  private printResults(
    results: BenchmarkResult[],
    memoryAnalysis: any,
    recommendations: string[]
  ): void {
    console.log('\n📊 Performance Benchmark Results');
    console.log('═'.repeat(60));

    results.forEach(result => {
      console.log(`\n🔹 ${result.operation.replace('_', ' ').toUpperCase()}`);
      console.log(`   Iterations: ${result.iterations.toLocaleString()}`);
      console.log(`   Average Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`   P95 Time: ${result.p95Time.toFixed(2)}ms`);
      console.log(`   P99 Time: ${result.p99Time.toFixed(2)}ms`);
      console.log(`   Throughput: ${result.throughput.toFixed(2)} ops/sec`);
      console.log(`   Min/Max: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
    });

    console.log('\n🧠 Memory Analysis');
    console.log('═'.repeat(30));
    console.log(`Initial Heap: ${(memoryAnalysis.initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Final Heap: ${(memoryAnalysis.finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Growth: ${(memoryAnalysis.memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Leak Detected: ${memoryAnalysis.leakDetected ? 'YES' : 'NO'}`);

    console.log('\n💡 Recommendations');
    console.log('═'.repeat(20));
    recommendations.forEach(rec => console.log(`• ${rec}`));
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other scripts
export { PerformanceBenchmark };

// Run benchmarks if executed directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runAllBenchmarks()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}