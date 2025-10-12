// Data Validation and Quality Assurance Service
// Ensures property data meets quality standards and business rules

interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validator: (property: any) => ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
  field?: string;
  value?: any;
  suggestion?: string;
}

interface DataQualityReport {
  totalProperties: number;
  validProperties: number;
  invalidProperties: number;
  warnings: number;
  errors: ValidationResult[];
  warningsList: ValidationResult[];
  qualityScore: number; // 0-100
  recommendations: string[];
}

class DataValidationService {
  private rules: ValidationRule[] = [
    // Critical validation rules (errors)
    {
      name: 'required_title',
      description: 'Property must have a title',
      severity: 'error',
      validator: (property) => ({
        valid: Boolean(property.title && property.title.trim().length > 0),
        message: 'Title is required',
        field: 'title'
      })
    },
    {
      name: 'required_location',
      description: 'Property must have a town/location',
      severity: 'error',
      validator: (property) => ({
        valid: Boolean(property.town && property.town.trim().length > 0),
        message: 'Town/location is required',
        field: 'town'
      })
    },
    {
      name: 'valid_coordinates',
      description: 'Coordinates must be within valid ranges',
      severity: 'error',
      validator: (property) => {
        const lat = property.lat;
        const lng = property.lng;

        if (lat === undefined || lng === undefined) {
          return { valid: true }; // Optional field
        }

        const validLat = lat >= -90 && lat <= 90;
        const validLng = lng >= -180 && lng <= 180;

        return {
          valid: validLat && validLng,
          message: !validLat ? 'Invalid latitude' : 'Invalid longitude',
          field: !validLat ? 'lat' : 'lng',
          value: !validLat ? lat : lng
        };
      }
    },
    {
      name: 'valid_price',
      description: 'Price must be a positive number',
      severity: 'error',
      validator: (property) => {
        const price = property.price;
        if (price === undefined || price === null) {
          return { valid: true }; // Optional field
        }

        return {
          valid: typeof price === 'number' && price > 0,
          message: 'Price must be a positive number',
          field: 'price',
          value: price
        };
      }
    },

    // Warning validation rules
    {
      name: 'realistic_price',
      description: 'Price should be within realistic ranges for Guanacaste',
      severity: 'warning',
      validator: (property) => {
        const price = property.price;
        if (!price || typeof price !== 'number') return { valid: true };

        // Guanacaste price ranges (approximate)
        const minPrice = 50000; // $50k
        const maxPrice = 10000000; // $10M

        const realistic = price >= minPrice && price <= maxPrice;
        return {
          valid: realistic,
          message: realistic ? undefined : `Price $${price.toLocaleString()} seems unrealistic for Guanacaste market`,
          field: 'price',
          value: price,
          suggestion: `Typical Guanacaste prices range from $${minPrice.toLocaleString()} to $${maxPrice.toLocaleString()}`
        };
      }
    },
    {
      name: 'complete_description',
      description: 'Property should have a detailed description',
      severity: 'warning',
      validator: (property) => {
        const desc = property.description || '';
        const minLength = 50;

        return {
          valid: desc.length >= minLength,
          message: desc.length < minLength ? 'Description is too short' : undefined,
          field: 'description',
          suggestion: 'Add more details about the property features, location, and amenities'
        };
      }
    },
    {
      name: 'has_images',
      description: 'Property should have at least one image',
      severity: 'warning',
      validator: (property) => {
        const images = property.images || [];
        return {
          valid: images.length > 0,
          message: images.length === 0 ? 'No images provided' : undefined,
          field: 'images',
          suggestion: 'Add high-quality photos of the property'
        };
      }
    },
    {
      name: 'valid_area',
      description: 'Property areas should be realistic',
      severity: 'warning',
      validator: (property) => {
        const areaM2 = property.areaM2;
        const lotM2 = property.lotM2;

        if (!areaM2 && !lotM2) return { valid: true };

        let issues = [];

        if (areaM2 && (areaM2 < 20 || areaM2 > 2000)) {
          issues.push(`Building area ${areaM2}m² seems unrealistic`);
        }

        if (lotM2 && (lotM2 < 50 || lotM2 > 50000)) {
          issues.push(`Lot size ${lotM2}m² seems unrealistic`);
        }

        if (areaM2 && lotM2 && areaM2 > lotM2) {
          issues.push('Building area cannot be larger than lot size');
        }

        return {
          valid: issues.length === 0,
          message: issues.length > 0 ? issues.join('; ') : undefined,
          field: 'areaM2',
          suggestion: 'Verify area measurements are accurate'
        };
      }
    },

    // Info validation rules
    {
      name: 'complete_amenities',
      description: 'Property information completeness',
      severity: 'info',
      validator: (property) => {
        const fields = ['beds', 'baths', 'yearBuilt', 'utilities'];
        const completed = fields.filter(field => property[field] !== undefined && property[field] !== null).length;
        const completeness = (completed / fields.length) * 100;

        return {
          valid: true,
          message: `Property information ${completeness.toFixed(0)}% complete`,
          suggestion: completeness < 75 ? 'Add more property details (bedrooms, bathrooms, year built, utilities)' : undefined
        };
      }
    }
  ];

