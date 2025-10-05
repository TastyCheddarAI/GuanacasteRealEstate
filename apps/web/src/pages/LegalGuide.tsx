import React from 'react';
import { Shield, FileText, Scale, AlertTriangle, CheckCircle, MapPin, Waves, Home, DollarSign, Clock, Users, ChevronRight } from 'lucide-react';

const LegalGuide = () => {
  const legalTopics = [
    {
      title: "Property Ownership Types",
      icon: Home,
      sections: [
        {
          subtitle: "Titled Properties (Propiedad Título)",
          content: "Full ownership rights registered in Costa Rica's Public Registry. These properties offer complete security and are freely transferable. Most inland properties in Guanacaste are titled.",
          benefits: ["Full ownership rights", "Easy transferability", "Bank financing available", "No renewal requirements"],
          considerations: ["Higher purchase price", "Property taxes apply", "Full legal protection"]
        },
        {
          subtitle: "Maritime Zone Concessions (Concesión Marítimo Terrestre)",
          content: "Government-granted concessions for properties within 200 meters of the high tide line. Valid for 5-20 years with renewal options.",
          benefits: ["Often more affordable", "Beachfront access", "Renewable terms", "Government oversight"],
          considerations: ["Limited time ownership", "Government approval for transfers", "Environmental restrictions", "Renewal uncertainty"]
        }
      ]
    },
    {
      title: "Legal Requirements for Foreign Buyers",
      icon: Shield,
      content: "Costa Rica welcomes foreign property ownership with no restrictions. However, specific legal procedures must be followed.",
      requirements: [
        "Valid passport for all buyers",
        "Costa Rican tax ID (cedula) or DIMEX (temporary residency)",
        "Licensed Costa Rican attorney required for all transactions",
        "All documents must be translated to Spanish",
        "Notarization by Costa Rican notary public",
        "Registration with Public Registry"
      ]
    },
    {
      title: "Due Diligence Essentials",
      icon: FileText,
      checklist: [
        "Title verification through Public Registry",
        "Property survey and boundary confirmation",
        "Zoning and land use verification",
        "Utility rights and water availability",
        "Outstanding tax and lien verification",
        "Environmental impact assessments",
        "Building permit and construction legality",
        "Neighboring property rights review"
      ]
    }
  ];

  const taxesAndFees = [
    {
      name: "Transfer Tax (Impuesto de Traspaso)",
      rate: "1.5%",
      description: "Paid on the higher of the cadastral value or sale price",
      notes: "Split between buyer and seller (traditionally)"
    },
    {
      name: "Notary Fees",
      rate: "0.25%",
      description: "Paid to notary for document authentication",
      notes: "Approximately $500-800 depending on property value"
    },
    {
      name: "Registration Fees",
      rate: "Fixed",
      description: "Public Registry recording fees",
      notes: "$300-500 for standard transactions"
    },
    {
      name: "Legal Fees",
      rate: "Variable",
      description: "Attorney fees for transaction handling",
      notes: "$1,500-3,000 depending on complexity"
    },
    {
      name: "Property Tax (Impuesto Territorial)",
      rate: "0.25%",
      description: "Annual property tax based on cadastral value",
      notes: "Paid annually, approximately $500-2,000/year"
    }
  ];

  const legalDocuments = [
    {
      title: "Purchase Agreement (Promesa de Compraventa)",
      description: "Binding contract outlining terms, price, and contingencies",
      required: true
    },
    {
      title: "Title Certificate (Certificado de Titulo)",
      description: "Official proof of ownership from Public Registry",
      required: true
    },
    {
      title: "Property Survey (Plano Catastral)",
      description: "Detailed map showing boundaries and measurements",
      required: true
    },
    {
      title: "Tax Clearance Certificate",
      description: "Proof that all property taxes are paid current",
      required: true
    },
    {
      title: "Utility Bills",
      description: "Recent bills proving active utility connections",
      required: false
    },
    {
      title: "Building Permits",
      description: "Documentation of legal construction and modifications",
      required: true
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
              Costa Rica Property<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Legal Guide
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Understanding your legal rights and obligations when buying property in Guanacaste.
              Expert guidance on Costa Rican property law, taxes, and due diligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Due Diligence
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Download Legal Checklist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Topics */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Legal Considerations</h2>
            <p className="text-xl text-slate-600">Essential knowledge for property buyers in Costa Rica</p>
          </div>

          <div className="space-y-12">
            {legalTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <div key={index} className="bg-slate-50 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{topic.title}</h3>
                  </div>

                  {topic.content && (
                    <p className="text-lg text-slate-700 mb-6">{topic.content}</p>
                  )}

                  {topic.sections && (
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {topic.sections.map((section, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                          <h4 className="text-lg font-bold text-slate-900 mb-3">{section.subtitle}</h4>
                          <p className="text-slate-600 mb-4">{section.content}</p>

                          <div className="space-y-3">
                            <div>
                              <h5 className="font-semibold text-green-700 mb-2">Benefits:</h5>
                              <ul className="space-y-1">
                                {section.benefits.map((benefit, j) => (
                                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-semibold text-amber-700 mb-2">Considerations:</h5>
                              <ul className="space-y-1">
                                {section.considerations.map((consideration, j) => (
                                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    {consideration}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {topic.requirements && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Requirements:</h4>
                      <ul className="space-y-2">
                        {topic.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.checklist && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Due Diligence Checklist:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {topic.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Taxes and Fees */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Taxes & Fees</h2>
            <p className="text-xl text-slate-300">Understanding the costs involved in Costa Rican property transactions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taxesAndFees.map((tax, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-700 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{tax.name}</h3>
                  <span className="text-cyan-400 font-bold text-lg">{tax.rate}</span>
                </div>
                <p className="text-slate-300 mb-3">{tax.description}</p>
                <p className="text-sm text-slate-400">{tax.notes}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-2xl p-8 border border-cyan-700/30">
            <div className="flex items-start gap-4">
              <DollarSign className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-4">Cost Estimation Example</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">$250,000 Property Purchase</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• Transfer Tax (1.5%): $3,750</li>
                      <li>• Notary Fees (0.25%): $625</li>
                      <li>• Registration: $400</li>
                      <li>• Legal Fees: $2,000</li>
                      <li>• <strong>Total Additional Costs: ~$6,775</strong></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">Annual Property Tax</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• Property Tax (0.25%): $625/year</li>
                      <li>• Municipal Services: $200-400/year</li>
                      <li>• Homeowners Association: $0-500/year</li>
                      <li>• <strong>Total Annual: ~$825-1,525</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Required Documents</h2>
            <p className="text-xl text-slate-600">Essential paperwork for your property transaction</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {legalDocuments.map((doc, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{doc.title}</h3>
                  {doc.required ? (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                      Required
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-slate-600">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Professional Services</h2>
            <p className="text-xl text-slate-600">Essential experts for your property transaction</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                role: "Costa Rican Real Estate Attorney",
                description: "Licensed attorney specializing in property law. Required for all transactions.",
                responsibilities: [
                  "Title verification and legal review",
                  "Document preparation and translation",
                  "Government registration and notary coordination",
                  "Tax calculation and payment arrangement"
                ]
              },
              {
                role: "Certified Translator",
                description: "Official translator for converting documents between languages.",
                responsibilities: [
                  "Legal document translation to Spanish",
                  "Notarization of translations",
                  "Apostille certification when required",
                  "Interpretation during meetings"
                ]
              },
              {
                role: "Property Inspector",
                description: "Certified inspector for structural and systems evaluation.",
                responsibilities: [
                  "Structural integrity assessment",
                  "Electrical and plumbing inspection",
                  "Termite and pest inspection",
                  "Well and septic system testing"
                ]
              },
              {
                role: "Surveyor",
                description: "Professional land surveyor for boundary verification.",
                responsibilities: [
                  "Property boundary measurement",
                  "Topographic mapping",
                  "Easement and right-of-way identification",
                  "GPS coordinate documentation"
                ]
              }
            ].map((service, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:bg-slate-100 transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.role}</h3>
                <p className="text-slate-700 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                      <span className="text-sm">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Protect Your Investment with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Expert Legal Guidance
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Don't risk your property investment. Work with licensed Costa Rican attorneys and get access to our AI legal assistant for instant answers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300">
              Find an Attorney
            </button>
            <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
              Ask Legal Questions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalGuide;