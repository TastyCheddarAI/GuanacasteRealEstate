// Advanced Property Recommendations Service
// AI-powered property matching and recommendations

import { marketDataService } from './marketData';
import { propertiesAPI } from './api';

export interface UserPreferences {
  budget?: {
    min: number;
    max: number;
  };
  locations?: string[];
  propertyTypes?: string[];
  beds?: number;
  baths?: number;
  priorities?: string[];
  userType?: 'buyer' | 'investor' | 'relocator';
  timeline?: string;
  familySize?: number;
  children?: number;
  schoolPriority?: boolean;
  expatCommunity?: boolean;
  investmentFocus?: boolean;
}

export interface PropertyScore {
  propertyId: string;
  overallScore: number; // 0-100
  factors: {
    budgetFit: number;
    locationMatch: number;
    propertyTypeFit: number;
    marketPotential: number;
    lifestyleMatch: number;
    investmentPotential: number;
  };
  reasoning: string[];
  recommendations: string[];
}

export interface RecommendationResult {
  topMatches: PropertyScore[];
  marketInsights: string[];
  alternativeOptions: PropertyScore[];
  nextSteps: string[];
}

class PropertyRecommendationsService {
  // Advanced property matching algorithm
  async getPersonalizedRecommendations(
    userPreferences: UserPreferences,
    limit: number = 10
  ): Promise<RecommendationResult> {
    try {
      // Get available properties
      const allProperties = await this.getFilteredProperties(userPreferences);

      if (allProperties.length === 0) {
        return {
          topMatches: [],
          marketInsights: ['No properties match your current criteria'],
          alternativeOptions: [],
          nextSteps: ['Consider expanding your search criteria', 'Adjust budget range', 'Include additional locations']
        };
      }

      // Score each property
      const scoredProperties = await Promise.all(
        allProperties.map(property => this.scoreProperty(property, userPreferences))
      );

      // Sort by overall score
      scoredProperties.sort((a, b) => b.overallScore - a.overallScore);

      // Separate top matches and alternatives
      const topMatches = scoredProperties.slice(0, Math.min(5, limit));
      const alternativeOptions = scoredProperties.slice(5, Math.min(10, limit));

      // Generate market insights
      const marketInsights = await this.generateMarketInsights(userPreferences, topMatches);

      // Generate next steps
      const nextSteps = this.generateNextSteps(userPreferences, topMatches);

      return {
        topMatches,
        marketInsights,
        alternativeOptions,
        nextSteps
      };
    } catch (error) {
      console.error('Error generating property recommendations:', error);
      return {
        topMatches: [],
        marketInsights: ['Unable to generate recommendations at this time'],
        alternativeOptions: [],
        nextSteps: ['Please try again later or contact our team for assistance']
      };
    }
  }

  // Get filtered properties based on basic criteria
  private async getFilteredProperties(preferences: UserPreferences): Promise<any[]> {
    const filters: any = {};

    if (preferences.budget) {
      filters.min_price = preferences.budget.min;
      filters.max_price = preferences.budget.max;
    }

    if (preferences.beds) {
      filters.beds = preferences.beds;
    }

    if (preferences.baths) {
      filters.baths = preferences.baths;
    }

    if (preferences.locations && preferences.locations.length > 0) {
      // For now, use the first location - in production, we'd search multiple
      filters.town = preferences.locations[0];
    }

    if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
      filters.type = preferences.propertyTypes[0];
    }

