import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Waves, Sun, Cloud, CloudRain, Wind, DollarSign, Home, Car, Users, Star, ChevronRight, ChevronLeft, Heart, Share2, MessageSquare, Calendar, Clock, Phone, Mail, ExternalLink, Navigation, Camera, Info, TrendingUp, Shield, Zap, Wifi, Droplets, Mountain, TreePine, Fish, Anchor, Utensils, ShoppingBag, Music, Camera as CameraIcon, Map, Thermometer, Eye, Award, Ship, Crown, Gem, Loader2 } from 'lucide-react';
import { useWeather } from '../services/weather';

const Flamingo = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Fetch real weather data for Flamingo
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeather('flamingo');

  const heroImages = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'
  ];

  const localProperties = [
    {
      id: 1,
      title: 'Marina Front Luxury Villa',
      price: 2100000,
      beds: 5,
      baths: 6,
      sqft: 4500,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Marina View', 'Pool', 'Boat Dock']
    },
    {
      id: 2,
      title: 'Contemporary Flamingo Condo',
      price: 625000,
      beds: 3,
      baths: 3,
      sqft: 2200,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      verified: true,
      listingType: 'free',
      tags: ['Ocean View', 'Marina Access', 'Titled']
    },
    {
      id: 3,
      title: 'Waterfront Estate',
      price: 3200000,
      beds: 6,
      baths: 7,
      sqft: 6000,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Private Dock', 'Infinity Pool', 'Staff Quarters']
    }
  ];


  const localAmenities = {
    marinas: [
      { name: 'Flamingo Marina', description: 'Full-service marina with 120 slips, fuel dock, and yacht club' },
      { name: 'Andaz Resort Marina', description: 'Luxury resort marina with concierge services' },
      { name: 'Private Yacht Club', description: 'Exclusive members-only facility with fine dining' }
    ],
    restaurants: [
      { name: 'Agave Terrace', cuisine: 'International', price: '$$$$', rating: 4.7 },
      { name: 'The Pink Monkey', cuisine: 'Seafood', price: '$$$', rating: 4.5 },
      { name: 'Matsuri', cuisine: 'Japanese', price: '$$$', rating: 4.6 },
      { name: 'Il Pescatore', cuisine: 'Italian', price: '$$$$', rating: 4.4 }
    ],
    activities: [
      { name: 'Yacht Charters', provider: 'Flamingo Yacht Club', price: '$500/day' },
      { name: 'Deep Sea Fishing', provider: 'Costa Rica Fishing', price: '$150/person' },
      { name: 'Helicopter Tours', provider: 'Aero Costa Rica', price: '$250/person' },
      { name: 'Spa Treatments', provider: 'Andaz Spa', price: '$120/treatment' }
    ]
  };

  const costOfLiving = {
    housing: { average: '$4,500', range: '$2,500 - $15,000+' },
    groceries: { average: '$800', note: 'Premium imported goods available' },
    utilities: { average: '$350', note: 'Includes high-end amenities and services' },
    transportation: { average: '$400', note: 'Premium vehicles and marina fees' },
    entertainment: { average: '$600', note: 'Fine dining and luxury experiences' }
  };

  const marketStats = {
    avgPrice: '$1,200,000',
    priceChange: '+15%',
    daysOnMarket: 38,
    inventory: 28,
    soldLastMonth: 6
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
            <span className="text-sm font-medium">Flamingo, Guanacaste</span>
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
      {/* Hero Section with Image Carousel */}
      <div className="relative h-96 md:h-[600px] bg-slate-200">
        <img
          src={heroImages[currentImageIndex]}
          alt="Flamingo"
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
              Flamingo
              <span className="block text-3xl md:text-4xl font-normal text-amber-300 mt-2">
                Luxury Marina Lifestyle
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Where sophistication meets the sea. Costa Rica's premier luxury destination.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300">
                Explore Flamingo Luxury
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Marina & Yacht Club
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
            <Crown className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.inventory}</div>
            <div className="text-sm text-slate-600">Luxury Listings</div>
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
            <Ship className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">120+</div>
            <div className="text-sm text-slate-600">Marina Slips</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'marina', label: 'Marina Life', icon: Ship },
              { id: 'market', label: 'Market Data', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
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
                {/* About Flamingo */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">About Flamingo</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Flamingo represents the pinnacle of luxury living on Costa Rica's Gold Coast. This exclusive beach community combines world-class marina facilities with sophisticated residential developments, creating an unparalleled lifestyle for discerning homeowners and yacht owners.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      Home to the prestigious Andaz Costa Rica Resort and one of Central America's finest marinas, Flamingo offers a perfect blend of privacy, luxury amenities, and proximity to both adventure and relaxation.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Flamingo?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Ship className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Premier marina with 120+ slips and full services</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Luxury resort and world-class amenities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">24/7 security and gated communities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Gem className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Exclusive beach clubs and fine dining</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-600" />
                    Current Weather & Forecast
                  </h3>
                  {weatherLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-600 mr-2" />
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

                {/* Interactive Map Placeholder */}
                <div className="bg-slate-100 rounded-xl h-96 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Interactive Flamingo Map</h3>
                    <p className="text-slate-600 mb-4">Explore marina, resorts, and luxury estates</p>
                    <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                      View Full Map
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Flamingo Properties</h3>
                  <div className="flex gap-2">
                    {['all', 'house', 'condo', 'estate'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedPropertyType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedPropertyType === type
                            ? 'bg-amber-500 text-white'
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
                  <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    View All Flamingo Properties
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'marina' && (
              <div className="space-y-8">
                {/* Marina Information */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Ship className="w-6 h-6 text-cyan-600" />
                    Flamingo Marina
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {localAmenities.marinas.map((marina, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{marina.name}</h4>
                        <p className="text-slate-700 text-sm">{marina.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurants */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    Fine Dining
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
                    Luxury Activities
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {localAmenities.activities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{activity.name}</h4>
                        <p className="text-sm text-amber-600 mb-2">{activity.provider}</p>
                        <p className="text-slate-700 text-sm mb-3">Experience Flamingo's world-class luxury activities.</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{activity.price}</span>
                          <button className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
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

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Investment Potential</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Luxury Market Leader</h4>
                      <p className="text-sm text-slate-600">Premium positioning in high-end Costa Rican market</p>
                    </div>
                    <div className="text-center">
                      <Ship className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Marina Value</h4>
                      <p className="text-sm text-slate-600">Yacht ownership drives property appreciation</p>
                    </div>
                    <div className="text-center">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Resort Amenities</h4>
                      <p className="text-sm text-slate-600">Andaz Resort provides world-class facilities</p>
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

export default Flamingo;