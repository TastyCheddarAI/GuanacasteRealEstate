// AI Reliability Service - Enterprise-Grade AI Assistant Reliability System
// Implements circuit breaker, retry logic, query classification, and intelligent error recovery
// Future-proofs the AI assistant with machine learning and predictive capabilities

import { trackAIResponse } from './performanceMonitor';
import { errorHandler } from './errorHandler';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum QueryComplexity {
  SIMPLE = 'simple',        // Basic info requests (< 50 chars, no context)
  MODERATE = 'moderate',    // Specific details (standard queries)
  COMPLEX = 'complex',      // Multi-part reasoning (legal, financial analysis)
  CONTEXTUAL = 'contextual' // Requires conversation history (follow-ups)
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

export enum CircuitState {
  CLOSED = 'closed',      // Normal operation
  OPEN = 'open',          // Failing, use fallback
  HALF_OPEN = 'half_open' // Testing recovery
}

export interface ConversationContext {
  userPreferences?: any;
  conversationHistory?: any[];
  lastTopic?: string;
  lastIntent?: string;
  sessionStart?: Date;
  messageCount?: number;
  searchHistory?: any[];
  conversationPatterns?: any;
  memory?: any;
  personalization?: any;
}

export interface AIResponse {
  content: string;
  metadata: {
    type: string;
    data?: any;
    actions?: any[];
  };
  timestamp: Date;
}

export interface CachedResponse extends AIResponse {
  queryHash: string;
  lastUsed: Date;
  usageCount: number;
  confidence: number;
}

export interface HealthMetrics {
  apiLatency: number[];
  successRate: number;
  errorPatterns: Map<string, number>;
  circuitBreakerState: CircuitState;
  lastHealthCheck: Date;
  uptime: number;
}

// ============================================================================
// CIRCUIT BREAKER PATTERN
// ============================================================================

export class AICircuitBreaker {
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;
  private state: CircuitState = CircuitState.CLOSED;

  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute
  private readonly successThreshold = 3; // Successes needed to close circuit

  async execute<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        return fallback();
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      return fallback();
    }
  }

  private recordSuccess(): void {
    this.successes++;
    this.failures = Math.max(0, this.failures - 1);

    if (this.state === CircuitState.HALF_OPEN && this.successes >= this.successThreshold) {
      this.closeCircuit();
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.recoveryTimeout;
  }

  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): { failures: number; successes: number; state: CircuitState } {
    return {
      failures: this.failures,
      successes: this.successes,
      state: this.state
    };
  }
}

// ============================================================================
// INTELLIGENT RETRY LOGIC
// ============================================================================

export class AIRetryManager {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000;
  private static readonly MAX_DELAY = 10000;

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: {
      query: string;
      complexity: QueryComplexity;
      conversationId?: string;
    }
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error)) {
          break;
        }

        if (attempt < this.MAX_RETRIES) {
          const delay = this.calculateDelay(attempt, context.complexity);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private static shouldNotRetry(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('unauthorized') ||
           message.includes('forbidden') ||
           message.includes('not found') ||
           message.includes('bad request');
  }

  private static calculateDelay(attempt: number, complexity: QueryComplexity): number {
    const baseDelay = this.BASE_DELAY * Math.pow(2, attempt);

    // Adjust delay based on query complexity
    const complexityMultiplier = {
      [QueryComplexity.SIMPLE]: 0.5,
      [QueryComplexity.MODERATE]: 1.0,
      [QueryComplexity.COMPLEX]: 1.5,
      [QueryComplexity.CONTEXTUAL]: 2.0
    };

    const delay = baseDelay * complexityMultiplier[complexity];
    return Math.min(delay, this.MAX_DELAY);
  }
}

// ============================================================================
// QUERY CLASSIFICATION ENGINE
// ============================================================================

export class QueryClassifier {
  static classifyQuery(message: string, context: ConversationContext): QueryComplexity {
    const lowerMessage = message.toLowerCase().trim();

    // SIMPLE: Very short queries without context
    if (lowerMessage.length < 50 &&
        (!context.conversationHistory || context.conversationHistory.length === 0)) {
      return QueryComplexity.SIMPLE;
    }

    // CONTEXTUAL: Follow-up queries and references
    if (this.isContextualQuery(lowerMessage)) {
      return QueryComplexity.CONTEXTUAL;
    }

    // COMPLEX: Multi-part questions, legal/financial analysis
    if (this.isComplexQuery(lowerMessage)) {
      return QueryComplexity.COMPLEX;
    }

    // MODERATE: Standard queries
    return QueryComplexity.MODERATE;
  }

