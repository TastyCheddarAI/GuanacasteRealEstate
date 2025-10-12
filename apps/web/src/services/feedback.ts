// User Feedback and Learning Service
// Collects user feedback to improve AI responses over time

interface UserFeedback {
  messageId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  query: string;
  response: string;
  intent?: string;
  helpful: boolean;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  helpfulPercentage: number;
  commonIssues: string[];
  improvementSuggestions: string[];
}

class FeedbackService {
  private feedback: UserFeedback[] = [];
  private readonly STORAGE_KEY = 'guanacaste-ai-feedback';
  private readonly MAX_FEEDBACK = 1000; // Limit stored feedback

  constructor() {
    this.loadFeedback();
  }

  // Submit feedback for a message
  submitFeedback(
    messageId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    helpful: boolean,
    comment?: string,
    query?: string,
    response?: string,
    intent?: string
  ): void {
    const feedback: UserFeedback = {
      messageId,
      rating,
      comment,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      query: query || '',
      response: response || '',
      intent,
      helpful
    };

    this.feedback.push(feedback);

    // Keep only recent feedback
    if (this.feedback.length > this.MAX_FEEDBACK) {
      this.feedback = this.feedback.slice(-this.MAX_FEEDBACK);
    }

    this.saveFeedback();

    // Log for analytics (in production, send to analytics service)
    console.log('Feedback received:', {
      rating,
      helpful,
      intent,
      comment: comment?.substring(0, 100)
    });
  }

  // Quick feedback submission (helpful/not helpful)
  submitQuickFeedback(messageId: string, helpful: boolean, query?: string, response?: string): void {
    this.submitFeedback(messageId, helpful ? 5 : 2, helpful, undefined, query, response);
  }

  // Get feedback statistics
  getFeedbackStats(): FeedbackStats {
    if (this.feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        helpfulPercentage: 0,
        commonIssues: [],
        improvementSuggestions: []
      };
    }

    const totalFeedback = this.feedback.length;
    const averageRating = this.feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
    const helpfulCount = this.feedback.filter(f => f.helpful).length;
    const helpfulPercentage = (helpfulCount / totalFeedback) * 100;

    // Analyze common issues from low ratings
    const lowRatingFeedback = this.feedback.filter(f => f.rating <= 2);
    const commonIssues = this.analyzeCommonIssues(lowRatingFeedback);

    // Generate improvement suggestions
    const improvementSuggestions = this.generateImprovementSuggestions();

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      helpfulPercentage: Math.round(helpfulPercentage),
      commonIssues,
      improvementSuggestions
    };
  }

  // Get feedback for a specific message
  getFeedbackForMessage(messageId: string): UserFeedback | null {
    return this.feedback.find(f => f.messageId === messageId) || null;
  }

  // Get recent feedback
  getRecentFeedback(limit: number = 10): UserFeedback[] {
    return this.feedback.slice(-limit);
  }

  // Analyze common issues from feedback
  private analyzeCommonIssues(feedback: UserFeedback[]): string[] {
    const issues: string[] = [];

    // Count issues mentioned in comments
    const issueCounts: Record<string, number> = {};

    feedback.forEach(f => {
      if (f.comment) {
        const comment = f.comment.toLowerCase();

        // Categorize common issues
        if (comment.includes('wrong') || comment.includes('incorrect') || comment.includes('inaccurate')) {
          issueCounts.inaccurate = (issueCounts.inaccurate || 0) + 1;
        }
        if (comment.includes('slow') || comment.includes('wait')) {
          issueCounts.slow = (issueCounts.slow || 0) + 1;
        }
        if (comment.includes('confusing') || comment.includes('unclear')) {
          issueCounts.confusing = (issueCounts.confusing || 0) + 1;
        }
        if (comment.includes('missing') || comment.includes('incomplete')) {
          issueCounts.incomplete = (issueCounts.incomplete || 0) + 1;
        }
        if (comment.includes('property') && (comment.includes('not found') || comment.includes('no results'))) {
          issueCounts.no_properties = (issueCounts.no_properties || 0) + 1;
        }
      }
    });

    // Convert to sorted array
    const sortedIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => {
        const labels: Record<string, string> = {
          inaccurate: 'Inaccurate information',
          slow: 'Slow response times',
          confusing: 'Confusing responses',
          incomplete: 'Incomplete answers',
          no_properties: 'No property results found'
        };
        return `${labels[issue] || issue} (${count} reports)`;
      });

    return sortedIssues;
  }

  // Generate improvement suggestions based on feedback
  private generateImprovementSuggestions(): string[] {
    const stats = this.getFeedbackStats();
    const suggestions: string[] = [];

    if (stats.averageRating < 3.5) {
      suggestions.push('Improve overall response quality and accuracy');
    }

    if (stats.helpfulPercentage < 70) {
      suggestions.push('Focus on providing more actionable and helpful responses');
    }

    // Add intent-specific suggestions
    const intentFeedback = this.feedback.filter(f => f.intent);
    const intentStats: Record<string, { total: number, helpful: number }> = {};

    intentFeedback.forEach(f => {
      if (f.intent) {
        if (!intentStats[f.intent]) {
          intentStats[f.intent] = { total: 0, helpful: 0 };
        }
        intentStats[f.intent].total++;
        if (f.helpful) {
          intentStats[f.intent].helpful++;
        }
      }
    });

    Object.entries(intentStats).forEach(([intent, stats]) => {
      const helpfulRate = (stats.helpful / stats.total) * 100;
      if (helpfulRate < 60) {
        suggestions.push(`Improve ${intent.replace('_', ' ')} responses (${Math.round(helpfulRate)}% helpful)`);
      }
    });

    // Add general suggestions
    if (this.feedback.length > 50) {
      suggestions.push('Consider A/B testing different response formats');
      suggestions.push('Implement user preference learning for personalized responses');
    }

    return suggestions.slice(0, 5); // Limit to top 5
  }

  // Export feedback data (for analytics)
  exportFeedback(): UserFeedback[] {
    return [...this.feedback];
  }

  // Clear old feedback (keep recent only)
  clearOldFeedback(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.feedback = this.feedback.filter(f => f.timestamp >= cutoffDate);
    this.saveFeedback();
  }

  // Private methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('guanacaste-session-id');
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
      sessionStorage.setItem('guanacaste-session-id', sessionId);
    }
    return sessionId;
  }

  private loadFeedback(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.feedback = parsed.map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load feedback:', error);
      this.feedback = [];
    }
  }

  private saveFeedback(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feedback));
    } catch (error) {
      console.warn('Failed to save feedback:', error);
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();

// Export types
export type { UserFeedback, FeedbackStats };