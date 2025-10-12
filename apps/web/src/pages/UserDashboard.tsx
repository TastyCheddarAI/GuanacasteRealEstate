import React, { useState, useEffect } from 'react';
import { Heart, Eye, Search, Clock, TrendingUp, Star, MapPin, Edit, Trash2, Plus, BarChart3, Users, DollarSign, Calendar, CheckCircle, AlertCircle, User, Settings, Bell, Filter, Home, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { savedPropertiesAPI, searchHistoryAPI, viewingHistoryAPI, userStatsAPI, recommendationsAPI } from '../services/api';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    savedProperties: 0,
    recentSearches: 0,
    viewedProperties: 0,
    recommendations: 0
  });
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [viewingHistory, setViewingHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load all dashboard data in parallel
      const [userStats, savedProps, searchHistory, viewHistory, recs] = await Promise.all([
        userStatsAPI.getUserStats(user.id),
        savedPropertiesAPI.getSavedProperties(user.id),
        searchHistoryAPI.getSearchHistory(user.id),
        viewingHistoryAPI.getViewingHistory(user.id),
        recommendationsAPI.getRecommendations(user.id)
      ]);

      setStats(userStats);
      setSavedProperties(savedProps || []);
      setRecentSearches(searchHistory || []);
      setViewingHistory(viewHistory || []);
      setRecommendations(recs || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const StatCard = ({ icon: Icon, title, value, change, color }: {
    icon: any;
    title: string;
    value: number | string;
    change?: number;
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-600">{title}</div>
    </div>
  );

  const SavedPropertyCard = ({ property }: { property: any }) => {
    const prop = property.property; // The API returns { property: {...}, created_at, ... }
    const imageUrl = prop?.media?.[0] ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${prop.media[0].storage_path}` : '';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex">
          <div className="w-32 h-24 bg-slate-200 flex-shrink-0">
            <img src={imageUrl} alt={prop?.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{prop?.title}</h3>
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{prop?.town}, Guanacaste</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">${prop?.price_numeric?.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{prop?.beds} bed • {prop?.baths} bath • {prop?.area_m2} m²</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Saved {new Date(property.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SearchHistoryCard = ({ search }: { search: any }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{search.query || 'Property Search'}</span>
            {search.saved && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
          </div>
          <div className="text-sm text-slate-600 mb-2">
            {search.filters ? JSON.stringify(search.filters) : 'No filters applied'}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{search.results_count || 0} results</span>
            <span>{new Date(search.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button className="bg-cyan-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors">
          Search Again
        </button>
      </div>
    </div>
  );

  const ViewingHistoryCard = ({ viewing }: { viewing: any }) => {
    const prop = viewing.property; // The API returns { property: {...}, created_at, ... }
    const imageUrl = prop?.media?.[0] ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${prop.media[0].storage_path}` : '';

    return (
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
          <img src={imageUrl} alt={prop?.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 mb-1">{prop?.title}</h4>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <MapPin className="w-4 h-4" />
            <span>{prop?.town}, Guanacaste</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">${prop?.price_numeric?.toLocaleString()}</div>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>{new Date(viewing.created_at).toLocaleDateString()}</div>
          <div>{viewing.time_spent_seconds ? `${Math.round(viewing.time_spent_seconds / 60)} min` : 'N/A'}</div>
        </div>
      </div>
    );
  };

  const RecommendationCard = ({ recommendation }: { recommendation: any }) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="relative">
        <img src={recommendation.image} alt={recommendation.title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {recommendation.match}% Match
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-2">{recommendation.title}</h3>
        <div className="flex items-center gap-1 text-slate-600 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{recommendation.location}</span>
        </div>
        <div className="text-lg font-bold text-slate-900 mb-2">${recommendation.price.toLocaleString()}</div>
        <div className="text-sm text-slate-600 mb-3">{recommendation.beds} bed • {recommendation.baths} bath • {recommendation.sqft} ft²</div>
        <div className="text-xs text-slate-500 mb-4">{recommendation.reason}</div>
        <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
          View Property
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Buyer Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your saved properties and search preferences</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">New Search</span>
                <span className="sm:hidden">Search</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'Buyer'}</h2>
                <p className="text-slate-600">Property buyer • Active since {new Date(profile?.created_at || '').toLocaleDateString()}</p>
              </div>
            </div>
            <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Heart}
            title="Saved Properties"
            value={stats.savedProperties}
            color="bg-red-500"
          />
          <StatCard
            icon={Search}
            title="Recent Searches"
            value={stats.recentSearches}
            color="bg-blue-500"
          />
          <StatCard
            icon={Eye}
            title="Properties Viewed"
            value={stats.viewedProperties}
            change={15}
            color="bg-green-500"
          />
          <StatCard
            icon={Star}
            title="Recommendations"
            value={stats.recommendations}
            color="bg-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, shortLabel: 'Overview' },
              { id: 'saved', label: 'Saved Properties', icon: Heart, shortLabel: 'Saved' },
              { id: 'searches', label: 'Search History', icon: Search, shortLabel: 'Searches' },
              { id: 'history', label: 'Viewing History', icon: Eye, shortLabel: 'History' },
              { id: 'recommendations', label: 'Recommendations', icon: Star, shortLabel: 'Recs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6 text-center">
                    <Search className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">New Property Search</h3>
                    <p className="text-sm text-slate-600 mb-4">Find your dream home in Guanacaste</p>
                    <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors">
                      Start Searching
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                    <Heart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">View Saved Properties</h3>
                    <p className="text-sm text-slate-600 mb-4">Review your favorite listings</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                      View Saved
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Ask AI Assistant</h3>
                    <p className="text-sm text-slate-600 mb-4">Get expert help with your search</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                      Ask AI
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">New search performed</div>
                        <p className="text-slate-700 text-sm">Found 24 oceanfront villas in Tamarindo matching your criteria</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">2 hours ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">Property saved</div>
                        <p className="text-slate-700 text-sm">Added "Modern Oceanfront Villa" to your favorites</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Saved Properties ({savedProperties.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg">
                      Available
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {savedProperties.map((property) => (
                    <SavedPropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'searches' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Recent Searches ({recentSearches.length})</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                    New Search
                  </button>
                </div>

                <div className="space-y-4">
                  {recentSearches.map((search) => (
                    <SearchHistoryCard key={search.id} search={search} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Viewing History ({viewingHistory.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All Time
                    </button>
                    <button className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg">
                      This Week
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {viewingHistory.map((viewing) => (
                    <ViewingHistoryCard key={viewing.id} viewing={viewing} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Personalized Recommendations ({recommendations.length})</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                    Refresh
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;