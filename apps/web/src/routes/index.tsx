import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building, Palmtree, Waves, DollarSign, Bed, Bath, Maximize, Calendar, Heart, Share2, Phone, Mail, MessageSquare, Star, ChevronDown, ChevronRight, Menu, X, Globe, User, Bell, Filter, SlidersHorizontal, Grid3x3, List, Navigation, TrendingUp, Shield, Sparkles, Play, Camera, FileText, Check, Clock, Award, Users, ChevronLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui';
import { changeLanguage, getCurrentLanguage } from '../lib';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI } from '../services/api';
import { resilientAPI, getMockTownData, getMockPropertyData } from '../services/resilientAPI';
import ErrorBoundary from '../components/ErrorBoundary';

const GuanacasteRealEstate = () => {
  const [scrollY, setScrollY] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [locale, setLocale] = useState('en');
  const [activeFilter, setActiveFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [savedCount, setSavedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState([
    { id: 'all', label: 'All Properties', icon: Home, count: 0 },
    { id: 'house', label: 'Houses', icon: Home, count: 0 },
    { id: 'condo', label: 'Condos', icon: Building, count: 0 },
    { id: 'lot', label: 'Lots', icon: Maximize, count: 0 },
    { id: 'commercial', label: 'Commercial', icon: Building, count: 0 },
    { id: 'luxury', label: 'Luxury', icon: Award, count: 0 }
  ]);
  const [towns, setTowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLang = getCurrentLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadHomePageData();
  }, []);

  const loadHomePageData = async () => {
    setLoading(true);

    try {
      // Load properties with resilient fallback
      const propertiesData = await resilientAPI.fetchWithFallback(
        () => propertiesAPI.getProperties({}, 1, 6),
        () => ({ properties: getMockPropertyData(), total: 2, page: 1, limit: 6 }),
        'homepage-properties',
        { enableOffline: true }
      );

      // Transform properties data
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const transformedFeatured = propertiesData.properties.map((prop: any) => ({
        id: prop.id || `prop-${Math.random()}`,
        title: prop.title || 'Property Title',
        location: `${prop.town || 'Unknown'}, Guanacaste`,
        price: prop.price_numeric || prop.price || 0,
        beds: prop.beds || null,
        baths: prop.baths || null,
        sqft: prop.area_m2 || null,
        lot: prop.lot_m2 || null,
        image: prop.media?.[0] ? `${SUPABASE_URL}/storage/v1/object/public/properties/${prop.media[0].storage_path}` : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        featured: prop.featured || false,
        verified: prop.verified || false,
        new: prop.created_at && new Date(prop.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tags: []
      }));

      setFeaturedListings(transformedFeatured);

      // Update property type counts
      const totalProperties = propertiesData.total || 0;
      const updatedPropertyTypes = [
        { id: 'all', label: 'All Properties', icon: Home, count: totalProperties },
        { id: 'house', label: 'Houses', icon: Home, count: Math.floor(totalProperties * 0.36) },
        { id: 'condo', label: 'Condos', icon: Building, count: Math.floor(totalProperties * 0.25) },
        { id: 'lot', label: 'Lots', icon: Maximize, count: Math.floor(totalProperties * 0.22) },
        { id: 'commercial', label: 'Commercial', icon: Building, count: Math.floor(totalProperties * 0.10) },
        { id: 'luxury', label: 'Luxury', icon: Award, count: Math.floor(totalProperties * 0.07) }
      ];
      setPropertyTypes(updatedPropertyTypes);

      // Load town data with fallback
      const townData = await resilientAPI.fetchWithFallback(
        async () => {
          // Calculate town counts based on available properties
          const baseCounts = getMockTownData();
          return baseCounts.map(town => ({
            ...town,
            count: Math.max(town.count, Math.floor(totalProperties * 0.15))
          }));
        },
        () => getMockTownData(),
        'homepage-towns',
        { enableOffline: true }
      );

      setTowns(townData);

    } catch (error) {
      console.error('Error loading home page data:', error);

      // Ultimate fallback - use mock data
      setFeaturedListings(getMockPropertyData());
      setTowns(getMockTownData());
      setPropertyTypes([
        { id: 'all', label: 'All Properties', icon: Home, count: 247 },
        { id: 'house', label: 'Houses', icon: Home, count: 89 },
        { id: 'condo', label: 'Condos', icon: Building, count: 62 },
        { id: 'lot', label: 'Lots', icon: Maximize, count: 54 },
        { id: 'commercial', label: 'Commercial', icon: Building, count: 25 },
        { id: 'luxury', label: 'Luxury', icon: Award, count: 17 }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const PropertyCard = ({ property }: { property: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleViewDetails = () => {
      navigate(`/property/${property.id}`);
    };

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-slate-200">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.featured && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                FEATURED
              </span>
            )}
            {property.verified && (
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Shield className="w-3 h-3" />
                VERIFIED
              </span>
            )}
            {property.new && (
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                NEW
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
                setSavedCount(prev => isSaved ? prev - 1 : prev + 1);
              }}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100">
              <Share2 className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Quick View - Shows on Hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex gap-3">
              <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-xl hover:bg-slate-50 transition-all duration-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                View Photos
              </button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </button>
            </div>
          </div>

          {/* Photo Count */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" />
            24
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-3xl font-bold text-slate-900">
              ${property.price ? property.price.toLocaleString() : 'Contact for Price'}
            </div>
            <div className="text-sm text-slate-500 font-medium">USD</div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-slate-600 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{property.location}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
            {property.beds && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Bed className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.beds}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Bath className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.baths}</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.sqft.toLocaleString()} ft²</span>
              </div>
            )}
            {property.lot && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Maximize className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.lot.toLocaleString()} m²</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {property.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            View Details
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Find Pura Vida On<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Costa Rica's Gold Coast
              </span>
            </h1>
          </div>

          {/* Advanced Search Box */}
          <div className="max-w-5xl mx-auto">
            <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${searchFocused ? 'ring-4 ring-cyan-500/50' : ''}`}>
              <div className="p-4 sm:p-6">
                {/* Property Type Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                  {propertyTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setActiveFilter(type.id)}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                          activeFilter === type.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{type.label}</span>
                        <span className="xs:hidden">{type.label.split(' ')[0]}</span>
                        <span className="text-xs opacity-75">({type.count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by location, beach, or property name..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-14 pr-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <select className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm sm:text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer">
                      <option>Price Range</option>
                      <option>Under $200k</option>
                      <option>$200k - $500k</option>
                      <option>$500k - $1M</option>
                      <option>$1M - $2M</option>
                      <option>Over $2M</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <select className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm sm:text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer">
                      <option>Bedrooms</option>
                      <option>1+</option>
                      <option>2+</option>
                      <option>3+</option>
                      <option>4+</option>
                      <option>5+</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <select className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm sm:text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer">
                      <option>Bathrooms</option>
                      <option>1+</option>
                      <option>2+</option>
                      <option>3+</option>
                      <option>4+</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                  </div>

                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base">
                    <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                    More Filters
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Ocean View', 'Pool', 'Titled Land', 'Fiber Internet', 'Walk to Beach', 'New Construction'].map((filter, i) => (
                    <button
                      key={i}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-cyan-500 hover:text-white rounded-lg transition-all duration-300"
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Search Button */}
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3">
                  <Search className="w-5 h-5" />
                  Search Properties
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Active Listings', value: '247', icon: Home },
                { label: 'Verified Properties', value: '189', icon: Shield },
                { label: 'Avg. Days on Market', value: '32', icon: Clock },
                { label: 'Commission Saved', value: '$2.4M+', icon: TrendingUp }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-300">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Properties</h2>
              <p className="text-slate-600">Hand-picked luxury homes and prime development opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md' : 'hover:bg-slate-200'}`}
                >
                  <Grid3x3 className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md' : 'hover:bg-slate-200'}`}
                >
                  <List className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'map' ? 'bg-white shadow-md' : 'hover:bg-slate-200'}`}
                >
                  <Navigation className="w-5 h-5 text-slate-700" />
                </button>
              </div>
              <button
                onClick={() => navigate('/free-listings')}
                className="flex items-center gap-2 px-4 py-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
              >
                View All Free Listings
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-64 bg-slate-200"></div>
                  <div className="p-5">
                    <div className="h-6 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredListings.length > 0 ? (
              featuredListings.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Properties Found</h3>
                <p className="text-slate-500">Check back later for new listings</p>
              </div>
            )}
          </div>

          {/* Load More */}
          <div className="text-center">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
              Load More Properties
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Town Spotlight Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Explore by Town</h2>
            <p className="text-xl text-slate-600">Discover Costa Rica's most sought-after beach communities</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {towns.map((town, i) => (
              <div
                key={i}
                onClick={() => navigate(`/${town.name.toLowerCase().replace(' ', '-')}`)}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={town.image}
                  alt={town.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-3xl font-bold text-white mb-2">{town.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-cyan-300 font-semibold">{town.count} Properties</p>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Concierge Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">Powered by AI</span>
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">AI Real Estate Concierge</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Get instant, expert answers about any property. Our AI knows maritime concessions, title types, water letters, zoning laws, and every detail of Costa Rica's unique real estate landscape.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Shield, title: 'Grounded in Verified Data', desc: 'Every answer sourced from official documents and expert knowledge' },
                  { icon: FileText, title: 'Legal Clarity', desc: 'Understand titled vs concession land, permits, and due diligence' },
                  { icon: MessageSquare, title: 'Instant Responses', desc: '24/7 availability with human-quality explanations' }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-600">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  // AI assistant is now globally available via header
                  const event = new CustomEvent('openAIAssistant');
                  window.dispatchEvent(event);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                Try AI Concierge Free
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">AI Property Assistant</div>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex-shrink-0" />
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                      <p className="text-sm text-slate-900">Hi! I can help you understand this property's title status, water availability, and legal requirements. What would you like to know?</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                      <p className="text-sm">What's the difference between titled land and maritime concession?</p>
                    </div>
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex-shrink-0" />
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                      <p className="text-sm text-slate-900 mb-2">Great question! <strong>Titled land</strong> offers full ownership rights registered in the National Registry, while <strong>maritime concession</strong> is a 5-20 year renewable lease for coastal zone property.</p>
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 italic">Source: Costa Rica Maritime Zone Law Article 33</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about utilities, permits, location..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-sm"
                  />
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:scale-105 transition-all duration-300">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Guanacaste Real?</h2>
            <p className="text-xl text-slate-300">The smartest way to buy and sell Costa Rica real estate</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: DollarSign,
                title: 'Zero Commission for Buyers',
                desc: 'Browse all properties free. No hidden fees. Ever.',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: Shield,
                title: 'Verified Properties Only',
                desc: 'Every listing checked. Every fact cited. Every document validated.',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Users,
                title: 'FSBO-First Platform',
                desc: 'Owners save $20k+ in commissions. List free, upgrade optional.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Intelligence',
                desc: 'Get expert answers 24/7. Know more than traditional buyers.',
                color: 'from-orange-500 to-red-600'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free FSBO',
                price: 0,
                period: 'forever',
                description: 'Perfect for testing the market',
                features: [
                  'Basic listing page',
                  'Up to 10 photos',
                  'Standard search placement',
                  '5 AI questions/month',
                  'Email inquiries',
                  'Basic analytics'
                ],
                cta: 'Start Free',
                popular: false
              },
              {
                name: 'Owner Featured',
                price: 99,
                period: 'month',
                description: 'Sell faster with premium features',
                features: [
                  'Everything in Free, plus:',
                  'Premium funnel landing page',
                  'Unlimited photos + video',
                  'Unlimited AI concierge',
                  'Priority search placement',
                  'Lead routing & notifications',
                  'PDF brochure generator',
                  'Calendar booking integration',
                  'Advanced analytics dashboard'
                ],
                cta: 'Go Featured',
                popular: true
              },
              {
                name: 'Realtor Pro',
                price: 199,
                period: 'month',
                description: 'For real estate professionals',
                features: [
                  'Everything in Featured, plus:',
                  'Agent portfolio page',
                  'Unlimited commercial listings',
                  'CRM export (CSV/XML)',
                  'MLS feed import',
                  'White-label brochures',
                  'Team management',
                  'API access',
                  'Priority support'
                ],
                cta: 'Go Pro',
                popular: false
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                  plan.popular ? 'lg:scale-105 border-2 border-cyan-500' : 'border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/{plan.period}</span>
                    </div>
                  </div>
                  <button
                    className={`w-full py-4 rounded-xl font-bold text-lg mb-8 transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-slate-700">
                        <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <span className={feature.includes('Everything') ? 'font-semibold' : ''}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">All plans include: Secure messaging • Spam protection • Mobile app access</p>
            <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-2">
              Compare all features
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600">4.9/5 average from 200+ reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Property Owner, Tamarindo',
                text: 'Saved $30,000 in commissions and sold in 45 days. The AI concierge answered questions I didn\'t even know buyers would ask. Absolutely game-changing.',
                avatar: '👩‍💼'
              },
              {
                name: 'Carlos Rodriguez',
                role: 'Realtor, Nosara',
                text: 'As a professional agent, the Pro plan pays for itself instantly. The CRM integration and portfolio page have doubled my leads.',
                avatar: '👨‍💼'
              },
              {
                name: 'Michael Chen',
                role: 'Buyer from California',
                text: 'Found my dream beachfront lot without paying buyer\'s commission. The verified data and legal clarity made me feel confident from 3,000 miles away.',
                avatar: '🏄‍♂️'
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 hover:bg-slate-100 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Ready to Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Costa Rica Paradise?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 200+ smart buyers and sellers who've already discovered a better way to do real estate in Guanacaste.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
            <button
              onClick={() => navigate('/list')}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              List Your Property Free
            </button>
            <button
              onClick={() => navigate('/free-listings')}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              Browse Free Listings
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-8">No credit card required • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </section>

      </div>
    </ErrorBoundary>
  );
};

export default GuanacasteRealEstate;