    try {
      const properties = await propertiesAPI.getProperties(filters);
      return properties || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Comprehensive property scoring algorithm
  private async scoreProperty(property: any, preferences: UserPreferences): Promise<PropertyScore> {
    const factors = {
      budgetFit: 0,
      locationMatch: 0,
      propertyTypeFit: 0,
      marketPotential: 0,
      lifestyleMatch: 0,
      investmentPotential: 0
    };

    const reasoning: string[] = [];
    const recommendations: string[] = [];

    // Budget fit scoring (25% weight)
    if (preferences.budget) {
      const price = property.price_numeric;
      const { min, max } = preferences.budget;
      const midPoint = (min + max) / 2;
      const distance = Math.abs(price - midPoint);
      const range = max - min;

      if (price >= min && price <= max) {
        factors.budgetFit = 100 - (distance / range) * 50; // Perfect fit within range
        reasoning.push(`Price $${price.toLocaleString()} fits perfectly within budget range`);
      } else if (price < min) {
        factors.budgetFit = Math.max(0, 50 - (min - price) / min * 25);
        reasoning.push(`Price $${price.toLocaleString()} is below minimum budget`);
        recommendations.push('Consider if this property meets quality expectations for the price');
      } else {
        factors.budgetFit = Math.max(0, 50 - (price - max) / max * 25);
        reasoning.push(`Price $${price.toLocaleString()} exceeds maximum budget`);
        recommendations.push('Consider negotiating or looking for similar properties in budget');
      }
    } else {
      factors.budgetFit = 75; // Neutral if no budget specified
    }

    // Location match scoring (20% weight)
    if (preferences.locations && preferences.locations.length > 0) {
      const propertyTown = property.town?.toLowerCase();
      const preferredLocations = preferences.locations.map(loc => loc.toLowerCase());

      if (preferredLocations.includes(propertyTown)) {
        factors.locationMatch = 100;
        reasoning.push(`Perfect location match in ${property.town}`);
      } else {
        // Check for nearby or similar areas
        const nearbyAreas = this.getNearbyAreas(propertyTown);
        const hasNearbyMatch = nearbyAreas.some(area => preferredLocations.includes(area));

        if (hasNearbyMatch) {
          factors.locationMatch = 75;
          reasoning.push(`Good location match - near preferred areas`);
          recommendations.push('Consider commute time and accessibility');
        } else {
          factors.locationMatch = 25;
          reasoning.push(`Location ${property.town} not in preferred areas`);
          recommendations.push('Evaluate if this location meets lifestyle needs');
        }
      }
    } else {
      factors.locationMatch = 75; // Neutral if no location preference
    }

    // Property type fit scoring (15% weight)
    if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
      const propertyType = property.type?.toLowerCase();
      const preferredTypes = preferences.propertyTypes.map(type => type.toLowerCase());

      if (preferredTypes.includes(propertyType)) {
        factors.propertyTypeFit = 100;
        reasoning.push(`Perfect property type match: ${property.type}`);
      } else {
        // Check for similar types
        const similarTypes = this.getSimilarPropertyTypes(propertyType);
        const hasSimilarMatch = similarTypes.some(type => preferredTypes.includes(type));

        if (hasSimilarMatch) {
          factors.propertyTypeFit = 75;
          reasoning.push(`Good property type match - similar to preferences`);
        } else {
          factors.propertyTypeFit = 25;
          reasoning.push(`Property type ${property.type} differs from preferences`);
          recommendations.push('Consider if this property type meets needs');
        }
      }
    } else {
      factors.propertyTypeFit = 75;
    }

    // Market potential scoring (15% weight)
    try {
      const marketData = await marketDataService.getMarketData(property.town);
      if (marketData) {
        // Higher score for areas with strong price appreciation
        if (marketData.priceChange > 10) {
          factors.marketPotential = 100;
          reasoning.push(`Strong market potential with ${marketData.priceChange}% annual growth`);
        } else if (marketData.priceChange > 5) {
          factors.marketPotential = 75;
          reasoning.push(`Good market potential with ${marketData.priceChange}% annual growth`);
        } else if (marketData.priceChange > 0) {
          factors.marketPotential = 50;
          reasoning.push(`Moderate market potential with ${marketData.priceChange}% annual growth`);
        } else {
          factors.marketPotential = 25;
          reasoning.push(`Limited market potential with ${marketData.priceChange}% annual growth`);
        }
      } else {
        factors.marketPotential = 50; // Neutral if no market data
      }
    } catch (error) {
      factors.marketPotential = 50;
    }

    // Lifestyle match scoring (15% weight)
    factors.lifestyleMatch = this.scoreLifestyleMatch(property, preferences);
    if (factors.lifestyleMatch >= 80) {
      reasoning.push('Excellent lifestyle match for your preferences');
    } else if (factors.lifestyleMatch >= 60) {
      reasoning.push('Good lifestyle match with minor considerations');
    } else {
      reasoning.push('Lifestyle match needs evaluation');
      recommendations.push('Assess if this property supports your lifestyle needs');
    }

    // Investment potential scoring (10% weight)
    if (preferences.userType === 'investor' || preferences.investmentFocus) {
      try {
        const investmentAnalysis = await marketDataService.getInvestmentAnalysis(
          property.price_numeric,
          property.town,
          5
        );

        if (investmentAnalysis.annualROI > 8) {
          factors.investmentPotential = 100;
          reasoning.push(`Strong investment potential with ${investmentAnalysis.annualROI}% annual ROI`);
        } else if (investmentAnalysis.annualROI > 5) {
          factors.investmentPotential = 75;
          reasoning.push(`Good investment potential with ${investmentAnalysis.annualROI}% annual ROI`);
        } else if (investmentAnalysis.annualROI > 2) {
          factors.investmentPotential = 50;
          reasoning.push(`Moderate investment potential with ${investmentAnalysis.annualROI}% annual ROI`);
        } else {
          factors.investmentPotential = 25;
          reasoning.push(`Limited investment potential with ${investmentAnalysis.annualROI}% annual ROI`);
        }
      } catch (error) {
        factors.investmentPotential = 50;
      }
    } else {
      factors.investmentPotential = 75; // Neutral for non-investors
    }

    // Calculate overall score (weighted average)
    const weights = {
      budgetFit: 0.25,
      locationMatch: 0.20,
      propertyTypeFit: 0.15,
      marketPotential: 0.15,
      lifestyleMatch: 0.15,
      investmentPotential: 0.10
    };

    const overallScore = Math.round(
      factors.budgetFit * weights.budgetFit +
      factors.locationMatch * weights.locationMatch +
      factors.propertyTypeFit * weights.propertyTypeFit +
      factors.marketPotential * weights.marketPotential +
      factors.lifestyleMatch * weights.lifestyleMatch +
      factors.investmentPotential * weights.investmentPotential
    );

    return {
      propertyId: property.id,
      overallScore,
      factors,
      reasoning,
      recommendations
    };
  }