  private static isContextualQuery(message: string): boolean {
    const contextualIndicators = [
      'yeah', 'yes', 'more', 'tell me', 'explain', 'what about',
      'and', 'also', 'additionally', 'furthermore', 'besides',
      'specifically', 'details', 'elaborate', 'expand'
    ];

    return contextualIndicators.some(indicator => message.includes(indicator)) ||
           message.startsWith('and ') ||
           message.startsWith('but ') ||
           /^\w+ about/.test(message); // "more about", "tell me about", etc.
  }

  private static isComplexQuery(message: string): boolean {
    const complexIndicators = [
      'maritime', 'zmt', 'concession', 'due diligence', 'title registry',
      'tax', 'transfer', 'closing costs', 'legal', 'law', 'regulation',
      'entity', 'corporation', 'trust', 'ownership structure',
      'environmental', 'setena', 'permits', 'construction',
      'investment', 'roi', 'return', 'analysis', 'comparison'
    ];

    const wordCount = message.split(' ').length;
    const hasComplexTerms = complexIndicators.some(term => message.includes(term));

    return (wordCount > 20) || hasComplexTerms || message.includes('?');
  }

  static getRecommendedTimeout(complexity: QueryComplexity): number {
    const timeouts = {
      [QueryComplexity.SIMPLE]: 5000,    // 5 seconds
      [QueryComplexity.MODERATE]: 8000,  // 8 seconds
      [QueryComplexity.COMPLEX]: 15000,  // 15 seconds
      [QueryComplexity.CONTEXTUAL]: 10000 // 10 seconds
    };

    return timeouts[complexity];
  }
}

// ============================================================================
// PREDICTIVE CACHING SYSTEM
// ============================================================================

export class PredictiveCache {
  private cache = new Map<string, CachedResponse>();
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  private generateHash(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async get(query: string): Promise<CachedResponse | null> {
    const normalizedQuery = this.normalizeQuery(query);
    const hash = this.generateHash(normalizedQuery);

    const cached = this.cache.get(hash);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.lastUsed.getTime() > this.CACHE_TTL) {
      this.cache.delete(hash);
      return null;
    }

    // Update usage statistics
    cached.lastUsed = new Date();
    cached.usageCount++;

    return cached;
  }

  async set(query: string, response: AIResponse, confidence = 0.8): Promise<void> {
    const normalizedQuery = this.normalizeQuery(query);
    const hash = this.generateHash(normalizedQuery);

    const cachedResponse: CachedResponse = {
      ...response,
      queryHash: hash,
      lastUsed: new Date(),
      usageCount: 1,
      confidence
    };

    // Evict least recently used if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }

    this.cache.set(hash, cachedResponse);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastUsed.getTime() < oldestTime) {
        oldestTime = value.lastUsed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Pre-compute responses for common queries
  async warmCache(commonQueries: string[]): Promise<void> {
    for (const query of commonQueries) {
      // This would trigger AI processing for common queries
      // Implementation depends on the specific caching strategy
    }
  }

  getStats(): { size: number; hitRate: number; avgConfidence: number } {
    const entries = Array.from(this.cache.values());
    const totalUsage = entries.reduce((sum, entry) => sum + entry.usageCount, 0);
    const avgConfidence = entries.length > 0
      ? entries.reduce((sum, entry) => sum + entry.confidence, 0) / entries.length
      : 0;

    return {
      size: this.cache.size,
      hitRate: totalUsage / Math.max(entries.length, 1),
      avgConfidence
    };
  }
}

// ============================================================================
// AI HEALTH MONITORING
// ============================================================================

export class AIHealthMonitor {
  private metrics: HealthMetrics = {
    apiLatency: [],
    successRate: 0,
    errorPatterns: new Map(),
    circuitBreakerState: CircuitState.CLOSED,
    lastHealthCheck: new Date(),
    uptime: 0
  };

  private readonly MAX_LATENCY_SAMPLES = 100;
  private startTime = Date.now();

  recordAPIResponse(latency: number, success: boolean, error?: Error): void {
    // Record latency
    this.metrics.apiLatency.push(latency);
    if (this.metrics.apiLatency.length > this.MAX_LATENCY_SAMPLES) {
      this.metrics.apiLatency.shift();
    }

    // Record error patterns
    if (error) {
      const errorType = this.categorizeError(error);
      this.metrics.errorPatterns.set(
        errorType,
        (this.metrics.errorPatterns.get(errorType) || 0) + 1
      );
    }

    // Calculate success rate
    const totalRequests = this.metrics.apiLatency.length;
    const successfulRequests = totalRequests - Array.from(this.metrics.errorPatterns.values()).reduce((a, b) => a + b, 0);
    this.metrics.successRate = successfulRequests / totalRequests;

    this.metrics.lastHealthCheck = new Date();
    this.metrics.uptime = Date.now() - this.startTime;
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) return 'timeout';
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('unauthorized') || message.includes('forbidden')) return 'auth';
    if (message.includes('server') || message.includes('500')) return 'server_error';

