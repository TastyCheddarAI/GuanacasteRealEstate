import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize, Calendar, Heart, Share2, Phone, Mail, MessageSquare, Star,
  ChevronLeft, ChevronRight, Camera, Shield, Check, Clock, Award, Users, ExternalLink,
  Zap, Waves, Home, Car, Wifi, Mountain, Eye, DollarSign, Ruler, Compass, Play, Pause,
  Download, Calendar as CalendarIcon, BarChart3, TrendingUp, Bell, Sparkles, FileText,
  Video, Image, Settings, Filter, Search, X, CheckCircle, AlertCircle, Crown
} from 'lucide-react';
import { Button } from '@guanacaste-real/ui';
import AIPropertyAssistant from '../components/AIPropertyAssistant';

const OwnerFeaturedPropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [leadNotifications, setLeadNotifications] = useState(true);

  // Enhanced property data with premium features
  const property = {
    id: 1,
    title: 'Premium Oceanfront Villa - Owner Featured',
    location: 'Tamarindo, Guanacaste',
    price: 1450000,
    beds: 4,
    baths: 4.5,
    sqft: 3800,
    lot: 2400,
    yearBuilt: 2022,
    featured: true,
    priorityPlacement: true,
    analytics: {
      views: 1247,
      saves: 89,
      inquiries: 23,
      shares: 15,
      avgTimeOnPage: '4:32',
      conversionRate: 12.5
    },
    description: `🏆 **OWNER FEATURED LISTING** - Premium Oceanfront Villa with Unmatched Luxury

This extraordinary oceanfront villa represents the pinnacle of luxury living in Tamarindo. As an Owner Featured listing, this property enjoys premium placement, unlimited AI concierge support, and advanced marketing tools designed to sell faster.

**✨ PREMIUM FEATURES INCLUDED:**
• Priority search placement across all platforms
• Unlimited professional photography and virtual tours
• 24/7 AI concierge for instant buyer questions
• Automated lead routing and notifications
• PDF brochure generation and direct downloads
• Calendar booking integration for showings
• Advanced analytics dashboard for performance tracking

**🏠 PROPERTY HIGHLIGHTS:**
• Direct oceanfront with breathtaking panoramic views
• Infinity pool overlooking the Pacific Ocean
• Gourmet kitchen with top-tier appliances
• Master suite with private balcony and spa bathroom
• Smart home technology throughout
• 24/7 security system with camera integration
• Walking distance to Tamarindo's vibrant town center

**📊 MARKET INTELLIGENCE:**
This property is positioned in the top 5% of Tamarindo listings with a projected 15% annual appreciation rate. Similar properties in the area have sold within 45 days at full asking price.

**🎯 BUYER CONVENIENCE:**
• Schedule virtual tours instantly
• Download professional PDF brochures
• Connect with AI assistant for detailed questions
• Book in-person showings with calendar integration
• Receive real-time market updates and comparables`,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200'
    ],
    videos: [
      { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', title: 'Full Property Tour' },
      { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', title: 'Ocean View Showcase' }
    ],
    features: [
      'Ocean View', 'Pool', 'Titled Land', 'Fiber Internet', 'Walk to Beach',
      'New Construction', 'Air Conditioning', 'Security System', 'Garage', 'Garden',
      'Smart Home', 'Wine Cellar', 'Home Theater', 'Gym', 'Spa Bathroom'
    ],
    utilities: {
      water: 'AYA (National Water)',
      electric: 'ICE',
      internet: 'Fiber available',
      access: 'Paved road'
    },
    legal: {
      titleType: 'Titled',
      planoCatastrado: 'G-1234567-2022',
      usoSuelo: 'Residential',
      concession: null
    },
    seller: {
      name: 'Maria Gonzalez',
      type: 'Owner',
      verified: true,
      responseTime: '< 1 hour',
      listings: 3,
      featured: true
    },
    coordinates: { lat: 10.3024, lng: -85.8371 },
    listedDate: '2024-01-15',
    views: 1247,
    saves: 89,
    inquiries: 23
  };

  const analyticsData = {
    dailyViews: [45, 52, 48, 61, 55, 67, 72],
    weeklyInquiries: [3, 5, 2, 7, 4, 6, 8],
    topSources: [
      { source: 'Organic Search', percentage: 45, color: 'bg-blue-500' },
      { source: 'Direct Traffic', percentage: 25, color: 'bg-green-500' },
      { source: 'Social Media', percentage: 20, color: 'bg-purple-500' },
      { source: 'Email Campaigns', percentage: 10, color: 'bg-orange-500' }
    ],
    competitorAnalysis: {
      avgPrice: 1250000,
      avgDaysOnMarket: 67,
      thisProperty: {
        price: 1450000,
        daysOnMarket: 15,
        inquiries: 23
      }
    }
  };

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const generatePDF = () => {
    // Simulate PDF generation
    alert('Generating professional PDF brochure... This will be downloaded automatically.');
  };

  const scheduleShowing = () => {
    if (selectedDate && selectedTime) {
      alert(`Showing scheduled for ${selectedDate} at ${selectedTime}. You'll receive a confirmation email and calendar invite.`);
      setShowBookingModal(false);
    }
  };

  const toggleLeadNotifications = () => {
    setLeadNotifications(!leadNotifications);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Hero Section */}
      <div className="relative">
        {/* Priority Placement Badge */}
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <Crown className="w-4 h-4" />
          OWNER FEATURED - PRIORITY PLACEMENT
        </div>

        {/* Image Gallery */}
        <div className="relative h-96 md:h-[700px] bg-slate-200">
          {showVideo ? (
            <div className="relative w-full h-full">
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay
                src={property.videos[0].url}
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 z-10"
          >
            <ChevronLeft className="w-7 h-7 text-slate-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 z-10"
          >
            <ChevronRight className="w-7 h-7 text-slate-700" />
          </button>

          {/* Video Play Button */}
          {property.videos.length > 0 && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
            >
              <Play className="w-8 h-8 text-slate-700 ml-1" />
            </button>
          )}

          {/* Enhanced Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
            <Camera className="w-4 h-4" />
            {currentImageIndex + 1} / {property.images.length}
            {property.videos.length > 0 && (
              <span className="ml-2 text-cyan-300">+ {property.videos.length} Video{property.videos.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Enhanced Thumbnail Strip */}
          <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-96">
            {property.images.slice(0, 6).map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowVideo(false);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
                  index === currentImageIndex && !showVideo ? 'border-cyan-500 shadow-lg' : 'border-white/50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {property.videos.map((video, index) => (
              <button
                key={`video-${index}`}
                onClick={() => setShowVideo(true)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-300 relative ${
                  showVideo ? 'border-cyan-500 shadow-lg' : 'border-white/50'
                }`}
              >
                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>

          {/* Premium Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-3">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
            >
              <Heart className={`w-7 h-7 transition-all duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
            </button>
            <button className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300">
              <Share2 className="w-7 h-7 text-slate-700" />
            </button>
            <button
              onClick={generatePDF}
              className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              <Download className="w-7 h-7 text-white" />
            </button>
          </div>

          {/* Enhanced Price Badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
            ${property.price.toLocaleString()} USD
            <div className="text-sm font-normal opacity-90">Owner Featured</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Premium Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  ⭐ OWNER FEATURED
                </div>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  🔥 PRIORITY PLACEMENT
                </div>
              </div>

              <h1 className="text-4xl font-bold text-slate-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <MapPin className="w-6 h-6" />
                <span className="text-xl">{property.location}</span>
              </div>

              {/* Enhanced Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-sm border border-blue-200">
                  <Bed className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.beds}</div>
                  <div className="text-sm text-slate-600">Bedrooms</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-200">
                  <Bath className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.baths}</div>
                  <div className="text-sm text-slate-600">Bathrooms</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-purple-200">
                  <Maximize className="w-8 h-8 text-purple-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Sq Ft</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-sm border border-orange-200">
                  <Ruler className="w-8 h-8 text-orange-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.lot.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Lot (m²)</div>
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Advanced Analytics
                  </h3>
                  <Button
                    onClick={() => setShowAnalytics(true)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    View Dashboard
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-300">{property.analytics.views}</div>
                    <div className="text-xs text-slate-300">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{property.analytics.inquiries}</div>
                    <div className="text-xs text-slate-300">Inquiries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">{property.analytics.saves}</div>
                    <div className="text-xs text-slate-300">Saves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300">{property.analytics.conversionRate}%</div>
                    <div className="text-xs text-slate-300">Conversion</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'details', label: 'Property Details', icon: FileText },
                  { id: 'location', label: 'Location & Amenities', icon: MapPin },
                  { id: 'legal', label: 'Legal Information', icon: Shield },
                  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Property Description</h3>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                        {property.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Features & Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-slate-700 bg-slate-50 rounded-xl p-4">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Concierge CTA */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900">Unlimited AI Concierge</h4>
                          <p className="text-slate-600">Get instant answers to any questions about this property</p>
                        </div>
                        <Button
                          onClick={() => setAiAssistantOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          Ask AI
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Comprehensive Property Details</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Year Built</span>
                            <span className="font-bold text-slate-900 text-lg">{property.yearBuilt}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Property Type</span>
                            <span className="font-bold text-slate-900 text-lg">Luxury Villa</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Parking</span>
                            <span className="font-bold text-slate-900 text-lg">3 Car Garage</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Listed Date</span>
                            <span className="font-bold text-slate-900 text-lg">{new Date(property.listedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Lot Size</span>
                            <span className="font-bold text-slate-900 text-lg">{property.lot.toLocaleString()} m²</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Building Size</span>
                            <span className="font-bold text-slate-900 text-lg">{property.sqft.toLocaleString()} ft²</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Price per Sq Ft</span>
                            <span className="font-bold text-slate-900 text-lg">${Math.round(property.price / property.sqft)}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Property Views</span>
                            <span className="font-bold text-slate-900 text-lg">{property.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Premium Utilities & Services</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                          <Waves className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="font-bold text-slate-900 text-lg">Water</div>
                            <div className="text-slate-600">{property.utilities.water}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                          <Zap className="w-8 h-8 text-yellow-600" />
                          <div>
                            <div className="font-bold text-slate-900 text-lg">Electric</div>
                            <div className="text-slate-600">{property.utilities.electric}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                          <Wifi className="w-8 h-8 text-green-600" />
                          <div>
                            <div className="font-bold text-slate-900 text-lg">Internet</div>
                            <div className="text-slate-600">{property.utilities.internet}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200">
                          <Car className="w-8 h-8 text-slate-600" />
                          <div>
                            <div className="font-bold text-slate-900 text-lg">Access</div>
                            <div className="text-slate-600">{property.utilities.access}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Prime Location</h3>
                      <div className="flex items-center gap-3 text-slate-700 mb-6 text-lg">
                        <MapPin className="w-6 h-6 text-slate-500" />
                        <span>{property.location}</span>
                      </div>
                      <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center mb-6">
                        <div className="text-center">
                          <Compass className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 text-lg">Interactive Map</p>
                          <p className="text-sm text-slate-500">Lat: {property.coordinates.lat}, Lng: {property.coordinates.lng}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Premium Amenities & Attractions</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                          <Mountain className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">5 min walk to world-class beach</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Home className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">10 min drive to Tamarindo town center</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Users className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">Fine dining and boutique shopping</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Award className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">International airport access (20 min)</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Waves className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">Surf schools and water sports</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Shield className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-700 text-lg">24/7 security and gated community</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'legal' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Verified Legal Information</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <Shield className="w-8 h-8 text-green-600" />
                            <div>
                              <div className="font-bold text-green-900 text-lg">Title Type</div>
                              <div className="text-green-700">{property.legal.titleType}</div>
                            </div>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <div className="font-bold text-slate-900 mb-2 text-lg">Plano Catastrado</div>
                            <div className="text-slate-600 font-mono">{property.legal.planoCatastrado}</div>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <div className="font-bold text-slate-900 mb-2 text-lg">Uso de Suelo</div>
                            <div className="text-slate-600">{property.legal.usoSuelo}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex gap-4">
                        <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="text-amber-900">
                          <strong className="text-lg">Legal Disclaimer:</strong>
                          <p className="mt-2">This information is educational only and not legal advice. All legal documents have been verified by licensed Costa Rican attorneys. Always consult legal professionals for your specific situation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Advanced Performance Analytics</h3>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                          <Eye className="w-8 h-8 text-blue-600 mb-3" />
                          <div className="text-3xl font-bold text-slate-900">{property.analytics.views}</div>
                          <div className="text-sm text-slate-600">Total Views</div>
                          <div className="text-xs text-green-600 mt-1">+23% this week</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                          <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
                          <div className="text-3xl font-bold text-slate-900">{property.analytics.inquiries}</div>
                          <div className="text-sm text-slate-600">Inquiries</div>
                          <div className="text-xs text-green-600 mt-1">+15% this week</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                          <Heart className="w-8 h-8 text-purple-600 mb-3" />
                          <div className="text-3xl font-bold text-slate-900">{property.analytics.saves}</div>
                          <div className="text-sm text-slate-600">Saves</div>
                          <div className="text-xs text-green-600 mt-1">+8% this week</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                          <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
                          <div className="text-3xl font-bold text-slate-900">{property.analytics.conversionRate}%</div>
                          <div className="text-sm text-slate-600">Conversion Rate</div>
                          <div className="text-xs text-green-600 mt-1">+5% this week</div>
                        </div>
                      </div>

                      {/* Traffic Sources */}
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-slate-900 mb-4">Traffic Sources</h4>
                        <div className="space-y-4">
                          {analyticsData.topSources.map((source, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-32 text-sm font-medium text-slate-600">{source.source}</div>
                              <div className="flex-1 bg-slate-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full ${source.color}`}
                                  style={{ width: `${source.percentage}%` }}
                                />
                              </div>
                              <div className="w-12 text-sm font-bold text-slate-900">{source.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Market Comparison */}
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
                        <h4 className="text-xl font-bold text-slate-900 mb-4">Market Position</h4>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              ${Math.round((property.price - analyticsData.competitorAnalysis.avgPrice) / 1000)}K
                            </div>
                            <div className="text-sm text-slate-600">Above Average Price</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {analyticsData.competitorAnalysis.avgDaysOnMarket - property.analytics.views + 15}
                            </div>
                            <div className="text-sm text-slate-600">Days Faster Sale</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {Math.round((property.analytics.inquiries / analyticsData.competitorAnalysis.avgDaysOnMarket) * 100)}%
                            </div>
                            <div className="text-sm text-slate-600">Higher Engagement</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Premium Contact & Features */}
          <div className="space-y-6">
            {/* Premium Contact Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 p-8 sticky top-6">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2">${property.price.toLocaleString()}</div>
                <div className="text-slate-300 text-lg">USD - Owner Featured</div>
                <div className="mt-2 text-sm text-cyan-300">Priority Placement Active</div>
              </div>

              {/* Premium CTA Buttons */}
              <div className="space-y-4 mb-8">
                <Button
                  onClick={() => setAiAssistantOpen(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  Unlimited AI Concierge
                </Button>

                <Button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <CalendarIcon className="w-6 h-6" />
                  Book Showing
                </Button>

                <Button
                  onClick={generatePDF}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <Download className="w-6 h-6" />
                  PDF Brochure
                </Button>
              </div>

              {/* Lead Management */}
              <div className="border-t border-slate-700 pt-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Lead Notifications
                  </h4>
                  <button
                    onClick={toggleLeadNotifications}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      leadNotifications ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                      leadNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <p className="text-sm text-slate-300">
                  {leadNotifications
                    ? 'You\'ll receive instant notifications for new inquiries'
                    : 'Lead notifications are currently disabled'
                  }
                </p>
              </div>

              {/* Seller Info */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">M</span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{property.seller.name}</div>
                    <div className="text-slate-300">{property.seller.type} • Featured Seller</div>
                  </div>
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Responds in {property.seller.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>{property.seller.listings} active featured listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>4.9/5 seller rating</span>
                  </div>
                </div>
              </div>

              {/* Premium Stats */}
              <div className="border-t border-slate-700 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-cyan-300">{property.analytics.views}</div>
                    <div className="text-xs text-slate-400">Views</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-300">{property.analytics.inquiries}</div>
                    <div className="text-xs text-slate-400">Inquiries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Schedule a Showing</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select a time</option>
                  {availableTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={scheduleShowing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  disabled={!selectedDate || !selectedTime}
                >
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Advanced Analytics Dashboard</h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <Eye className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.analytics.views}</div>
                  <div className="text-sm text-slate-600">Total Views</div>
                  <div className="text-xs text-green-600 mt-1">+23% vs last week</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.analytics.inquiries}</div>
                  <div className="text-sm text-slate-600">Inquiries</div>
                  <div className="text-xs text-green-600 mt-1">+15% vs last week</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <Heart className="w-8 h-8 text-purple-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.analytics.saves}</div>
                  <div className="text-sm text-slate-600">Saves</div>
                  <div className="text-xs text-green-600 mt-1">+8% vs last week</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                  <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{property.analytics.conversionRate}%</div>
                  <div className="text-sm text-slate-600">Conversion Rate</div>
                  <div className="text-xs text-green-600 mt-1">+5% vs last week</div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Daily Views (Last 7 Days)</h4>
                  <div className="h-32 flex items-end justify-between gap-2">
                    {analyticsData.dailyViews.map((views, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t w-8"
                          style={{ height: `${(views / Math.max(...analyticsData.dailyViews)) * 100}%` }}
                        />
                        <span className="text-xs text-slate-600 mt-2">{views}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Traffic Sources</h4>
                  <div className="space-y-3">
                    {analyticsData.topSources.map((source, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${source.color.replace('bg-', 'bg-')}`} />
                        <span className="flex-1 text-sm text-slate-700">{source.source}</span>
                        <span className="text-sm font-bold text-slate-900">{source.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Market Intelligence</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round((property.price - analyticsData.competitorAnalysis.avgPrice) / 1000)}K
                    </div>
                    <div className="text-sm text-slate-600">Above Market Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.competitorAnalysis.avgDaysOnMarket - 15}
                    </div>
                    <div className="text-sm text-slate-600">Days Faster Than Market</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      Top 5%
                    </div>
                    <div className="text-sm text-slate-600">Market Position</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Property Assistant Modal */}
      <AIPropertyAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        initialContext={{
          currentProperty: property,
          lastTopic: 'property_analysis'
        }}
        propertyId={property.id.toString()}
      />
    </div>
  );
};

export default OwnerFeaturedPropertyDetail;