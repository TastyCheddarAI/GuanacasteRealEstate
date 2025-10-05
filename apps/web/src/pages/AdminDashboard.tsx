import React, { useState } from 'react';
import { Users, Eye, TrendingUp, DollarSign, Shield, AlertTriangle, Settings, BarChart3, UserCheck, UserX, Home, MessageSquare, Flag, CheckCircle, XCircle, Edit, Trash2, Plus, Calendar, Clock, Activity, Globe, Mail, Phone } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalProperties: 456,
    totalRevenue: 2345000,
    flaggedContent: 23,
    pendingReviews: 12,
    systemUptime: '99.9%',
    avgResponseTime: '1.2s'
  };

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      role: 'buyer',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-10-05',
      properties: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria@example.com',
      role: 'owner',
      status: 'active',
      joinDate: '2024-02-01',
      lastLogin: '2024-10-04',
      properties: 3,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      email: 'carlos@example.com',
      role: 'realtor',
      status: 'suspended',
      joinDate: '2024-01-20',
      lastLogin: '2024-09-28',
      properties: 15,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-10-05',
      properties: 0,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40'
    }
  ];

  const flaggedContent = [
    {
      id: 1,
      type: 'property',
      title: 'Suspicious High Price Listing',
      reportedBy: 'User #123',
      reason: 'Price seems inflated',
      status: 'pending',
      reportedAt: '2024-10-05T10:30:00Z',
      content: 'Oceanfront villa listed at $5M in Tamarindo'
    },
    {
      id: 2,
      type: 'user',
      title: 'Spam Account',
      reportedBy: 'Multiple users',
      reason: 'Sending unsolicited messages',
      status: 'reviewed',
      reportedAt: '2024-10-04T14:20:00Z',
      content: 'User sending bulk messages to all listings'
    },
    {
      id: 3,
      type: 'property',
      title: 'Duplicate Listing',
      reportedBy: 'User #456',
      reason: 'Same property listed multiple times',
      status: 'pending',
      reportedAt: '2024-10-03T09:15:00Z',
      content: 'Same condo appears in 3 different locations'
    }
  ];

  const analytics = {
    userGrowth: [120, 145, 167, 189, 234, 267, 289],
    revenueByMonth: [45000, 52000, 48000, 61000, 55000, 67000, 72000],
    topLocations: [
      { location: 'Tamarindo', properties: 89, users: 234, revenue: 1250000 },
      { location: 'Nosara', properties: 67, users: 189, revenue: 890000 },
      { location: 'Playa Grande', properties: 45, users: 156, revenue: 756000 },
      { location: 'Flamingo', properties: 34, users: 123, revenue: 623000 }
    ],
    userActivity: {
      dailyActive: 892,
      weeklyActive: 1456,
      monthlyActive: 2341,
      newSignups: 23
    }
  };

  const platformSettings = [
    { key: 'site_name', value: 'Guanacaste Real', type: 'text', description: 'Platform display name' },
    { key: 'commission_rate', value: '0', type: 'number', description: 'Default commission rate (%)' },
    { key: 'max_free_photos', value: '10', type: 'number', description: 'Maximum photos for free listings' },
    { key: 'featured_price', value: '99', type: 'number', description: 'Monthly featured listing price ($)' },
    { key: 'email_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode' }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color }: { icon: any, title: string, value: string | number, change?: number, color: string }) => (
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

  const UserCard = ({ user }: { user: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-semibold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full ${
            user.status === 'active' ? 'bg-green-100 text-green-700' :
            user.status === 'suspended' ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {user.status}
          </div>
          <div className="text-xs text-slate-500 mt-1 capitalize">{user.role}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
        <div>
          <div className="font-medium">Joined</div>
          <div>{new Date(user.joinDate).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="font-medium">Last Login</div>
          <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="font-medium">Properties</div>
          <div>{user.properties}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Edit className="w-4 h-4 inline mr-1" />
          Edit
        </button>
        <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          user.status === 'active'
            ? 'bg-red-100 hover:bg-red-200 text-red-700'
            : 'bg-green-100 hover:bg-green-200 text-green-700'
        }`}>
          {user.status === 'active' ? <UserX className="w-4 h-4 inline mr-1" /> : <UserCheck className="w-4 h-4 inline mr-1" />}
          {user.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      </div>
    </div>
  );

  const FlaggedContentCard = ({ item }: { item: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              item.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{item.content}</p>
          <div className="text-xs text-slate-500">
            Reported by {item.reportedBy} • {new Date(item.reportedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Approve
        </button>
        <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
          <XCircle className="w-4 h-4 inline mr-1" />
          Remove
        </button>
        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Eye className="w-4 h-4 inline mr-1" />
          View
        </button>
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
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Platform management and oversight</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Settings
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={12}
            color="bg-blue-500"
          />
          <StatCard
            icon={UserCheck}
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            change={8}
            color="bg-green-500"
          />
          <StatCard
            icon={Home}
            title="Properties"
            value={stats.totalProperties}
            change={15}
            color="bg-purple-500"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
            change={23}
            color="bg-emerald-500"
          />
          <StatCard
            icon={Flag}
            title="Flagged"
            value={stats.flaggedContent}
            change={-5}
            color="bg-red-500"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingReviews}
            color="bg-orange-500"
          />
          <StatCard
            icon={Activity}
            title="Uptime"
            value={stats.systemUptime}
            color="bg-cyan-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Response"
            value={stats.avgResponseTime}
            color="bg-indigo-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'moderation', label: 'Content Moderation', icon: Shield },
              { id: 'settings', label: 'Platform Settings', icon: Settings }
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
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">User Management</h3>
                    <p className="text-sm text-slate-600 mb-4">Manage user accounts and roles</p>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Manage Users
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">View Analytics</h3>
                    <p className="text-sm text-slate-600 mb-4">Platform performance metrics</p>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      View Reports
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
                    <Shield className="w-8 h-8 text-red-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Content Moderation</h3>
                    <p className="text-sm text-slate-600 mb-4">Review flagged content</p>
                    <button
                      onClick={() => setActiveTab('moderation')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      Review Content
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 text-center">
                    <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Platform Settings</h3>
                    <p className="text-sm text-slate-600 mb-4">Configure system options</p>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Configure
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">New user registration</div>
                        <p className="text-slate-700 text-sm">Sarah Johnson joined as a buyer</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">2 hours ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Flag className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Content flagged</div>
                        <p className="text-slate-700 text-sm">Property listing reported for suspicious pricing</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">4 hours ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Revenue milestone</div>
                        <p className="text-slate-700 text-sm">Monthly revenue exceeded $70,000</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">User Management ({users.length})</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      <option>All Roles</option>
                      <option>Buyers</option>
                      <option>Owners</option>
                      <option>Realtors</option>
                      <option>Admins</option>
                    </select>
                    <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Suspended</option>
                      <option>Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Charts Placeholder */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">User Growth (Last 7 Days)</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Chart visualization would go here</p>
                        <p className="text-sm text-slate-500">Growth: {analytics.userGrowth.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Revenue (Last 7 Months)</h4>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Chart visualization would go here</p>
                        <p className="text-sm text-slate-500">Revenue: ${analytics.revenueByMonth.map(r => (r / 1000).toFixed(0) + 'K').join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Locations */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Top Locations by Activity</h4>
                  <div className="space-y-4">
                    {analytics.topLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-cyan-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{location.location}</div>
                            <div className="text-sm text-slate-600">{location.properties} properties • {location.users} users</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${(location.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-sm text-slate-500">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Activity Summary */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-slate-900">{analytics.userActivity.dailyActive}</div>
                    <div className="text-sm text-slate-600">Daily Active Users</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-slate-900">{analytics.userActivity.weeklyActive}</div>
                    <div className="text-sm text-slate-600">Weekly Active Users</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-slate-900">{analytics.userActivity.monthlyActive}</div>
                    <div className="text-sm text-slate-600">Monthly Active Users</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.userActivity.newSignups}</div>
                    <div className="text-sm text-slate-600">New Signups Today</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Content Moderation ({flaggedContent.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg">
                      Pending ({flaggedContent.filter(f => f.status === 'pending').length})
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      Reviewed
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <FlaggedContentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Platform Settings</h3>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                    Save Changes
                  </button>
                </div>

                <div className="space-y-4">
                  {platformSettings.map((setting) => (
                    <div key={setting.key} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{setting.key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                          <p className="text-sm text-slate-600">{setting.description}</p>
                        </div>
                        <div className="w-64">
                          {setting.type === 'boolean' ? (
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={setting.value === 'true'}
                                className="sr-only"
                              />
                              <div className="w-10 h-6 bg-slate-200 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-transform"></div>
                              </div>
                            </label>
                          ) : setting.type === 'number' ? (
                            <input
                              type="number"
                              defaultValue={setting.value}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                            />
                          ) : (
                            <input
                              type="text"
                              defaultValue={setting.value}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
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

export default AdminDashboard;