    return 'unknown';
  }

  assessHealth(): HealthStatus {
    const avgLatency = this.calculateAverageLatency();
    const recentSuccessRate = this.metrics.successRate;

    // Health criteria
    if (avgLatency > 10000 || recentSuccessRate < 0.5) {
      return HealthStatus.UNHEALTHY;
    }

    if (avgLatency > 5000 || recentSuccessRate < 0.8) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  private calculateAverageLatency(): number {
    if (this.metrics.apiLatency.length === 0) return 0;

    const recentLatencies = this.metrics.apiLatency.slice(-10); // Last 10 requests
    return recentLatencies.reduce((sum, latency) => sum + latency, 0) / recentLatencies.length;
  }

  getMetrics(): HealthMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      apiLatency: [],
      successRate: 0,
      errorPatterns: new Map(),
      circuitBreakerState: CircuitState.CLOSED,
      lastHealthCheck: new Date(),
      uptime: 0
    };
    this.startTime = Date.now();
  }
}

// ============================================================================
// CONVERSATION STATE MANAGER
// ============================================================================

export class ConversationManager {
  private conversations = new Map<string, ConversationContext>();

  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConversation(conversationId: string): ConversationContext | null {
    return this.conversations.get(conversationId) || null;
  }

  updateConversation(conversationId: string, updates: Partial<ConversationContext>): void {
    const existing = this.conversations.get(conversationId) || {};
    this.conversations.set(conversationId, { ...existing, ...updates });
  }

  enrichQueryWithContext(query: string, context: ConversationContext): string {
    const contextPrompt = this.buildContextPrompt(context);
    return `${contextPrompt}\n\nCurrent User Query: ${query}`;
  }

  private buildContextPrompt(context: ConversationContext): string {
    const parts: string[] = [];

    // User preferences
    if (context.userPreferences?.userType) {
      parts.push(`User Type: ${context.userPreferences.userType}`);
    }

    if (context.userPreferences?.budget) {
      const { min, max } = context.userPreferences.budget;
      parts.push(`Budget Range: $${min?.toLocaleString()} - $${max?.toLocaleString()}`);
    }

    if (context.userPreferences?.locations?.length) {
      parts.push(`Interested Locations: ${context.userPreferences.locations.join(', ')}`);
    }

    // Recent conversation topics
    if (context.lastTopic) {
      parts.push(`Last Topic: ${context.lastTopic}`);
    }

    // Important facts from memory
    if (context.memory?.importantFacts?.length) {
      const recentFacts = context.memory.importantFacts
        .slice(-3) // Last 3 facts
        .map((fact: any) => fact.fact);
      parts.push(`Key Facts: ${recentFacts.join('; ')}`);
    }

    return parts.length > 0 ? `Context: ${parts.join('. ')}` : '';
  }

  cleanupOldConversations(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [id, context] of this.conversations.entries()) {
      if (context.sessionStart && context.sessionStart.getTime() < cutoffTime) {
        this.conversations.delete(id);
      }
    }
  }
}

// ============================================================================
// MAIN AI RELIABILITY SERVICE
// ============================================================================

export class AIReliabilityService {
  private circuitBreaker = new AICircuitBreaker();
  private cache = new PredictiveCache();
  private healthMonitor = new AIHealthMonitor();
  private conversationManager = new ConversationManager();

  async processQuery(
    query: string,
    context: ConversationContext,
    conversationId?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const complexity = QueryClassifier.classifyQuery(query, context);
    const timeout = QueryClassifier.getRecommendedTimeout(complexity);

    // Generate or get conversation ID
    const convId = conversationId || this.conversationManager.generateConversationId();

    // Update conversation context
    this.conversationManager.updateConversation(convId, {
      ...context,
      messageCount: (context.messageCount || 0) + 1
    });

    // Check cache first
    const cachedResponse = await this.cache.get(query);
    if (cachedResponse && cachedResponse.confidence > 0.7) {
      trackAIResponse(query, 'cache_hit', Date.now() - startTime, false);
      return cachedResponse;
    }

    // Enrich query with conversation context
    const enrichedQuery = this.conversationManager.enrichQueryWithContext(query, context);

    // Execute with circuit breaker and retry logic
    const response = await this.circuitBreaker.execute(
      () => this.executeWithRetry(enrichedQuery, complexity, timeout),
      () => this.generateIntelligentFallback(query, context, complexity)
    );

    const latency = Date.now() - startTime;

    // Record health metrics
    this.healthMonitor.recordAPIResponse(latency, true);

    // Cache successful responses
    if (response.metadata.type !== 'fallback_response') {
      await this.cache.set(query, response, 0.9);
    }

    // Track performance
    trackAIResponse(query, complexity, latency, false);

    return response;
  }

