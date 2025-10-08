import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Waves, Sun, Cloud, CloudRain, Wind, DollarSign, Home, Car, Users, Star, ChevronRight, ChevronLeft, Heart, Share2, MessageSquare, Calendar, Clock, Phone, Mail, ExternalLink, Navigation, Camera, Info, TrendingUp, Shield, Zap, Wifi, Droplets, Mountain, TreePine, Fish, Anchor, Utensils, ShoppingBag, Music, Camera as CameraIcon, Map, Thermometer, Eye, Award, Loader2 } from 'lucide-react';
import { useWeather } from '../services/weather';
import SEO from '../components/SEO';
import MapboxMap from '../components/MapboxMap';

const Tamarindo = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Fetch real weather data for Tamarindo
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeather('tamarindo');

  const heroImages = [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'
  ];

  const localProperties = [
    {
      id: 1,
      title: 'Oceanfront Tamarindo Villa',
      price: 1450000,
      beds: 4,
      baths: 4.5,
      sqft: 3800,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Ocean View', 'Pool', 'Walk to Beach']
    },
    {
      id: 2,
      title: 'Downtown Tamarindo Condo',
      price: 425000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      verified: true,
      listingType: 'free',
      tags: ['Walk to Town', 'Pool', 'Titled']
    },
    {
      id: 3,
      title: 'Tamarindo Beach House',
      price: 875000,
      beds: 3,
      baths: 3,
      sqft: 2200,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Beach Access', 'New Construction', 'Ocean View']
    }
  ];

  const mapMarkers = [
    {
      id: 'tamarindo-beach',
      latitude: 10.2969,
      longitude: -85.8411,
      title: 'Tamarindo Beach',
      description: 'World-famous surfing beach with consistent waves and water sports',
      type: 'beach' as const
    },
    {
      id: 'playa-grande-beach',
      latitude: 10.3269,
      longitude: -85.8522,
      title: 'Playa Grande Beach',
      description: 'Protected turtle nesting sanctuary with pristine coastline',
      type: 'beach' as const
    },
    {
      id: 'surf-school',
      latitude: 10.2980,
      longitude: -85.8400,
      title: 'Tamarindo Surf School',
      description: 'Professional surf lessons for all skill levels',
      type: 'activity' as const
    },
    {
      id: 'el-patio',
      latitude: 10.2975,
      longitude: -85.8420,
      title: 'El Patio Restaurant',
      description: 'International cuisine with ocean views',
      type: 'restaurant' as const
    },
    {
      id: 'noguis',
      latitude: 10.2990,
      longitude: -85.8390,
      title: 'Nogui\'s Seafood',
      description: 'Fresh seafood and traditional Costa Rican dishes',
      type: 'restaurant' as const
    }
  ];

  const localAmenities = {
    beaches: [
      { name: 'Tamarindo Beach', distance: '0.2 miles', description: 'Main beach with surfing, restaurants, and water sports' },
      { name: 'Playa Grande', distance: '2.5 miles', description: 'Protected turtle nesting beach with bioluminescent lagoon' },
      { name: 'Playa Langosta', distance: '1.8 miles', description: 'Secluded beach perfect for snorkeling and relaxation' }
    ],
    restaurants: [
      { name: 'El Patio', cuisine: 'International', price: '$$$', rating: 4.5 },
      { name: 'Nogui\'s', cuisine: 'Seafood', price: '$$', rating: 4.3 },
      { name: 'El Milagro', cuisine: 'Mexican', price: '$$', rating: 4.4 },
      { name: 'Buddha Café', cuisine: 'Healthy', price: '$$', rating: 4.2 }
    ],
    activities: [
      { name: 'Surfing Lessons', provider: 'Tamarindo Surf School', price: '$50/hour' },
      { name: 'Yoga Classes', provider: 'Tamarindo Yoga', price: '$15/class' },
      { name: 'Horseback Tours', provider: 'Guanacaste Adventures', price: '$75/person' },
      { name: 'Zip Line Canopy', provider: 'Aero Parasailing', price: '$65/person' }
    ]
  };

  const costOfLiving = {
    housing: { average: '$2,500', range: '$1,200 - $8,000' },
    groceries: { average: '$600', note: 'Imported goods are expensive' },
    utilities: { average: '$200', note: 'Includes water, electric, internet' },
    transportation: { average: '$300', note: 'Gas and vehicle maintenance' },
    entertainment: { average: '$400', note: 'Dining out and activities' }
  };

  const marketStats = {
    avgPrice: '$850,000',
    priceChange: '+12%',
    daysOnMarket: 45,
    inventory: 67,
    soldLastMonth: 8
  };

  const PropertyCard = ({ property }) => {
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
        <div className="relative h-64 overflow-hidden bg-slate-200">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.featured && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                FEATURED
              </span>
            )}
            {property.verified && (
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                VERIFIED
              </span>
            )}
          </div>
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
          </div>
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex gap-3">
              <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-xl hover:bg-slate-50 transition-all duration-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                View Photos
              </button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-3xl font-bold text-slate-900">
              ${property.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 font-medium">USD</div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-600 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Tamarindo, Guanacaste</span>
          </div>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
            {property.beds && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.beds} beds</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Droplets className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.baths} baths</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-700">
              <Waves className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold">{property.sqft.toLocaleString()} ft²</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {property.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
           <button
             onClick={handleViewDetails}
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
    <div className="min-h-screen bg-slate-50">
      {/* SEO Optimization for Tamarindo Real Estate */}
      <SEO
        title="Tamarindo Real Estate - Luxury Homes & Beachfront Properties in Costa Rica's Surf Paradise"
        description="Discover Tamarindo real estate with luxury homes, beachfront villas, and investment properties. Browse 67+ active listings with average prices of $850,000. Costa Rica's premier surf destination with world-class amenities."
        keywords={['Tamarindo real estate', 'Tamarindo properties', 'Costa Rica beachfront homes', 'Tamarindo luxury villas', 'Guanacaste real estate', 'Tamarindo investment properties', 'surf town real estate']}
        image={heroImages[0]}
        url="/tamarindo"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Place",
          "name": "Tamarindo",
          "description": "Costa Rica's premier surf destination and real estate market in Guanacaste",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Guanacaste",
            "addressCountry": "CR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 10.2969,
            "longitude": -85.8411
          },
          "hasPart": {
            "@type": "RealEstateListing",
            "name": "Tamarindo Real Estate Market",
            "description": "Active real estate listings in Tamarindo, Costa Rica",
            "numberOfItems": marketStats.inventory,
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": 200000,
              "highPrice": 2000000,
              "offerCount": marketStats.inventory
            }
          },
          "touristType": ["Beach", "Surfing", "Luxury Travel", "Real Estate Investment"],
          "containsPlace": [
            {
              "@type": "Beach",
              "name": "Tamarindo Beach",
              "description": "World-famous surfing beach with consistent waves"
            },
            {
              "@type": "Restaurant",
              "name": "Tamarindo Dining Scene",
              "description": "Diverse culinary offerings from fresh seafood to international cuisine"
            }
          ]
        }}
      />

      {/* Hero Section with Image Carousel */}
      <div className="relative h-96 md:h-[600px] bg-slate-200">
        <img
          src={heroImages[currentImageIndex]}
          alt="Tamarindo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 text-slate-700" />
        </button>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Tamarindo
              <span className="block text-3xl md:text-4xl font-normal text-cyan-300 mt-2">
                Costa Rica's Surf Paradise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Where world-class surfing meets vibrant beach culture. The heart of Guanacaste's Gold Coast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300">
                Explore Tamarindo Properties
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Plan Your Visit
              </button>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
            <Home className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.inventory}</div>
            <div className="text-sm text-slate-600">Active Listings</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.avgPrice}</div>
            <div className="text-sm text-slate-600">Average Price</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.priceChange}</div>
            <div className="text-sm text-slate-600">Price Growth</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.daysOnMarket}</div>
            <div className="text-sm text-slate-600">Days on Market</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'lifestyle', label: 'Lifestyle', icon: Users },
              { id: 'market', label: 'Market Data', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
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

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* About Tamarindo */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">About Tamarindo</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Tamarindo is the vibrant heart of Guanacaste's Gold Coast, renowned worldwide for its exceptional surfing waves and laid-back beach culture. What started as a small fishing village has evolved into Costa Rica's most popular beach destination, attracting surfers, digital nomads, and luxury travelers from around the globe.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      The town offers a perfect blend of adventure and relaxation, with world-class surfing, pristine beaches, and a diverse culinary scene featuring everything from fresh seafood to international cuisine.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Tamarindo?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Waves className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">World-class surfing with consistent waves year-round</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Anchor className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Rich fishing heritage and fresh seafood culture</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Vibrant expat and tourist community</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Modern amenities with authentic Costa Rican charm</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-600" />
                    Current Weather & Forecast
                  </h3>
                  {weatherLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-600 mr-2" />
                      <span className="text-slate-600">Loading weather data...</span>
                    </div>
                  ) : weatherError ? (
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-2">Weather data temporarily unavailable</p>
                      <p className="text-sm text-slate-500">Showing estimated conditions</p>
                    </div>
                  ) : weatherData ? (
                    <div className="grid md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">{weatherData.current.temp}°C</div>
                        <weatherData.current.icon className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                        <div className="text-sm text-slate-600">{weatherData.current.condition}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Humidity: {weatherData.current.humidity}% • Wind: {weatherData.current.windSpeed} km/h
                        </div>
                      </div>
                      {weatherData.forecast.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="font-semibold text-slate-900 mb-1">{day.day}</div>
                          <day.icon className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                          <div className="text-sm text-slate-900">{day.high}°/{day.low}°</div>
                          <div className="text-xs text-slate-600">{day.condition}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Interactive Map */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Map className="w-5 h-5 text-cyan-600" />
                      Explore Tamarindo
                    </h3>
                    <p className="text-slate-600 text-sm">Discover beaches, surf spots, restaurants, and local attractions</p>
                  </div>
                  <MapboxMap
                    markers={mapMarkers}
                    center={{ latitude: 10.2969, longitude: -85.8411 }}
                    zoom={13}
                    height="500px"
                  />
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Tamarindo Properties</h3>
                  <div className="flex gap-2">
                    {['all', 'house', 'condo', 'lot'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedPropertyType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedPropertyType === type
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {localProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                <div className="text-center">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    View All Tamarindo Properties
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'lifestyle' && (
              <div className="space-y-8">
                {/* Beaches */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Waves className="w-6 h-6 text-cyan-600" />
                    Tamarindo Beaches
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {localAmenities.beaches.map((beach, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{beach.name}</h4>
                        <p className="text-sm text-slate-600 mb-3">{beach.distance}</p>
                        <p className="text-slate-700 text-sm">{beach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurants */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    Dining Scene
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {localAmenities.restaurants.map((restaurant, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-1">{restaurant.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">{restaurant.cuisine}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{restaurant.price}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-slate-700">{restaurant.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CameraIcon className="w-6 h-6 text-purple-600" />
                    Activities & Adventures
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {localAmenities.activities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{activity.name}</h4>
                        <p className="text-sm text-cyan-600 mb-2">{activity.provider}</p>
                        <p className="text-slate-700 text-sm mb-3">Experience Tamarindo's adventure side with guided tours and activities.</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{activity.price}</span>
                          <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm">
                            Learn More →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Market Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Average Property Price</span>
                        <span className="font-bold text-slate-900">{marketStats.avgPrice}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">12-Month Price Change</span>
                        <span className="font-bold text-green-600">{marketStats.priceChange}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Average Days on Market</span>
                        <span className="font-bold text-slate-900">{marketStats.daysOnMarket}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Active Inventory</span>
                        <span className="font-bold text-slate-900">{marketStats.inventory} properties</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Cost of Living</h3>
                    <div className="space-y-4">
                      {Object.entries(costOfLiving).map(([category, data]) => (
                        <div key={category} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-700 capitalize">{category}</span>
                            <span className="font-bold text-slate-900">{data.average}/month</span>
                          </div>
                          <p className="text-sm text-slate-600">{data.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Investment Potential</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">High Rental Demand</h4>
                      <p className="text-sm text-slate-600">Peak season occupancy rates of 85-95%</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Strong Appreciation</h4>
                      <p className="text-sm text-slate-600">12% annual price growth over past 3 years</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Stable Market</h4>
                      <p className="text-sm text-slate-600">Consistent buyer interest year-round</p>
                    </div>
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

export default Tamarindo;