  // Score lifestyle match based on preferences
  private scoreLifestyleMatch(property: any, preferences: UserPreferences): number {
    let score = 50; // Base score

    // Family-friendly scoring
    if (preferences.familySize && preferences.familySize > 2) {
      if (property.beds && property.beds >= 3) score += 15;
      if (property.baths && property.baths >= 2) score += 10;
    }

    // School priority
    if (preferences.schoolPriority) {
      const schoolAreas = ['nosara', 'playa grande', 'la paz', 'tamarindo'];
      if (schoolAreas.includes(property.town?.toLowerCase())) {
        score += 15;
      }
    }

    // Expat community
    if (preferences.expatCommunity) {
      const expatAreas = ['tamarindo', 'playa flamingo', 'playa grande', 'nosara'];
      if (expatAreas.includes(property.town?.toLowerCase())) {
        score += 15;
      }
    }

    // Beach proximity (inferred from location)
    const beachAreas = ['tamarindo', 'playa grande', 'playa flamingo', 'nosara', 'samara'];
    if (beachAreas.includes(property.town?.toLowerCase())) {
      if (preferences.priorities?.includes('ocean') || preferences.priorities?.includes('beach')) {
        score += 20;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  // Get nearby or similar areas
  private getNearbyAreas(location: string): string[] {
    const areaMap: Record<string, string[]> = {
      'tamarindo': ['playa negra', 'brasilito', 'langosta'],
      'nosara': ['guiones', 'pelada', 'san juanillo'],
      'playa grande': ['playa negra', 'tamarindo', 'cabo velas'],
      'samara': ['carrillo', 'nosara', 'nicoya'],
      'liberia': ['carrillo', 'filadelfia', 'belen'],
      'papagayo': ['playa flamingo', 'andalusia', 'coco']
    };

    return areaMap[location?.toLowerCase()] || [];
  }

  // Get similar property types
  private getSimilarPropertyTypes(propertyType: string): string[] {
    const typeMap: Record<string, string[]> = {
      'house': ['home', 'single family', 'villa'],
      'condo': ['condominium', 'apartment', 'penthouse'],
      'lot': ['land', 'terreno', 'property'],
      'commercial': ['business', 'office', 'retail']
    };

    return typeMap[propertyType?.toLowerCase()] || [];
  }

  // Generate market insights based on recommendations
  private async generateMarketInsights(
    preferences: UserPreferences,
    topMatches: PropertyScore[]
  ): Promise<string[]> {
    const insights: string[] = [];

    if (topMatches.length === 0) {
      return ['No properties currently match your criteria in the active listings'];
    }

    try {
      // Get market data for top match location
      const topProperty = await propertiesAPI.getProperty(topMatches[0].propertyId);
      if (topProperty) {
        const marketData = await marketDataService.getMarketData(topProperty.town);

        if (marketData) {
          if (marketData.priceChange > 5) {
            insights.push(`${topProperty.town} is experiencing strong market growth of ${marketData.priceChange}% annually`);
          }

          if (marketData.inventoryCount < 30) {
            insights.push(`Limited inventory in ${topProperty.town} (${marketData.inventoryCount} active listings) suggests high demand`);
          }

          if (marketData.daysOnMarket < 30) {
            insights.push(`Properties in ${topProperty.town} sell quickly (average ${marketData.daysOnMarket} days on market)`);
          }
        }
      }

      // Budget insights
      if (preferences.budget) {
        const avgPrice = topMatches.reduce((sum, match) => {
          // This is approximate - in production we'd get actual prices
          return sum + (preferences.budget!.min + preferences.budget!.max) / 2;
        }, 0) / topMatches.length;

        if (avgPrice > preferences.budget.max * 0.9) {
          insights.push('Your budget is at the higher end of the market - consider timing your purchase well');
        } else if (avgPrice < preferences.budget.min * 1.2) {
          insights.push('Your budget provides good flexibility in the current market');
        }
      }

    } catch (error) {
      console.error('Error generating market insights:', error);
    }

    return insights.length > 0 ? insights : ['Market conditions appear stable for your property search'];
  }

  // Generate next steps recommendations
  private generateNextSteps(preferences: UserPreferences, topMatches: PropertyScore[]): string[] {
    const steps: string[] = [];

    if (topMatches.length === 0) {
      steps.push('Expand your search criteria (location, budget, or property type)');
      steps.push('Consider working with a local real estate agent for off-market properties');
      steps.push('Save your search to get notified when new properties match your criteria');
      return steps;
    }

    steps.push('Schedule viewings for your top 2-3 matches');
    steps.push('Prepare questions about property condition, utilities, and neighborhood');

    if (preferences.userType === 'investor') {
      steps.push('Request rental history and financial performance data');
      steps.push('Consider professional property inspection and appraisal');
    } else {
      steps.push('Tour the neighborhood and check school districts if applicable');
      steps.push('Research local amenities and services');
    }

    steps.push('Consult with a Costa Rican real estate attorney for due diligence');
    steps.push('Prepare financing documents if needed');

    return steps;
  }

  // Get property comparison
  async compareProperties(propertyIds: string[]): Promise<{
    comparison: Record<string, any>;
    recommendations: string[];
  }> {
    try {
      const properties = await Promise.all(
        propertyIds.map(id => propertiesAPI.getProperty(id))
      );

      const comparison = {
        price: properties.map(p => ({ id: p.id, price: p.price_numeric, town: p.town })),
        size: properties.map(p => ({ id: p.id, beds: p.beds, baths: p.baths, area: p.area_m2 })),
        features: properties.map(p => ({ id: p.id, features: this.extractFeatures(p) }))
      };

      const recommendations = this.generateComparisonRecommendations(properties);

      return { comparison, recommendations };
    } catch (error) {
      console.error('Error comparing properties:', error);
      return {
        comparison: {},
        recommendations: ['Unable to generate property comparison']
      };
    }
  }

  // Extract property features
  private extractFeatures(property: any): string[] {
    const features: string[] = [];

    if (property.beds) features.push(`${property.beds} bedrooms`);
    if (property.baths) features.push(`${property.baths} bathrooms`);
    if (property.area_m2) features.push(`${property.area_m2}m²`);
    if (property.lot_m2) features.push(`${property.lot_m2}m² lot`);
    if (property.year_built) features.push(`Built in ${property.year_built}`);

    return features;
  }

  // Generate comparison recommendations
  private generateComparisonRecommendations(properties: any[]): string[] {
    const recommendations: string[] = [];

    if (properties.length < 2) return recommendations;

    // Price comparison
    const prices = properties.map(p => p.price_numeric).sort((a, b) => a - b);
    const priceRange = prices[prices.length - 1] - prices[0];

    if (priceRange / prices[0] > 0.3) {
      recommendations.push('Consider value differences - higher-priced properties may offer better quality or location');
    }

    // Size comparison
    const sizes = properties.map(p => p.area_m2 || 0).filter(s => s > 0);
    if (sizes.length > 1) {
      const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      recommendations.push(`Average property size: ${Math.round(avgSize)}m² - consider space requirements`);
    }

    return recommendations;
  }
}

// Export singleton instance
export const propertyRecommendationsService = new PropertyRecommendationsService();