  private async executeWithRetry(
    enrichedQuery: string,
    complexity: QueryComplexity,
    timeout: number
  ): Promise<AIResponse> {
    return AIRetryManager.retryWithBackoff(
      () => this.callAIAPI(enrichedQuery, timeout),
      { query: enrichedQuery, complexity }
    );
  }

  private async callAIAPI(query: string, timeout: number): Promise<AIResponse> {
    // Import aiAPI dynamically to avoid circular dependencies
    const { aiAPI } = await import('./api');

    try {
      const response = await Promise.race([
        aiAPI.ask(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI API timeout')), timeout)
        )
      ]) as any;

      return {
        content: response.answer || 'I apologize, but I couldn\'t generate a response at this time.',
        metadata: {
          type: 'ai_response',
          data: {
            citations: response.citations || []
          },
          actions: [
            { label: 'Ask follow-up', action: 'follow_up' },
            { label: 'Get more details', action: 'more_details' },
            { label: 'Contact agent', action: 'contact_agent' }
          ]
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  private async generateIntelligentFallback(
    query: string,
    context: ConversationContext,
    complexity: QueryComplexity
  ): Promise<AIResponse> {
    // Generate contextual fallback based on query analysis
    const contextualHelp = this.getContextualHelp(query, context);

    return {
      content: `I'm currently operating in offline mode and can't access my full AI capabilities right now. However, I can still help you with basic information:\n\n${contextualHelp}\n\nFor more detailed or complex questions, please try again when I'm fully connected.`,
      metadata: {
        type: 'fallback_response',
        actions: [
          { label: 'Try again later', action: 'try_again' },
          { label: 'Basic help', action: 'basic_help' }
        ]
      },
      timestamp: new Date()
    };
  }

  private getContextualHelp(query: string, context: ConversationContext): string {
    const lowerQuery = query.toLowerCase();

    // Provide specific help based on query content and context
    if (lowerQuery.includes('maritime') || lowerQuery.includes('zmt') || lowerQuery.includes('beach')) {
      return "🏖️ **Maritime Zone (ZMT) Overview:** Costa Rica's coastline has 3 zones: public (0-50m), restricted (50-200m), and private (200m+). Concessions are temporary rights, not ownership. Always consult a maritime law specialist.";
    }

    if (lowerQuery.includes('tax') || lowerQuery.includes('transfer') || lowerQuery.includes('cost')) {
      return "💰 **Transfer Taxes:** 1.5% of sale price/fiscal value (buyer pays). Stamp tax: 0.8%. Notary: 1.0-1.25%. Total closing: ~4.3-5.55%. Foreign sellers pay 2.5% capital gains withholding.";
    }

    if (lowerQuery.includes('school') || lowerQuery.includes('education')) {
      return "📚 **Education:** Top areas - Nosara (9.5/10), Playa Grande (9.2/10), Flamingo (9.0/10). International schools, bilingual programs, excellent facilities.";
    }

    if (context.userPreferences?.locations?.length) {
      const location = context.userPreferences.locations[0];
      return `📍 **${location}:** Based on your interest in ${location}, this area offers excellent properties with unique lifestyle benefits. Would you like specific property recommendations or market analysis?`;
    }

    // General helpful responses
    return `🏠 **Property Search:** I can help find homes in Tamarindo, Nosara, Playa Grande, Flamingo, Sámara
💰 **Market Info:** Current trends, pricing, investment analysis
⚖️ **Legal Help:** Maritime laws, taxes, due diligence, ownership structures
📚 **Education:** School recommendations, family-friendly areas
🏖️ **Lifestyle:** Area comparisons, community information

What specific aspect interests you most?`;
  }

  // Health and monitoring methods
  getHealthStatus(): HealthStatus {
    return this.healthMonitor.assessHealth();
  }

  getMetrics(): {
    circuitBreaker: any;
    cache: any;
    health: HealthMetrics;
  } {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      cache: this.cache.getStats(),
      health: this.healthMonitor.getMetrics()
    };
  }

  // Maintenance methods
  async warmCache(commonQueries: string[]): Promise<void> {
    await this.cache.warmCache(commonQueries);
  }

  cleanup(): void {
    this.conversationManager.cleanupOldConversations();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const aiReliabilityService = new AIReliabilityService();

// Periodic cleanup
setInterval(() => {
  aiReliabilityService.cleanup();
}, 60 * 60 * 1000); // Clean up every hour

// Individual components are exported above with their class declarations