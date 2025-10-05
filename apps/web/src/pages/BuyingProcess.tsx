import React from 'react';
import { CheckCircle, Clock, FileText, Shield, Users, DollarSign, Home, MapPin, Calculator, AlertTriangle, ChevronRight } from 'lucide-react';

const BuyingProcess = () => {
  const steps = [
    {
      step: 1,
      title: "Research & Planning",
      description: "Define your budget, lifestyle needs, and preferred locations in Guanacaste.",
      icon: MapPin,
      details: [
        "Determine your budget including purchase price, closing costs (5-8%), and ongoing expenses",
        "Research neighborhoods, schools, and amenities in Tamarindo, Nosara, Flamingo, etc.",
        "Consider your lifestyle: beach proximity, privacy, investment potential",
        "Work with a local real estate attorney from the beginning"
      ]
    },
    {
      step: 2,
      title: "Find Properties",
      description: "Browse verified listings and work with licensed professionals.",
      icon: Home,
      details: [
        "Use our platform to search verified, commission-free listings",
        "Attend open houses and private showings",
        "Compare properties based on location, condition, and price",
        "Get pre-approval for financing if needed"
      ]
    },
    {
      step: 3,
      title: "Due Diligence",
      description: "Verify property details, legal status, and conduct inspections.",
      icon: Shield,
      details: [
        "Title verification through Costa Rica's Public Registry",
        "Property survey and boundary confirmation",
        "Structural, termite, and well inspections",
        "Verify utility connections (water, electricity, internet)",
        "Check for easements, liens, or legal restrictions"
      ]
    },
    {
      step: 4,
      title: "Make an Offer",
      description: "Submit a formal offer with contingencies and negotiation terms.",
      icon: Calculator,
      details: [
        "Present offer through your attorney or real estate agent",
        "Include earnest money deposit (typically 10% of purchase price)",
        "Specify inspection and financing contingencies",
        "Negotiate terms, price, and closing timeline"
      ]
    },
    {
      step: 5,
      title: "Legal Review",
      description: "Attorney reviews all documents and ensures legal compliance.",
      icon: FileText,
      details: [
        "Purchase agreement review and signing",
        "Title transfer documentation preparation",
        "Tax payment calculations and arrangements",
        "Government permit and registration processes"
      ]
    },
    {
      step: 6,
      title: "Closing",
      description: "Final payments, document signing, and property transfer.",
      icon: CheckCircle,
      details: [
        "Final walk-through inspection",
        "Wire transfer of remaining funds",
        "Notarization of all documents",
        "Title transfer registration at Public Registry",
        "Key handover and property possession"
      ]
    }
  ];

  const considerations = [
    {
      title: "Costa Rican Law Requirements",
      icon: AlertTriangle,
      items: [
        "Foreigners can own property freely in Costa Rica",
        "No restrictions on foreign ownership in Guanacaste",
        "All transactions must be in Costa Rican Colones (CRC)",
        "Government transfer tax (1.5% of higher of cadastral or sale value)"
      ]
    },
    {
      title: "Professional Services",
      icon: Users,
      items: [
        "Licensed Costa Rican real estate attorney (required)",
        "Certified translator for documents",
        "Local notary public for authentication",
        "Tax advisor familiar with Costa Rican property taxes"
      ]
    },
    {
      title: "Additional Costs",
      icon: DollarSign,
      items: [
        "Transfer tax: 1.5% of property value",
        "Notary fees: 0.25% of property value",
        "Registration fees: Approximately $500-800",
        "Legal fees: $1,500-3,000 depending on complexity"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Your Complete Guide to<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Buying Property in Guanacaste
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Navigate Costa Rica's property market with confidence. Our comprehensive guide covers every step of the buying process, from initial research to closing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Search
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Download Checklist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">6-Step Buying Process</h2>
            <p className="text-xl text-slate-600">Follow our proven roadmap to successful property ownership</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="bg-slate-50 rounded-2xl p-8 hover:bg-slate-100 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-2xl font-bold text-cyan-600">Step {step.step}</span>
                        <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-lg text-slate-700 mb-6">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-600">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
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

      {/* Key Considerations */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Important Considerations</h2>
            <p className="text-xl text-slate-300">What you need to know before buying in Costa Rica</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {considerations.map((consideration, index) => {
              const Icon = consideration.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 hover:bg-slate-700 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{consideration.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {consideration.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Typical Timeline</h2>
            <p className="text-xl text-slate-600">How long does the process take?</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {[
                { phase: "Research & Planning", duration: "1-3 months", description: "Define needs, research locations, secure financing" },
                { phase: "Property Search", duration: "1-6 months", description: "Find and evaluate suitable properties" },
                { phase: "Due Diligence", duration: "2-4 weeks", description: "Inspections, title verification, legal review" },
                { phase: "Negotiation & Offer", duration: "1-2 weeks", description: "Submit offer and negotiate terms" },
                { phase: "Legal & Closing", duration: "2-4 weeks", description: "Document preparation and final transfer" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.phase}</h3>
                      <span className="text-sm font-semibold text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Timeline Note</h3>
                  <p className="text-slate-700 text-sm">
                    These are typical timeframes. Complex properties, international buyers, or high-demand markets may take longer.
                    Always work with experienced local professionals to ensure smooth transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Guanacaste Journey?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Our platform makes buying property in Costa Rica simple and transparent.
            Access verified listings, expert guidance, and save thousands on commissions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300">
              Browse Properties Now
            </button>
            <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
              Ask Our AI Assistant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyingProcess;