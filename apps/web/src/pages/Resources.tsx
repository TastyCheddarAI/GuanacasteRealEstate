import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Scale, FileText, CheckSquare, Newspaper, ArrowRight, Sparkles, Shield, Users, Award, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui';

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const resourceCategories = [
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      description: 'Comprehensive guides and answers to common questions',
      icon: BookOpen,
      path: '/knowledge-base',
      color: 'from-blue-500 to-cyan-600',
      features: ['500+ Articles', 'Expert Answers', 'Updated Daily']
    },
    {
      id: 'costa-rica-laws',
      title: 'Costa Rica Laws',
      description: 'Complete legal framework for property ownership',
      icon: Scale,
      path: '/costa-rica-laws',
      color: 'from-emerald-500 to-green-600',
      features: ['Property Laws', 'Tax Regulations', 'Environmental Rules']
    },
    {
      id: 'title-types',
      title: 'Title Types',
      description: 'Understanding titled vs concession properties',
      icon: FileText,
      path: '/title-types',
      color: 'from-purple-500 to-pink-600',
      features: ['Title Comparison', 'Legal Rights', 'Transfer Process']
    },
    {
      id: 'due-diligence',
      title: 'Due Diligence',
      description: 'Complete checklist for property verification',
      icon: CheckSquare,
      path: '/due-diligence',
      color: 'from-orange-500 to-red-600',
      features: ['Legal Checks', 'Property Inspection', 'AI Assistance']
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Latest insights and market updates',
      icon: Newspaper,
      path: '/blog',
      color: 'from-indigo-500 to-purple-600',
      features: ['Market News', 'Expert Insights', 'Success Stories']
    }
  ];

  const quickLinks = [
    { title: 'Buying Process Guide', path: '/buying-process', icon: ArrowRight },
    { title: 'Legal Guide', path: '/legal-guide', icon: ArrowRight },
    { title: 'Free Listings', path: '/free-listings', icon: ArrowRight },
    { title: 'AI Property Assistant', action: 'openAI', icon: Sparkles }
  ];

  const stats = [
    { label: 'Properties Verified', value: '2,500+', icon: Shield },
    { label: 'Legal Documents Reviewed', value: '15,000+', icon: FileText },
    { label: 'Happy Customers', value: '1,200+', icon: Users },
    { label: 'Expert Articles', value: '300+', icon: BookOpen }
  ];

  const handleQuickLink = (link: any) => {
    if (link.action === 'openAI') {
      const event = new CustomEvent('openAIAssistant');
      window.dispatchEvent(event);
    } else {
      navigate(link.path);
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
              Your Complete Guide to<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Costa Rica Real Estate
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about buying, selling, and owning property in Guanacaste.
              Expert knowledge, legal guidance, and AI-powered assistance.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search our knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Explore Our Resources</h2>
            <p className="text-xl text-slate-600">Comprehensive guides and tools for every step of your real estate journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => navigate(category.path)}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200"
                >
                  <div className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{category.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {category.features.map((feature, i) => (
                        <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cyan-600 font-semibold group-hover:text-cyan-700">Explore</span>
                      <ChevronRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Quick Access</h2>
            <p className="text-slate-600">Jump straight to the information you need</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleQuickLink(link)}
                  className="group bg-gradient-to-br from-slate-50 to-slate-100 hover:from-cyan-50 hover:to-blue-50 rounded-xl p-6 border border-slate-200 hover:border-cyan-300 transition-all duration-300 text-left"
                >
                  <Icon className="w-8 h-8 text-cyan-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
                    {link.title}
                  </h3>
                  <div className="flex items-center text-cyan-600 font-semibold">
                    <span>Go</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make Your Move?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Get personalized assistance from our AI Property Assistant or browse our verified listings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/free-listings')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              Browse Properties
            </Button>
            <Button
              onClick={() => {
                const event = new CustomEvent('openAIAssistant');
                window.dispatchEvent(event);
              }}
              variant="outline"
              className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;