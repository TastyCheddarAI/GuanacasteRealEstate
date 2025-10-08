import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Waves, Sun, Cloud, CloudRain, Wind, DollarSign, Home, Car, Users, Star, ChevronRight, ChevronLeft, Heart, Share2, MessageSquare, Calendar, Clock, Phone, Mail, ExternalLink, Navigation, Camera, Info, TrendingUp, Shield, Zap, Wifi, Droplets, Mountain, TreePine, Fish, Anchor, Utensils, ShoppingBag, Music, Camera as CameraIcon, Map, Thermometer, Eye, Award, Palette, Coffee, Waves as Surf, Loader2 } from 'lucide-react';
import { useWeather } from '../services/weather';
import MapboxMap from '../components/MapboxMap';

const Samara = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Fetch real weather data for Samara
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeather('samara');

  const mapMarkers = [];

  const heroImages = [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200'
  ];

  const localProperties = [
    {
      id: 1,
      title: 'Boho Beachfront Bungalow',
      price: 385000,
      beds: 2,
      baths: 2,
      sqft: 1400,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Beachfront', 'Boho Style', 'Artist Retreat']
    },
    {
      id: 2,
      title: 'Jungle Hill House',
      price: 295000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      verified: true,
      listingType: 'free',
      tags: ['Mountain View', 'Creative Space', 'Titled']
    },
    {
      id: 3,
      title: 'Artist Loft Downtown',
      price: 225000,
      beds: 1,
      baths: 1,
      sqft: 900,
      image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Downtown', 'Loft Space', 'Community']
    }
  ];


  const localAmenities = {
    beaches: [
      { name: 'Samara Beach', distance: '0.3 miles', description: 'Main beach with calm waters, perfect for swimming and sunbathing' },
      { name: 'Piedra del Sol', distance: '1.5 miles', description: 'Secluded beach with tide pools and rock formations' },
      { name: 'Playa Buena', distance: '2.1 miles', description: 'Quiet beach ideal for surfing and beachcombing' }
    ],
    restaurants: [
      { name: 'El Lagarto', cuisine: 'International', price: '$$', rating: 4.5 },
      { name: 'Gusto Beach', cuisine: 'Mediterranean', price: '$$', rating: 4.3 },
      { name: 'Milagro', cuisine: 'Healthy', price: '$$', rating: 4.4 },
      { name: 'The Bakery', cuisine: 'Café', price: '$', rating: 4.6 }
    ],
    activities: [
      { name: 'Art Workshops', provider: 'Samara Art Center', price: '$25/person' },
      { name: 'Surf Lessons', provider: 'Samara Surf School', price: '$35/hour' },
      { name: 'Cooking Classes', provider: 'Casa Zen', price: '$45/person' },
      { name: 'Music Lessons', provider: 'Samara Music School', price: '$30/hour' }
    ]
  };

  const costOfLiving = {
    housing: { average: '$1,600', range: '$800 - $4,000' },
    groceries: { average: '$450', note: 'Fresh local produce and artisan goods' },
    utilities: { average: '$140', note: 'Basic services with some solar options' },
    transportation: { average: '$180', note: 'Walking and biking friendly' },
    entertainment: { average: '$250', note: 'Art galleries, music venues, and cultural events' }
  };

  const marketStats = {
    avgPrice: '$320,000',
    priceChange: '+7%',
    daysOnMarket: 42,
    inventory: 31,
    soldLastMonth: 4
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
            <span className="text-sm font-medium">Samara, Guanacaste</span>
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
          alt="Samara"
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
              Samara
              <span className="block text-3xl md:text-4xl font-normal text-rose-300 mt-2">
                Bohemian Beach Paradise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Where creativity flows like the tide. Costa Rica's artistic and laid-back coastal gem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-rose-500/50 hover:scale-105 transition-all duration-300">
                Explore Samara's Charm
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Artist Community
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
            <Palette className="w-8 h-8 text-rose-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">{marketStats.inventory}</div>
            <div className="text-sm text-slate-600">Creative Spaces</div>
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
            <Coffee className="w-8 h-8 text-rose-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">50+</div>
            <div className="text-sm text-slate-600">Artists</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'culture', label: 'Culture & Arts', icon: Palette },
              { id: 'market', label: 'Market Data', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50'
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
                {/* About Samara */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">About Samara</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Samara is Costa Rica's bohemian beach town, a vibrant community where artists, musicians, writers, and free spirits come together to create and celebrate life. What began as a small fishing village has evolved into a thriving artistic hub, known for its creative energy, beautiful beaches, and welcoming atmosphere.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      The town's laid-back vibe attracts digital nomads, artists, and those seeking a more creative and mindful lifestyle. With its mix of natural beauty, cultural richness, and artistic community, Samara offers a unique blend of relaxation and inspiration.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Samara?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Thriving artist and creative community</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Music className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Live music, galleries, and cultural events</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Waves className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Beautiful beaches with calm waters</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Welcoming expat and local community</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-600" />
                    Current Weather & Forecast
                  </h3>
                  {weatherLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-rose-600 mr-2" />
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
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <MapboxMap
                    center={{ latitude: 9.88, longitude: -85.53 }}
                    zoom={12}
                    markers={mapMarkers}
                  />
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Samara Properties</h3>
                  <div className="flex gap-2">
                    {['all', 'house', 'bungalow', 'loft'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedPropertyType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedPropertyType === type
                            ? 'bg-rose-500 text-white'
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
                  <button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    View All Samara Properties
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'culture' && (
              <div className="space-y-8">
                {/* Artist Community */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Palette className="w-6 h-6 text-purple-600" />
                    Artist Community
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Creative Hub</h4>
                      <p className="text-slate-700 mb-4">Samara hosts over 50 resident artists including painters, sculptors, musicians, and writers. The town features numerous galleries, studios, and cultural events.</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-900">Art Walks:</span>
                          <span className="text-slate-600 ml-2">1st Saturday monthly</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">Galleries:</span>
                          <span className="text-slate-600 ml-2">8+ venues</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Weekly Events</h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li>• Open Mic Nights at The Bakery</li>
                        <li>• Art Gallery Openings</li>
                        <li>• Beach Yoga Sessions</li>
                        <li>• Live Music at Local Bars</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Beaches */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Waves className="w-6 h-6 text-cyan-600" />
                    Samara Beaches
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
                    Culinary Scene
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
                    Creative Activities
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {localAmenities.activities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{activity.name}</h4>
                        <p className="text-sm text-rose-600 mb-2">{activity.provider}</p>
                        <p className="text-slate-700 text-sm mb-3">Experience Samara's vibrant creative and cultural scene.</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{activity.price}</span>
                          <button className="text-rose-600 hover:text-rose-700 font-semibold text-sm">
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

                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Investment Potential</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Palette className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Creative Economy</h4>
                      <p className="text-sm text-slate-600">Growing arts and culture tourism market</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Community Appeal</h4>
                      <p className="text-sm text-slate-600">Strong appeal to digital nomads and creatives</p>
                    </div>
                    <div className="text-center">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Cultural Hub</h4>
                      <p className="text-sm text-slate-600">Established reputation as artistic destination</p>
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

export default Samara;