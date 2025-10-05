import React, { useState, useMemo } from 'react';
import { Newspaper, Tag, Clock, User, Calendar, Search, Filter, TrendingUp, Star, ArrowRight, ChevronRight, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Button } from '@guanacaste-real/ui';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', label: 'All Posts', count: 89 },
    { id: 'market-insights', label: 'Market Insights', count: 24 },
    { id: 'legal-updates', label: 'Legal Updates', count: 18 },
    { id: 'buyer-guides', label: 'Buyer Guides', count: 15 },
    { id: 'seller-tips', label: 'Seller Tips', count: 12 },
    { id: 'lifestyle', label: 'Lifestyle', count: 10 },
    { id: 'investment', label: 'Investment', count: 8 },
    { id: 'success-stories', label: 'Success Stories', count: 6 }
  ];

  const featuredPosts = [
    {
      id: 1,
      title: '2024 Guanacaste Real Estate Market Report',
      excerpt: 'Comprehensive analysis of market trends, pricing, and investment opportunities in Costa Rica\'s Gold Coast.',
      category: 'market-insights',
      author: 'Market Analytics Team',
      readTime: '8 min read',
      publishedAt: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800',
      featured: true,
      trending: true,
      tags: ['Market Report', '2024', 'Trends']
    },
    {
      id: 2,
      title: 'New Maritime Zone Regulations: What Property Owners Need to Know',
      excerpt: 'Important updates to coastal property regulations and compliance requirements.',
      category: 'legal-updates',
      author: 'Legal Department',
      readTime: '6 min read',
      publishedAt: '2024-01-12',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
      featured: true,
      tags: ['Legal', 'Maritime', 'Regulations']
    }
  ];

  const blogPosts = [
    {
      id: 3,
      title: 'Complete Guide to Buying Property in Tamarindo',
      excerpt: 'Step-by-step guide for first-time buyers in one of Guanacaste\'s most popular beach towns.',
      category: 'buyer-guides',
      author: 'Sarah Johnson',
      readTime: '12 min read',
      publishedAt: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600',
      trending: false,
      tags: ['Tamarindo', 'Buying Guide', 'Beach Towns']
    },
    {
      id: 4,
      title: 'Maximizing Your Property\'s Rental Income',
      excerpt: 'Strategies for property owners looking to optimize rental revenue in the tourism market.',
      category: 'investment',
      author: 'Investment Team',
      readTime: '10 min read',
      publishedAt: '2024-01-08',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      trending: true,
      tags: ['Rental Income', 'Investment', 'Tourism']
    },
    {
      id: 5,
      title: 'Costa Rican Property Tax Changes for 2024',
      excerpt: 'Understanding the latest property tax reforms and their impact on foreign owners.',
      category: 'legal-updates',
      author: 'Tax Specialist',
      readTime: '7 min read',
      publishedAt: '2024-01-05',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      trending: false,
      tags: ['Taxes', '2024', 'Foreign Owners']
    },
    {
      id: 6,
      title: 'From Dream to Reality: A Family\'s Journey to Nosara',
      excerpt: 'Real story of how one family found their perfect Costa Rican lifestyle.',
      category: 'success-stories',
      author: 'Nosara Resident',
      readTime: '5 min read',
      publishedAt: '2024-01-03',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      trending: false,
      tags: ['Success Story', 'Nosara', 'Lifestyle']
    },
    {
      id: 7,
      title: 'Sustainable Living in Guanacaste: Eco-Friendly Properties',
      excerpt: 'Exploring environmentally conscious properties and sustainable development trends.',
      category: 'lifestyle',
      author: 'Sustainability Expert',
      readTime: '9 min read',
      publishedAt: '2023-12-28',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600',
      trending: false,
      tags: ['Sustainable', 'Eco-Friendly', 'Green Living']
    },
    {
      id: 8,
      title: 'Pricing Your Property: Current Market Values',
      excerpt: 'Understanding current market conditions and how to price your property competitively.',
      category: 'seller-tips',
      author: 'Pricing Specialist',
      readTime: '11 min read',
      publishedAt: '2023-12-25',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      trending: false,
      tags: ['Pricing', 'Market Value', 'Selling']
    }
  ];

  const allPosts = [...featuredPosts, ...blogPosts];

  const filteredPosts = useMemo(() => {
    let filtered = allPosts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'readTime':
        filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
        break;
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const trendingPosts = allPosts.filter(post => post.trending);

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
              Guanacaste <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Expert insights, market analysis, and practical advice for Costa Rica real estate.
              Stay informed with the latest trends and opportunities.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, insights, and guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Articles</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <div key={post.id} className="group bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        FEATURED
                      </span>
                    </div>
                    {post.trending && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          TRENDING
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-cyan-600 capitalize">
                        {categories.find(c => c.id === post.category)?.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Posts */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Category:</span>
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
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="readTime">Read Time</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-slate-600">
              Showing {filteredPosts.length} of {allPosts.length} articles
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {post.trending && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        HOT
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium text-cyan-600 capitalize">
                      {categories.find(c => c.id === post.category)?.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 mb-4 line-clamp-3 text-sm">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600">Try adjusting your search terms or category filters</p>
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-12">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
                Load More Articles
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Stay Updated</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Get the latest market insights, legal updates, and expert advice delivered to your inbox.
              Join 5,000+ property enthusiasts who stay ahead of the curve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-4">No spam, unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;