import React, { useState } from 'react';
import { FileText, Waves, Shield, AlertTriangle, CheckCircle, XCircle, ChevronRight, Sparkles, MessageSquare, ArrowRight, Info } from 'lucide-react';
import { Button } from '../components/ui';

const TitleTypes = () => {
  const [selectedComparison, setSelectedComparison] = useState<'overview' | 'ownership' | 'transfer' | 'restrictions'>('overview');

  const titleTypes = [
    {
      id: 'titled',
      name: 'Titled Property',
      description: 'Full private ownership registered in the National Registry',
      icon: FileText,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      features: [
        'Full ownership rights',
        'Permanent title',
        'Easier to transfer',
        'Bank financing available',
        'Higher property values'
      ],
      limitations: [
        'Limited coastal access',
        'Higher property taxes',
        'More expensive'
      ]
    },
    {
      id: 'maritime',
      name: 'Maritime Concession',
      description: 'Government concession for coastal zone property (200m from high tide)',
      icon: Waves,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      features: [
        'Beach access included',
        'Ocean views guaranteed',
        'Lower purchase price',
        'Tourism potential'
      ],
      limitations: [
        '20-year renewable term',
        'Government approval needed',
        'Usage restrictions',
        'Limited financing options',
        'Environmental regulations'
      ]
    }
  ];

  const comparisonData = {
    overview: {
      title: 'Property Overview',
      data: [
        { aspect: 'Location', titled: 'Inland or limited coastal', maritime: 'Within 200m of high tide' },
        { aspect: 'Ownership Type', titled: 'Private property', maritime: 'Government concession' },
        { aspect: 'Duration', titled: 'Permanent', maritime: '20 years (renewable)' },
        { aspect: 'Transfer Process', titled: 'Standard registration', maritime: 'Government approval required' }
      ]
    },
    ownership: {
      title: 'Ownership Rights',
      data: [
        { aspect: 'Property Rights', titled: 'Full ownership', maritime: 'Usage rights only' },
        { aspect: 'Inheritance', titled: 'Direct inheritance', maritime: 'May require renewal' },
        { aspect: 'Development Rights', titled: 'Subject to zoning', maritime: 'Strict environmental rules' },
        { aspect: 'Commercial Use', titled: 'Generally allowed', maritime: 'Limited permissions' }
      ]
    },
    transfer: {
      title: 'Transfer & Sales',
      data: [
        { aspect: 'Sale Process', titled: 'Standard real estate', maritime: 'Government oversight' },
        { aspect: 'Documentation', titled: 'Title transfer', maritime: 'Concession assignment' },
        { aspect: 'Closing Time', titled: '30-60 days', maritime: '60-90 days' },
        { aspect: 'Legal Fees', titled: 'Standard rates', maritime: 'Higher due to complexity' }
      ]
    },
    restrictions: {
      title: 'Restrictions & Requirements',
      data: [
        { aspect: 'Building Permits', titled: 'Municipal approval', maritime: 'Environmental assessment' },
        { aspect: 'Usage Restrictions', titled: 'Zoning laws', maritime: 'Conservation rules' },
        { aspect: 'Maintenance', titled: 'Owner responsibility', maritime: 'Environmental standards' },
        { aspect: 'Insurance', titled: 'Standard policies', maritime: 'Specialized coverage' }
      ]
    }
  };

  const statistics = [
    { label: 'Titled Properties', value: '70%', description: 'of Guanacaste properties' },
    { label: 'Maritime Concessions', value: '30%', description: 'coastal zone properties' },
    { label: 'Average Concession Term', value: '15 years', description: 'current renewals' },
    { label: 'Environmental Compliance', value: '100%', description: 'required for maritime' }
  ];

  const getComparisonIcon = (value: string, type: 'titled' | 'maritime') => {
    if (value.includes('Full') || value.includes('Standard') || value.includes('Generally')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (value.includes('Limited') || value.includes('Higher') || value.includes('Strict')) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
    if (value.includes('Government') || value.includes('Environmental')) {
      return <Info className="w-4 h-4 text-blue-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-slate-400" />;
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
              Property <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Title Types</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Understanding the differences between titled properties and maritime concessions
              in Costa Rica's unique legal framework.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{stat.label}</div>
                <div className="text-xs text-slate-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Title Types Overview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Title Types in Costa Rica</h2>
            <p className="text-xl text-slate-600">Two main property ownership structures with different rights and restrictions</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {titleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className={`bg-gradient-to-br ${type.bgColor} rounded-2xl p-8 border ${type.borderColor}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.name}</h3>
                  <p className="text-slate-700 mb-6 leading-relaxed">{type.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Advantages
                      </h4>
                      <ul className="space-y-2">
                        {type.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Considerations
                      </h4>
                      <ul className="space-y-2">
                        {type.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Tool */}
      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Detailed Comparison</h2>
            <p className="text-slate-600">Compare titled properties vs maritime concessions across different aspects</p>
          </div>

          {/* Comparison Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(comparisonData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedComparison(key as any)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedComparison === key
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {data.title}
              </button>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Aspect</th>
                    <th className="px-6 py-4 text-center font-bold text-green-700">Titled Property</th>
                    <th className="px-6 py-4 text-center font-bold text-blue-700">Maritime Concession</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData[selectedComparison].data.map((row, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.aspect}</td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          {getComparisonIcon(row.titled, 'titled')}
                          <span>{row.titled}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          {getComparisonIcon(row.maritime, 'maritime')}
                          <span>{row.maritime}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Helper */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Which Type is Right for You?</h2>
            <p className="text-slate-600">Consider your priorities and investment goals</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Choose Titled Property If:</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  You want permanent ownership security
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  You need bank financing options
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  You prefer simpler transfer processes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Long-term investment stability is key
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Choose Maritime Concession If:</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Beach/ocean access is essential
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  You want lower acquisition costs
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Tourism/income potential is important
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  You're comfortable with government oversight
                </li>
              </ul>
            </div>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Help Choosing?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Our AI Property Assistant can help you understand which property type best fits
              your specific situation, budget, and investment goals.
            </p>
            <Button
              onClick={() => {
                const event = new CustomEvent('openAIAssistant');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Get Personalized Advice
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TitleTypes;