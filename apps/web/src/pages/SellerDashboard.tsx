import React, { useState } from 'react';
import { Home, Eye, Heart, MessageSquare, TrendingUp, Calendar, Edit, Trash2, Plus, BarChart3, Users, DollarSign, Clock, CheckCircle, AlertCircle, Star, MapPin, Camera, Settings, Bell } from 'lucide-react';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalListings: 3,
    activeListings: 3,
    totalViews: 1247,
    totalInquiries: 23,
    totalSaves: 89,
    avgResponseTime: '2.3 hours'
  };

  const listings = [
    {
      id: 1,
      title: 'Modern Oceanfront Villa',
      location: 'Tamarindo, Guanacaste',
      price: 1450000,
      status: 'active',
      views: 234,
      inquiries: 8,
      saves: 45,
      listedDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300',
      featured: true
    },
    {
      id: 2,
      title: 'Beachfront Condo',
      location: 'Tamarindo Centro',
      price: 425000,
      status: 'active',
      views: 156,
      inquiries: 5,
      saves: 23,
      listedDate: '2024-02-01',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300',
      featured: false
    },
    {
      id: 3,
      title: 'Mountain View Cabin',
      location: 'Potrero',
      price: 285000,
      status: 'active',
      views: 98,
      inquiries: 3,
      saves: 21,
      listedDate: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300',
      featured: false
    }
  ];

  const recentInquiries = [
    {
      id: 1,
      property: 'Modern Oceanfront Villa',
      buyer: 'John Smith',
      message: 'Hi, I\'m interested in your property. Can we schedule a viewing?',
      time: '2 hours ago',
      status: 'unread'
    },
    {
      id: 2,
      property: 'Beachfront Condo',
      buyer: 'Maria Garcia',
      message: 'Is the price negotiable? I\'d like to make an offer.',
      time: '5 hours ago',
      status: 'read'
    },
    {
      id: 3,
      property: 'Modern Oceanfront Villa',
      buyer: 'David Johnson',
      message: 'Can you provide more details about the utilities?',
      time: '1 day ago',
      status: 'replied'
    }
  ];

  const analytics = {
    viewsByDay: [12, 19, 15, 25, 22, 18, 14],
    inquiriesByDay: [1, 2, 1, 3, 2, 1, 0],
    topSources: [
      { source: 'Direct Search', views: 456, percentage: 36 },
      { source: 'Social Media', views: 312, percentage: 25 },
      { source: 'Email Shares', views: 234, percentage: 19 },
      { source: 'Realtor Referrals', views: 198, percentage: 16 },
      { source: 'Other', views: 47, percentage: 4 }
    ]
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
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

  const ListingCard = ({ listing }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex">
        <div className="w-32 h-24 bg-slate-200 flex-shrink-0">
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">{listing.title}</h3>
              <div className="flex items-center gap-1 text-slate-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">${listing.price.toLocaleString()}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {listing.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {listing.views} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {listing.inquiries} inquiries
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {listing.saves} saves
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Listed {listing.listedDate}</span>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your properties and track performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                List New Property
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Home}
            title="Total Listings"
            value={stats.totalListings}
            color="bg-blue-500"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            change={12}
            color="bg-green-500"
          />
          <StatCard
            icon={MessageSquare}
            title="Inquiries"
            value={stats.totalInquiries}
            change={8}
            color="bg-purple-500"
          />
          <StatCard
            icon={Heart}
            title="Saves"
            value={stats.totalSaves}
            change={15}
            color="bg-red-500"
          />
          <StatCard
            icon={Clock}
            title="Avg Response"
            value={stats.avgResponseTime}
            color="bg-orange-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Active Listings"
            value={stats.activeListings}
            color="bg-cyan-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'listings', label: 'My Listings', icon: Home },
              { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6 text-center">
                    <Plus className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">List New Property</h3>
                    <p className="text-sm text-slate-600 mb-4">Add another property to your portfolio</p>
                    <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors">
                      Get Started
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                    <Star className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Upgrade to Featured</h3>
                    <p className="text-sm text-slate-600 mb-4">Get 5x more visibility for $99/mo</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                      Learn More
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">View Analytics</h3>
                    <p className="text-sm text-slate-600 mb-4">Detailed insights on your listings</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                      View Report
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentInquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {inquiry.buyer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{inquiry.buyer}</span>
                            <span className="text-sm text-slate-600">inquired about</span>
                            <span className="font-semibold text-slate-900">{inquiry.property}</span>
                          </div>
                          <p className="text-slate-700 text-sm mb-2">{inquiry.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{inquiry.time}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              inquiry.status === 'unread' ? 'bg-blue-100 text-blue-700' :
                              inquiry.status === 'read' ? 'bg-slate-100 text-slate-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {inquiry.status}
                            </span>
                          </div>
                        </div>
                        <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm">
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">My Listings ({listings.length})</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Listing
                  </button>
                </div>

                <div className="space-y-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Recent Inquiries ({recentInquiries.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg">
                      Unread (1)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {inquiry.buyer.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{inquiry.buyer}</div>
                            <div className="text-sm text-slate-600">Interested in: {inquiry.property}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 mb-1">{inquiry.time}</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            inquiry.status === 'unread' ? 'bg-blue-100 text-blue-700' :
                            inquiry.status === 'read' ? 'bg-slate-100 text-slate-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-700 mb-4">{inquiry.message}</p>

                      <div className="flex gap-3">
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
                          Reply
                        </button>
                        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                          Mark as Read
                        </button>
                        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                          View Property
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Charts Placeholder */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Views This Week</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Chart visualization would go here</p>
                        <p className="text-sm text-slate-500">Views: {analytics.viewsByDay.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Inquiries This Week</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Chart visualization would go here</p>
                        <p className="text-sm text-slate-500">Inquiries: {analytics.inquiriesByDay.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Sources */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Traffic Sources</h4>
                  <div className="space-y-4">
                    {analytics.topSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                          </div>
                          <span className="text-slate-900">{source.source}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-cyan-500 h-2 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 w-12 text-right">{source.views}</span>
                          <span className="text-sm text-slate-500 w-8 text-right">({source.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;