  // Validate a single property
  validateProperty(property: any): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const rule of this.rules) {
      const result = rule.validator(property);
      if (!result.valid) {
        results.push({
          ...result,
          field: result.field || 'unknown',
          message: result.message || `${rule.name} validation failed`
        });
      }
    }

    return results;
  }

  // Validate multiple properties
  validateProperties(properties: any[]): DataQualityReport {
    const errors: ValidationResult[] = [];
    const warningsList: ValidationResult[] = [];
    let validCount = 0;

    for (const property of properties) {
      const propertyResults = this.validateProperty(property);

      const propertyErrors = propertyResults.filter(r => r.message && !r.suggestion);
      const propertyWarnings = propertyResults.filter(r => r.suggestion);

      errors.push(...propertyErrors);
      warningsList.push(...propertyWarnings);

      // Property is valid if it has no errors
      if (propertyErrors.length === 0) {
        validCount++;
      }
    }

    const qualityScore = this.calculateQualityScore(properties.length, validCount, warningsList.length);

    return {
      totalProperties: properties.length,
      validProperties: validCount,
      invalidProperties: properties.length - validCount,
      warnings: warningsList.length,
      errors,
      warningsList,
      qualityScore,
      recommendations: this.generateRecommendations(errors, warningsList, qualityScore)
    };
  }

  // Calculate data quality score (0-100)
  private calculateQualityScore(total: number, valid: number, warnings: number): number {
    if (total === 0) return 100;

    const validityScore = (valid / total) * 100;
    const warningPenalty = Math.min(warnings / total * 20, 20); // Max 20 point penalty for warnings

    return Math.max(0, Math.min(100, validityScore - warningPenalty));
  }

  // Generate recommendations based on validation results
  private generateRecommendations(
    errors: ValidationResult[],
    warnings: ValidationResult[],
    qualityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (qualityScore < 50) {
      recommendations.push('CRITICAL: Data quality is below acceptable standards. Immediate review required.');
    } else if (qualityScore < 75) {
      recommendations.push('Data quality needs improvement. Address critical errors first.');
    }

    // Analyze error patterns
    const errorFields = errors.reduce((acc, error) => {
      acc[error.field || 'unknown'] = (acc[error.field || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonErrorField = Object.entries(errorFields)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonErrorField) {
      recommendations.push(`Focus on fixing ${mostCommonErrorField[0]} field errors (${mostCommonErrorField[1]} instances)`);
    }

    // Analyze warning patterns
    if (warnings.length > 0) {
      const warningFields = warnings.reduce((acc, warning) => {
        acc[warning.field || 'unknown'] = (acc[warning.field || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonWarningField = Object.entries(warningFields)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostCommonWarningField) {
        recommendations.push(`Consider improving ${mostCommonWarningField[0]} field completeness (${mostCommonWarningField[1]} instances)`);
      }
    }

    // General recommendations
    if (errors.some(e => e.field === 'coordinates')) {
      recommendations.push('Implement geocoding service to automatically validate and correct coordinates');
    }

    if (warnings.some(w => w.field === 'images')) {
      recommendations.push('Set up automated image processing pipeline for property photos');
    }

    if (qualityScore >= 80) {
      recommendations.push('Data quality is excellent! Focus on maintaining standards.');
    }

    return recommendations;
  }

  // Get validation rules
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  // Add custom validation rule
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  // Remove validation rule
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  // Validate data source quality
  validateDataSource(sourceId: string, properties: any[]): DataQualityReport {
    const report = this.validateProperties(properties);

    // Add source-specific insights
    if (sourceId === 'mls_cr') {
      report.recommendations.push('MLS data typically has high quality - focus on image optimization');
    } else if (sourceId === 'local_brokers') {
      report.recommendations.push('Broker data may need more validation - implement manual review workflow');
    }

    return report;
  }

  // Generate quality improvement plan
  generateImprovementPlan(report: DataQualityReport): {
    priority: 'low' | 'medium' | 'high' | 'critical';
    actions: Array<{
      action: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      timeframe: string;
    }>;
  } {
    const actions: Array<{
      action: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      timeframe: string;
    }> = [];

    if (report.qualityScore < 50) {
      return {
        priority: 'critical',
        actions: [
          {
            action: 'Immediate data source audit and cleanup',
            impact: 'high',
            effort: 'high',
            timeframe: '1-2 days'
          },
          {
            action: 'Implement automated data validation pipeline',
            impact: 'high',
            effort: 'medium',
            timeframe: '3-5 days'
          },
          {
            action: 'Manual review of all invalid properties',
            impact: 'high',
            effort: 'high',
            timeframe: '1-2 weeks'
          }
        ]
      };
    }

    if (report.errors.length > 0) {
      actions.push({
        action: `Fix ${report.errors.length} data validation errors`,
        impact: 'high',
        effort: 'medium',
        timeframe: '3-7 days'
      });
    }

    if (report.warnings > report.errors.length) {
      actions.push({
        action: `Address ${report.warnings} data quality warnings`,
        impact: 'medium' as const,
        effort: 'low' as const,
        timeframe: '1-2 weeks'
      });
    }

    if (report.qualityScore > 90) {
      return {
        priority: 'low',
        actions: [{
          action: 'Maintain current quality standards',
          impact: 'medium',
          effort: 'low',
          timeframe: 'Ongoing'
        }]
      };
    }

    return {
      priority: report.qualityScore < 75 ? 'high' : 'medium',
      actions
    };
  }
}

// Export singleton instance
export const dataValidationService = new DataValidationService();

// Export types
export type { ValidationRule, ValidationResult, DataQualityReport };