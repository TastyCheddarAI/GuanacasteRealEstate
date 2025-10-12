import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Home, Building, DollarSign, Bed, Bath, Maximize, Heart, Share2, MessageSquare, Filter, SlidersHorizontal, Grid3x3, List, Navigation, SortAsc, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import AIPropertyAssistant from '../components/AIPropertyAssistant';
import MapboxMap from '../components/MapboxMap';
import SEO from '../components/SEO';
import { searchAPI } from '../services/api';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 2000000],
    beds: '',
    baths: '',
    propertyType: 'all',
    features: [] as string[]
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Fallback mock data for development when no properties exist
  const mockProperties = [
    {
      id: 'mock-1',
      title: 'Oceanfront Villa - Tamarindo',
      type: 'house',
      price_numeric: 650000,
      town: 'Tamarindo',
      lat: 10.295,
      lng: -85.837,
      beds: 3,
      baths: 2,
      area_m2: 180,
      lot_m2: 800,
      description_md: 'Stunning oceanfront villa with panoramic Pacific views.',
      media: [{ storage_path: 'oceanfront-villa.jpg', is_primary: true }],
      owner: { full_name: 'Demo Owner' }
    },
    {
      id: 'mock-2',
      title: 'Beachfront Condo - Playa Flamingo',
      type: 'condo',
      price_numeric: 425000,
      town: 'Playa Flamingo',
      lat: 10.428,
      lng: -85.785,
      beds: 2,
      baths: 2,
      area_m2: 95,
      description_md: 'Modern condo with marina views and resort amenities.',
      media: [{ storage_path: 'beachfront-condo.jpg', is_primary: true }],
      owner: { full_name: 'Demo Owner' }
    }
  ];

  const searchQuery = searchParams.get('q') || '';
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const searchParams = {
          query: searchQuery,
          type: activeFilters.propertyType !== 'all' ? activeFilters.propertyType : undefined,
          min_price: activeFilters.priceRange[0] > 0 ? activeFilters.priceRange[0] : undefined,
          max_price: activeFilters.priceRange[1] < 2000000 ? activeFilters.priceRange[1] : undefined,
          beds: activeFilters.beds ? parseInt(activeFilters.beds) : undefined,
          baths: activeFilters.baths ? parseInt(activeFilters.baths) : undefined,
          limit: 20,
          offset: 0
        };

        const response = await searchAPI.searchProperties(searchParams);
        let propertiesData = response.properties || [];

        // Use mock data as fallback if no properties found
        if (propertiesData.length === 0) {
          console.log('No properties found in database, using mock data for development');
          propertiesData = mockProperties;
        }

        setProperties(propertiesData);
        setTotalResults(propertiesData.length);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, activeFilters]);

  const propertyTypes = [
    { id: 'all', label: 'All Properties', count: 2 },
    { id: 'house', label: 'Houses', count: 1 },
    { id: 'condo', label: 'Condos', count: 1 },
    { id: 'lot', label: 'Lots', count: 0 }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'beds', label: 'Most Bedrooms' },
    { value: 'sqft', label: 'Largest First' }
  ];

  const features = [
    'Ocean View', 'Pool', 'Titled Land', 'Fiber Internet', 'Walk to Beach',
    'New Construction', 'Air Conditioning', 'Security System', 'Garage', 'Garden'
  ];

  // Transform API data to match component expectations
  const searchResults = properties.map(property => ({
    id: property.id,
    title: property.title,
    location: `${property.town}, Guanacaste`,
    price: property.price_numeric,
    beds: property.beds,
    baths: property.baths,
    sqft: property.area_m2,
    lot: property.lot_m2,
    coordinates: { lat: property.lat, lng: property.lng },
    image: property.media?.[0] ? `${SUPABASE_URL}/storage/v1/object/public/properties/${property.media[0].storage_path}` : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    verified: true, // Assume verified for now
    new: false, // Would need to check date
    featured: false, // Would need subscription logic
    listingType: 'free', // Default to free
    tags: [], // Would need to derive from property data
    distance: 'Location data available' // Placeholder
  }));

  const PropertyCard = ({ property }: { property: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleViewDetails = () => {
      if (property.listingType === 'featured') {
        navigate(`/owner-featured/${property.id}`);
      } else {
        navigate(`/property/${property.id}`);
      }
    };

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-slate-200">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.featured && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                FEATURED
              </span>
            )}
            {property.verified && (
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
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
                View Photos
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProperty(property);
                  setAiAssistantOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Ask AI
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-3xl font-bold text-slate-900">
              ${property.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 font-medium">USD</div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{property.location}</span>
          </div>

          {/* Distance */}
          <div className="text-xs text-cyan-600 font-medium mb-4">
            {property.distance}
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
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            View Details
            <ChevronDown className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  };

  const toggleFeature = (feature: string) => {
    setActiveFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-slate-600">Searching properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Search Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO for Search Results */}
      <SEO
        title={`${searchQuery ? `"${searchQuery}"` : 'Property Search'} - ${totalResults} Results | Guanacaste Real Estate`}
        description={`Find ${totalResults} properties${searchQuery ? ` matching "${searchQuery}"` : ''} in Guanacaste, Costa Rica. Browse homes, condos, and land for sale with detailed listings and virtual tours.`}
        keywords={[
          searchQuery,
          'Guanacaste real estate',
          'Costa Rica properties',
          'property search',
          activeFilters.propertyType !== 'all' ? `${activeFilters.propertyType} for sale` : '',
          activeFilters.beds ? `${activeFilters.beds} bedroom` : '',
          activeFilters.baths ? `${activeFilters.baths} bathroom` : '',
          ...activeFilters.features
        ].filter(Boolean)}
        url={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "name": `Property Search Results${searchQuery ? ` for "${searchQuery}"` : ''}`,
          "description": `Search results for properties in Guanacaste${searchQuery ? ` matching "${searchQuery}"` : ''}`,
          "url": `https://guanacastereal.com/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalResults,
            "itemListElement": searchResults.slice(0, 10).map((property, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "RealEstateListing",
                "name": property.title,
                "url": `https://guanacastereal.com/property/${property.id}`,
                "image": property.image,
                "offers": {
                  "@type": "Offer",
                  "price": property.price,
                  "priceCurrency": "USD"
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": property.location.split(',')[0],
                  "addressRegion": "Guanacaste",
                  "addressCountry": "CR"
                }
              }
            }))
          }
        }}
      />

      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              ← Back to Search
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Search className="w-5 h-5" />
                <span className="font-medium">"{searchQuery}"</span>
                <span className="text-slate-400">•</span>
                <span>{totalResults} results</span>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Type:</span>
              {propertyTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveFilters(prev => ({ ...prev, propertyType: type.id }))}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    activeFilters.propertyType === type.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              More Filters
              {(activeFilters.features.length > 0 || activeFilters.beds || activeFilters.baths) && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(activeFilters.features.length + (activeFilters.beds ? 1 : 0) + (activeFilters.baths ? 1 : 0))}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="50000"
                      className="w-full"
                      value={activeFilters.priceRange[1]}
                      onChange={(e) => setActiveFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                    />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>${activeFilters.priceRange[0].toLocaleString()}</span>
                      <span>${activeFilters.priceRange[1].toLocaleString()}+</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Bedrooms</label>
                  <select
                    value={activeFilters.beds}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, beds: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Bathrooms</label>
                  <select
                    value={activeFilters.baths}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, baths: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Features</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {features.map(feature => (
                      <label key={feature} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply Filters */}
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{searchResults.length}</span> of <span className="font-semibold text-slate-900">{totalResults}</span> results for "{searchQuery}"
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                  >
                    <Grid3x3 className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                  >
                    <List className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                  >
                    <Navigation className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid/Map */}
            {viewMode === 'map' ? (
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ height: '600px' }}>
                  <MapboxMap
                    markers={searchResults.map(property => ({
                      id: property.id.toString(),
                      latitude: property.coordinates.lat,
                      longitude: property.coordinates.lng,
                      title: property.title,
                      description: `${property.beds} bed, ${property.baths} bath • ${property.location}`,
                      type: 'property'
                    }))}
                    center={{
                      latitude: searchResults.length > 0 ? searchResults[0].coordinates.lat : 10.0, // Use first property or default Guanacaste center
                      longitude: searchResults.length > 0 ? searchResults[0].coordinates.lng : -85.5
                    }}
                    zoom={10}
                    height="600px"
                  />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="text-center">
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
                Load More Results
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* No Results State (hidden when there are results) */}
            {searchResults.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search criteria or filters</p>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Property Assistant Modal */}
      <AIPropertyAssistant
        isOpen={aiAssistantOpen}
        onClose={() => {
          setAiAssistantOpen(false);
          setSelectedProperty(null);
        }}
        initialContext={{
          currentProperty: selectedProperty,
          lastTopic: selectedProperty ? 'property_analysis' : 'market_info'
        }}
        propertyId={selectedProperty?.id?.toString()}
      />
    </div>
  );
};

export default SearchResults;