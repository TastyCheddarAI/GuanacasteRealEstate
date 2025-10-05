import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Filter, Tag, Clock, User, ChevronRight, Sparkles, MessageSquare, Star } from 'lucide-react';
import { Button } from '@guanacaste-real/ui';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const categories = [
    { id: 'all', label: 'All Topics', count: 247 },
    { id: 'buying', label: 'Buying Property', count: 89 },
    { id: 'selling', label: 'Selling Property', count: 67 },
    { id: 'legal', label: 'Legal & Regulations', count: 45 },
    { id: 'finance', label: 'Financing', count: 32 },
    { id: 'taxes', label: 'Taxes & Fees', count: 28 },
    { id: 'permits', label: 'Permits & Construction', count: 21 },
    { id: 'investment', label: 'Investment Guide', count: 19 }
  ];

  const articles = [
    {
      id: 1,
      title: 'Complete Guide to Buying Property in Costa Rica',
      excerpt: 'Everything you need to know about the property buying process, from initial research to closing.',
      category: 'buying',
      author: 'Legal Team',
      readTime: '12 min read',
      lastUpdated: '2024-01-15',
      featured: true,
      tags: ['Beginner', 'Process', 'Legal']
    },
    {
      id: 2,
      title: 'Understanding Maritime Concessions vs Titled Land',
      excerpt: 'The key differences between property ownership types and what it means for your investment.',
      category: 'legal',
      author: 'Property Experts',
      readTime: '8 min read',
      lastUpdated: '2024-01-12',
      featured: true,
      tags: ['Legal', 'Title Types', 'Investment']
    },
    {
      id: 3,
      title: 'Costa Rican Property Taxes: What You Need to Know',
      excerpt: 'Complete breakdown of property taxes, transfer taxes, and annual obligations.',
      category: 'taxes',
      author: 'Finance Team',
      readTime: '6 min read',
      lastUpdated: '2024-01-10',
      tags: ['Taxes', 'Finance', 'Legal']
    },
    {
      id: 4,
      title: 'Due Diligence Checklist for Property Buyers',
      excerpt: 'Essential steps to verify property legitimacy and avoid common pitfalls.',
      category: 'buying',
      author: 'Compliance Officer',
      readTime: '10 min read',
      lastUpdated: '2024-01-08',
      tags: ['Due Diligence', 'Safety', 'Legal']
    },
    {
      id: 5,
      title: 'Construction Permits and Building Regulations',
      excerpt: 'Navigate the permit process for renovations and new construction in Guanacaste.',
      category: 'permits',
      author: 'Building Experts',
      readTime: '15 min read',
      lastUpdated: '2024-01-05',
      tags: ['Construction', 'Permits', 'Legal']
    },
    {
      id: 6,
      title: 'Investment Opportunities in Guanacaste Real Estate',
      excerpt: 'Market analysis and investment strategies for Costa Rica\'s Gold Coast.',
      category: 'investment',
      author: 'Market Analysts',
      readTime: '9 min read',
      lastUpdated: '2024-01-03',
      tags: ['Investment', 'Market', 'Strategy']
    }
  ];

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort articles
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
        break;
      case 'readTime':
        filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredArticles = articles.filter(article => article.featured);

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
              Knowledge <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Base</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive resource for Costa Rica real estate. Expert answers, legal guidance,
              and practical advice for every step of your property journey.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Articles</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <div key={article.id} className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search Results */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Filter by:</span>
              </div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-900">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="readTime">Read Time</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-slate-600">
              Showing {filteredArticles.length} of {articles.length} articles
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium text-cyan-600 capitalize">
                      {categories.find(c => c.id === article.category)?.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </div>
                    </div>
                    <div className="text-xs">
                      Updated {new Date(article.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    Read Article
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Have a Specific Question?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our AI Property Assistant has answers to thousands of specific questions about Costa Rica real estate.
            </p>
            <Button
              onClick={() => {
                const event = new CustomEvent('openAIAssistant');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeBase;