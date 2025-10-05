import React, { useState } from 'react';
import { Scale, FileText, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, ExternalLink, BookOpen, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@guanacaste-real/ui';

const CostaRicaLaws = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const legalCategories = [
    {
      id: 'property-ownership',
      title: 'Property Ownership Laws',
      description: 'Legal framework for property rights and ownership',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      articles: 12
    },
    {
      id: 'environmental-regulations',
      title: 'Environmental Regulations',
      description: 'Coastal zone and environmental protection laws',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      articles: 8
    },
    {
      id: 'tax-regulations',
      title: 'Tax Regulations',
      description: 'Property taxes, transfer taxes, and fiscal obligations',
      icon: Scale,
      color: 'from-purple-500 to-pink-600',
      articles: 15
    },
    {
      id: 'construction-permits',
      title: 'Construction & Permits',
      description: 'Building codes and permit requirements',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-600',
      articles: 10
    }
  ];

  const legalSections = [
    {
      id: 'maritime-zone-law',
      title: 'Maritime Zone Law (Article 33)',
      summary: 'Governs property within 200 meters of high tide line',
      content: `The Maritime Zone Law establishes that all land within 200 meters of the high tide line is public domain and cannot be privately owned. Property in this zone can only be held through renewable concessions granted by the government.

Key provisions:
• Maximum concession term: 20 years (renewable)
• Usage restrictions for commercial development
• Environmental impact assessments required
• Government approval needed for transfers`,
      lastUpdated: '2024-01-15',
      importance: 'critical'
    },
    {
      id: 'property-registry-law',
      title: 'Property Registry Law',
      summary: 'Registration and title verification requirements',
      content: `All property transactions must be registered with the National Registry. This ensures legal validity and protects against fraud.

Key requirements:
• Title search mandatory for all transactions
• Public registry provides title history
• Notary public certification required
• Government stamp tax on transfers`,
      lastUpdated: '2024-01-12',
      importance: 'critical'
    },
    {
      id: 'environmental-protection',
      title: 'Environmental Protection Law',
      summary: 'Conservation and sustainable development regulations',
      content: `Costa Rica's environmental laws protect natural resources and biodiversity. Property development must comply with environmental impact assessments.

Key regulations:
• Environmental permits for construction
• Protected areas and wildlife corridors
• Water resource protection
• Sustainable development requirements`,
      lastUpdated: '2024-01-10',
      importance: 'high'
    },
    {
      id: 'tax-obligation-law',
      title: 'Tax Obligation Law',
      summary: 'Property tax and transfer tax requirements',
      content: `Property owners have various tax obligations including annual property taxes and transfer taxes.

Tax structure:
• Annual property tax: 0.25% of declared value
• Transfer tax: 2.5% of higher of sale price or appraised value
• Municipal taxes vary by location
• Tax exemptions for certain property types`,
      lastUpdated: '2024-01-08',
      importance: 'high'
    },
    {
      id: 'construction-regulations',
      title: 'Construction Regulations',
      summary: 'Building codes and permit requirements',
      content: `All construction requires municipal permits and must comply with building codes.

Permit requirements:
• Architectural plans submission
• Structural engineering certification
• Environmental impact assessment
• Municipal approval process`,
      lastUpdated: '2024-01-05',
      importance: 'medium'
    }
  ];

  const quickFacts = [
    { label: 'Maritime Zone Limit', value: '200m from high tide', icon: Scale },
    { label: 'Max Concession Term', value: '20 years', icon: FileText },
    { label: 'Transfer Tax Rate', value: '2.5%', icon: Shield },
    { label: 'Property Tax Rate', value: '0.25%', icon: CheckCircle }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Costa Rica <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Property Laws</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive legal framework for property ownership in Guanacaste.
              Expert analysis of Costa Rican real estate regulations and compliance requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickFacts.map((fact, i) => {
              const Icon = fact.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">{fact.value}</div>
                  <div className="text-sm text-slate-600">{fact.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legal Categories */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Legal Categories</h2>
            <p className="text-slate-600">Explore different areas of Costa Rican property law</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {legalCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{category.articles} articles</span>
                    <ChevronRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legal Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Key Legal Provisions</h2>
            <p className="text-slate-600">Detailed breakdown of important Costa Rican property laws</p>
          </div>

          <div className="space-y-4">
            {legalSections.map((section) => (
              <div key={section.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getImportanceColor(section.importance)}`}>
                          {section.importance}
                        </span>
                      </div>
                      <p className="text-slate-600">{section.summary}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-slate-500">
                        Updated {new Date(section.lastUpdated).toLocaleDateString()}
                      </span>
                      {expandedSection === section.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedSection === section.id && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="pt-4">
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Full Law
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notices */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Important Legal Notice</h3>
                <div className="space-y-3 text-slate-700">
                  <p>
                    This information is for educational purposes only and does not constitute legal advice.
                    Costa Rican property laws can be complex and may change.
                  </p>
                  <p>
                    Always consult with qualified legal professionals and local authorities for your specific situation.
                    We recommend working with licensed Costa Rican attorneys and notaries for all property transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Legal Assistant */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Legal Clarification?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Our AI Property Assistant is trained on Costa Rican property laws and can help clarify
              complex legal concepts specific to your situation.
            </p>
            <Button
              onClick={() => {
                const event = new CustomEvent('openAIAssistant');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask Legal Questions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CostaRicaLaws;