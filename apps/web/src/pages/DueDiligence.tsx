import React, { useState } from 'react';
import { CheckSquare, AlertTriangle, FileText, Shield, Search, Users, Building, DollarSign, Sparkles, MessageSquare, ChevronRight, CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@guanacaste-real/ui';

const DueDiligence = () => {
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('legal');

  const dueDiligenceCategories = [
    {
      id: 'legal',
      title: 'Legal Verification',
      description: 'Verify property ownership and legal status',
      icon: FileText,
      color: 'from-red-500 to-orange-600',
      items: [
        { id: 'title-search', label: 'Complete title search at National Registry', critical: true },
        { id: 'ownership-chain', label: 'Verify complete ownership chain', critical: true },
        { id: 'liens-judgments', label: 'Check for liens, judgments, or encumbrances', critical: true },
        { id: 'maritime-status', label: 'Confirm maritime concession status (if applicable)', critical: true },
        { id: 'zoning-compliance', label: 'Verify zoning and land use compliance', important: true },
        { id: 'building-permits', label: 'Check building permits and construction legality', important: true }
      ]
    },
    {
      id: 'property',
      title: 'Property Inspection',
      description: 'Physical inspection and condition assessment',
      icon: Building,
      color: 'from-blue-500 to-cyan-600',
      items: [
        { id: 'structural-inspection', label: 'Professional structural inspection', critical: true },
        { id: 'roof-condition', label: 'Roof and waterproofing assessment', important: true },
        { id: 'electrical-system', label: 'Electrical system safety check', important: true },
        { id: 'plumbing-system', label: 'Plumbing and water system inspection', important: true },
        { id: 'pest-inspection', label: 'Termite and pest inspection', recommended: true },
        { id: 'environmental-assessment', label: 'Environmental impact assessment', recommended: true }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Due Diligence',
      description: 'Cost analysis and financial verification',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      items: [
        { id: 'property-taxes', label: 'Verify current property tax status', critical: true },
        { id: 'utility-costs', label: 'Check utility connection and costs', important: true },
        { id: 'hoa-fees', label: 'Review HOA fees and assessments', important: true },
        { id: 'insurance-costs', label: 'Obtain insurance quotes', recommended: true },
        { id: 'maintenance-costs', label: 'Estimate ongoing maintenance costs', recommended: true },
        { id: 'appraisal', label: 'Independent property appraisal', recommended: true }
      ]
    },
    {
      id: 'neighborhood',
      title: 'Neighborhood Research',
      description: 'Location and community assessment',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      items: [
        { id: 'crime-statistics', label: 'Review local crime statistics', important: true },
        { id: 'school-ratings', label: 'Check school district ratings', recommended: true },
        { id: 'amenities-access', label: 'Verify access to amenities and services', important: true },
        { id: 'flood-zone', label: 'Check flood zone and insurance requirements', important: true },
        { id: 'future-development', label: 'Research planned development projects', recommended: true },
        { id: 'community-reviews', label: 'Read community reviews and feedback', recommended: true }
      ]
    }
  ];

  const toggleChecklistItem = (itemId: string) => {
    setChecklistProgress(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getProgressForCategory = (categoryId: string) => {
    const category = dueDiligenceCategories.find(c => c.id === categoryId);
    if (!category) return 0;

    const completed = category.items.filter(item => checklistProgress[item.id]).length;
    return Math.round((completed / category.items.length) * 100);
  };

  const getTotalProgress = () => {
    const allItems = dueDiligenceCategories.flatMap(c => c.items);
    const completed = allItems.filter(item => checklistProgress[item.id]).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const getItemPriorityColor = (item: any) => {
    if (item.critical) return 'text-red-600 bg-red-50 border-red-200';
    if (item.important) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getItemPriorityLabel = (item: any) => {
    if (item.critical) return 'Critical';
    if (item.important) return 'Important';
    return 'Recommended';
  };

  const activeCategoryData = dueDiligenceCategories.find(c => c.id === activeCategory);

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
              Due <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Diligence</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive checklist and tools to verify property legitimacy and avoid costly mistakes.
              Complete your due diligence with confidence.
            </p>

            {/* Overall Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Overall Progress</span>
                  <span className="text-cyan-300 font-bold">{getTotalProgress()}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getTotalProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {dueDiligenceCategories.map((category) => {
              const Icon = category.icon;
              const progress = getProgressForCategory(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'border-cyan-300 bg-cyan-50 shadow-lg'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{progress}%</span>
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-green-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Checklist */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeCategoryData && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${activeCategoryData.color} rounded-xl flex items-center justify-center`}>
                    <activeCategoryData.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeCategoryData.title}</h2>
                    <p className="text-slate-600">{activeCategoryData.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700">Progress:</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        getProgressForCategory(activeCategory) === 100 ? 'bg-green-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${getProgressForCategory(activeCategory)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{getProgressForCategory(activeCategory)}%</span>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  {activeCategoryData.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all duration-200 hover:bg-slate-50"
                    >
                      <div className="mt-1">
                        {checklistProgress[item.id] ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">{item.label}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getItemPriorityColor(item)}`}>
                            {getItemPriorityLabel(item)}
                          </span>
                        </div>

                        {item.critical && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Critical for legal protection
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Due Diligence Services</h2>
            <p className="text-slate-600">Expert assistance for complex verification tasks</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Title Search & Verification',
                description: 'Complete ownership history and legal status verification',
                icon: Search,
                price: 'From $500',
                features: ['National Registry search', 'Ownership chain verification', 'Legal status confirmation']
              },
              {
                title: 'Property Inspection',
                description: 'Professional structural and condition assessment',
                icon: Building,
                price: 'From $300',
                features: ['Structural inspection', 'System checks', 'Detailed report']
              },
              {
                title: 'Legal Review',
                description: 'Attorney review of all property documents',
                icon: FileText,
                price: 'From $750',
                features: ['Document review', 'Legal opinion', 'Risk assessment']
              }
            ].map((service, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 mb-4 text-sm">{service.description}</p>
                <div className="text-lg font-bold text-cyan-600 mb-4">{service.price}</div>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Get Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Help with Due Diligence?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Our AI Property Assistant can guide you through the due diligence process,
              recommend professionals, and help interpret reports and documents.
            </p>
            <Button
              onClick={() => {
                const event = new CustomEvent('openAIAssistant');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Get AI Guidance
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DueDiligence;