import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, Home, MessageSquare, BarChart3, Eye, Heart, Edit, Trash2, Plus, Clock, CheckCircle, AlertCircle, Star, MapPin, Camera, Settings, Bell, Phone, Mail, User, Briefcase, Target, Award, PieChart, Activity, Zap } from 'lucide-react';

const RealtorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalClients: 45,
    activeClients: 32,
    totalCommissions: 125000,
    pendingCommissions: 45000,
    totalLeads: 89,
    activeListings: 12,
    conversionRate: 24,
    avgResponseTime: '1.8 hours'
  };

  const clients = [
    {
      id: 1,
      name: 'John Smith',
      type: 'buyer',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      lastContact: '2024-01-15',
      budget: 500000,
      preferredLocation: 'Tamarindo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      type: 'seller',
      email: 'maria.garcia@email.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      lastContact: '2024-01-14',
      propertyValue: 750000,
      location: 'Nosara',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    },
    {
      id: 3,
      name: 'David Johnson',
      type: 'buyer',
      email: 'david.johnson@email.com',
      phone: '+1 (555) 345-6789',
      status: 'pending',
      lastContact: '2024-01-10',
      budget: 300000,
      preferredLocation: 'Playa Grande',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    }
  ];

  const commissions = [
    {
      id: 1,
      client: 'John Smith',
      property: 'Oceanfront Villa',
      amount: 25000,
      status: 'completed',
      date: '2024-01-10',
      type: 'sale'
    },
    {
      id: 2,
      client: 'Maria Garcia',
      property: 'Beachfront Condo',
      amount: 15000,
      status: 'pending',
      date: '2024-01-20',
      type: 'sale'
    },
    {
      id: 3,
      client: 'Robert Wilson',
      property: 'Mountain Retreat',
      amount: 8000,
      status: 'completed',
      date: '2024-01-05',
      type: 'rental'
    }
  ];

  const leads = [
    {
      id: 1,
      name: 'Sarah Davis',
      source: 'Website Inquiry',
      property: 'Modern Oceanfront Villa',
      message: 'Hi, I\'m interested in your listing. Can we schedule a viewing?',
      time: '2 hours ago',
      status: 'new',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mike Chen',
      source: 'Referral',
      property: 'Beachfront Condo',
      message: 'My friend recommended you. Looking for investment property.',
      time: '5 hours ago',
      status: 'contacted',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      source: 'Open House',
      property: 'Mountain View Cabin',
      message: 'Loved the open house! Questions about financing.',
      time: '1 day ago',
      status: 'qualified',
      priority: 'high'
    }
  ];

  const listings = [
    {
      id: 1,
      title: 'Modern Oceanfront Villa',
      location: 'Tamarindo, Guanacaste',
      price: 1450000,
      commission: 6.5,
      status: 'active',
      views: 234,
      inquiries: 8,
      daysOnMarket: 15,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300'
    },
    {
      id: 2,
      title: 'Beachfront Condo',
      location: 'Tamarindo Centro',
      price: 425000,
      commission: 5.0,
      status: 'active',
      views: 156,
      inquiries: 5,
      daysOnMarket: 22,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300'
    },
    {
      id: 3,
      title: 'Mountain View Cabin',
      location: 'Potrero',
      price: 285000,
      commission: 7.0,
      status: 'pending',
      views: 98,
      inquiries: 3,
      daysOnMarket: 8,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'
    }
  ];

  const analytics = {
    salesVolume: [45000, 52000, 48000, 61000, 55000, 67000],
    conversionRate: [18, 22, 19, 25, 23, 24],
    clientSatisfaction: 4.8,
    avgDaysOnMarket: 28,
    topSources: [
      { source: 'Website', leads: 45, percentage: 51 },
      { source: 'Referrals', leads: 23, percentage: 26 },
      { source: 'Open Houses', leads: 12, percentage: 13 },
      { source: 'Social Media', leads: 9, percentage: 10 }
    ]
  };

  const calendarEvents = [
    {
      id: 1,
      title: 'Property Showing - Oceanfront Villa',
      client: 'John Smith',
      date: '2024-01-16',
      time: '10:00 AM',
      type: 'showing',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Client Meeting - Maria Garcia',
      client: 'Maria Garcia',
      date: '2024-01-16',
      time: '2:00 PM',
      type: 'meeting',
      status: 'confirmed'
    },
    {
      id: 3,
      title: 'Open House - Beachfront Condo',
      client: null,
      date: '2024-01-17',
      time: '11:00 AM',
      type: 'open-house',
      status: 'scheduled'
    }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color, suffix = '' }: { icon: any, title: string, value: string | number, change?: number, color: string, suffix?: string }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}{suffix}</div>
      <div className="text-sm text-slate-600">{title}</div>
    </div>
  );

  const ClientCard = ({ client }: { client: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">{client.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span className="capitalize">{client.type}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              {client.type === 'buyer' ? (
                <div className="text-sm text-slate-600">Budget: ${client.budget?.toLocaleString()}</div>
              ) : (
                <div className="text-sm text-slate-600">Value: ${client.propertyValue?.toLocaleString()}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {client.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {client.phone}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {client.preferredLocation || client.location}
            </span>
            <span>Last contact: {client.lastContact}</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
              Contact
            </button>
            <button className="px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CommissionCard = ({ commission }: { commission: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">{commission.client}</h3>
          <p className="text-sm text-slate-600">{commission.property}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-slate-900">${commission.amount.toLocaleString()}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            commission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {commission.status}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{commission.date}</span>
        <span className="capitalize">{commission.type}</span>
      </div>
    </div>
  );

  const LeadCard = ({ lead }: { lead: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {lead.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">{lead.name}</div>
            <div className="text-sm text-slate-600">{lead.source} • {lead.property}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 mb-1">{lead.time}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            lead.priority === 'high' ? 'bg-red-100 text-red-700' :
            lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {lead.priority} priority
          </div>
        </div>
      </div>

      <p className="text-slate-700 mb-4">{lead.message}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
          lead.status === 'contacted' ? 'bg-purple-100 text-purple-700' :
          'bg-green-100 text-green-700'
        }`}>
          {lead.status}
        </span>
        <div className="flex gap-2">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
            Respond
          </button>
          <button className="px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors">
            <Clock className="w-4 h-4" />
          </button>
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
              <h1 className="text-3xl font-bold text-slate-900">Realtor Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage clients, commissions, and grow your business</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Client
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Clients"
            value={stats.totalClients}
            change={12}
            color="bg-blue-500"
          />
          <StatCard
            icon={DollarSign}
            title="Total Commissions"
            value={`$${(stats.totalCommissions / 1000).toFixed(0)}k`}
            change={18}
            color="bg-green-500"
          />
          <StatCard
            icon={Target}
            title="Conversion Rate"
            value={stats.conversionRate}
            change={5}
            color="bg-purple-500"
            suffix="%"
          />
          <StatCard
            icon={Clock}
            title="Avg Response"
            value={stats.avgResponseTime}
            color="bg-orange-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'commissions', label: 'Commissions', icon: DollarSign },
              { id: 'leads', label: 'Leads', icon: MessageSquare },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
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
                    <h3 className="font-semibold text-slate-900 mb-2">Add New Client</h3>
                    <p className="text-sm text-slate-600 mb-4">Expand your client database</p>
                    <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors">
                      Get Started
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                    <Home className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">List Property</h3>
                    <p className="text-sm text-slate-600 mb-4">Add exclusive listings</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                      Add Listing
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">View Analytics</h3>
                    <p className="text-sm text-slate-600 mb-4">Track your performance</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                      View Report
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{lead.name}</span>
                            <span className="text-sm text-slate-600">inquired about</span>
                            <span className="font-semibold text-slate-900">{lead.property}</span>
                          </div>
                          <p className="text-slate-700 text-sm mb-2">{lead.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{lead.time}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              lead.status === 'contacted' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                        <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm">
                          Respond
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Client Management ({clients.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg">
                      Active ({clients.filter(c => c.status === 'active').length})
                    </button>
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      Buyers ({clients.filter(c => c.type === 'buyer').length})
                    </button>
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      Sellers ({clients.filter(c => c.type === 'seller').length})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {clients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Commission Tracking</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg">
                      Completed (${commissions.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                    </button>
                    <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                      Pending (${commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <CommissionCard key={commission.id} commission={commission} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Lead Management ({leads.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">
                      New ({leads.filter(l => l.status === 'new').length})
                    </button>
                    <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                      Contacted ({leads.filter(l => l.status === 'contacted').length})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Property Listings ({listings.length})</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Listing
                  </button>
                </div>

                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                              <div className="text-sm text-slate-600">{listing.commission}% commission</div>
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
                            <span>{listing.daysOnMarket} days on market</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Commission: ${(listing.price * listing.commission / 100).toLocaleString()}</span>
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
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Performance Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{analytics.clientSatisfaction}</div>
                    <div className="text-sm text-slate-600">Client Satisfaction</div>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(analytics.clientSatisfaction) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{analytics.avgDaysOnMarket}</div>
                    <div className="text-sm text-slate-600">Avg Days on Market</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">${(analytics.salesVolume.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}k</div>
                    <div className="text-sm text-slate-600">Monthly Sales Volume</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{analytics.conversionRate[analytics.conversionRate.length - 1]}%</div>
                    <div className="text-sm text-slate-600">Conversion Rate</div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Sales Volume Trend</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Sales volume chart would go here</p>
                        <p className="text-sm text-slate-500">Last 6 months: {analytics.salesVolume.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Conversion Rate</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Conversion rate chart would go here</p>
                        <p className="text-sm text-slate-500">Monthly rates: {analytics.conversionRate.join(', ')}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Sources */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Lead Sources</h4>
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
                          <span className="text-sm text-slate-600 w-12 text-right">{source.leads}</span>
                          <span className="text-sm text-slate-500 w-8 text-right">({source.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Calendar & Appointments</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Schedule Event
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Calendar Integration</h4>
                    <p className="text-slate-600 mb-6">Full calendar view with showings, meetings, and reminders would be displayed here</p>
                    <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
                      Connect Calendar
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Upcoming Events</h4>
                  <div className="space-y-4">
                    {calendarEvents.map((event) => (
                      <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-semibold text-slate-900 mb-1">{event.title}</h5>
                            {event.client && <p className="text-sm text-slate-600">Client: {event.client}</p>}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            event.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {event.status}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.type === 'showing' ? 'bg-blue-100 text-blue-700' :
                            event.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {event.type.replace('-', ' ')}
                          </span>
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

export default RealtorDashboard;