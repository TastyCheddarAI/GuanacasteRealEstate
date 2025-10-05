import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Waves, Sun, Cloud, CloudRain, Wind, DollarSign, Home, Car, Users, Star, ChevronRight, ChevronLeft, Heart, Share2, MessageSquare, Calendar, Clock, Phone, Mail, ExternalLink, Navigation, Camera, Info, TrendingUp, Shield, Zap, Wifi, Droplets, Mountain, TreePine, Fish, Anchor, Utensils, ShoppingBag, Music, Camera as CameraIcon, Map, Thermometer, Eye, Award, Leaf, Dumbbell, Sparkles } from 'lucide-react';

const Nosara = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  const heroImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
  ];

  const localProperties = [
    {
      id: 1,
      title: 'Jungle Retreat with Ocean Views',
      price: 875000,
      beds: 3,
      baths: 3,
      sqft: 2600,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Ocean View', 'Jungle', 'Sustainable']
    },
    {
      id: 2,
      title: 'Nosara Yoga Studio Loft',
      price: 425000,
      beds: 2,
      baths: 2,
      sqft: 1400,
      image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400',
      verified: true,
      listingType: 'free',
      tags: ['Walk to Town', 'Yoga Space', 'Titled']
    },
    {
      id: 3,
      title: 'Mountain View Wellness Retreat',
      price: 650000,
      beds: 4,
      baths: 3,
      sqft: 2200,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      verified: true,
      featured: true,
      listingType: 'featured',
      tags: ['Mountain View', 'Spa', 'Eco-Friendly']
    }
  ];

  const weatherData = {
    current: { temp: 27, condition: 'Partly Cloudy', humidity: 78, wind: 8 },
    forecast: [
      { day: 'Today', high: 29, low: 23, condition: 'Partly Cloudy', icon: Cloud },
      { day: 'Tomorrow', high: 28, low: 22, condition: 'Light Rain', icon: CloudRain },
      { day: 'Wednesday', high: 30, low: 24, condition: 'Sunny', icon: Sun },
      { day: 'Thursday', high: 29, low: 23, condition: 'Sunny', icon: Sun },
      { day: 'Friday', high: 28, low: 22, condition: 'Partly Cloudy', icon: Cloud }
    ]
  };

  const localAmenities = {
    beaches: [
      { name: 'Nosara Beach', distance: '0.5 miles', description: 'Long stretch of beach perfect for surfing and long walks' },
      { name: 'Guiones Beach', distance: '1.2 miles', description: 'Popular surfing beach with beachfront restaurants' },
      { name: 'Playa Pelada', distance: '2.1 miles', description: 'Secluded beach ideal for swimming and snorkeling' }
    ],
    restaurants: [
      { name: 'The Gilded Iguana', cuisine: 'International', price: '$$$', rating: 4.6 },
      { name: 'Robyn\'s Restaurant', cuisine: 'Healthy', price: '$$', rating: 4.4 },
      { name: 'La Luna', cuisine: 'Mediterranean', price: '$$$', rating: 4.5 },
      { name: 'Green Sanctuary', cuisine: 'Vegan', price: '$$', rating: 4.3 }
    ],
    activities: [
      { name: 'Yoga Classes', provider: 'Nosara Yoga Institute', price: '$15/class' },
      { name: 'Surf Lessons', provider: 'Guiones Surf School', price: '$45/hour' },
      { name: 'Hiking Tours', provider: 'Nosara Biological Reserve', price: '$25/person' },
      { name: 'Spa Treatments', provider: 'Nosara Spa', price: '$80/treatment' }
    ]
  };

  const costOfLiving = {
    housing: { average: '$2,200', range: '$1,000 - $6,000' },
    groceries: { average: '$550', note: 'Focus on local and organic produce' },
    utilities: { average: '$180', note: 'Solar power common in eco-communities' },
    transportation: { average: '$250', note: 'Bicycles and walking are popular' },
    wellness: { average: '$350', note: 'Yoga, spa, and wellness activities' }
  };

  const marketStats = {
    avgPrice: '$720,000',
    priceChange: '+8%',
    daysOnMarket: 52,
    inventory: 34,
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
            <span className="text-sm font-medium">Nosara, Guanacaste</span>
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
          alt="Nosara"
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
              Nosara
              <span className="block text-3xl md:text-4xl font-normal text-green-300 mt-2">
                Yoga Paradise & Wellness Retreat
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Where pristine beaches meet spiritual awakening. Costa Rica's wellness capital.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300">
                Discover Nosara Properties
              </button>
              <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                Plan Your Wellness Journey
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
            <Home className="w-8 h-8 text-green-600 mx-auto mb-3" />
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
            <Leaf className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">95%</div>
            <div className="text-sm text-slate-600">Eco-Friendly</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'wellness', label: 'Wellness', icon: Sparkles },
              { id: 'market', label: 'Market Data', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
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
                {/* About Nosara */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">About Nosara</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Nosara is Costa Rica's wellness capital, a laid-back beach town that has become synonymous with yoga, surfing, and sustainable living. What began as a small fishing village has evolved into a global destination for those seeking spiritual growth, physical wellness, and connection with nature.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      The town's commitment to environmental conservation and community wellness has created a unique atmosphere where ancient traditions meet modern consciousness, making it one of the most sought-after destinations for digital nomads and wellness travelers.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Nosara?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">World-renowned yoga and wellness community</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Strong environmental conservation focus</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Vibrant international expat community</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Mountain className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Access to rainforests and wildlife reserves</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-600" />
                    Current Weather & Forecast
                  </h3>
                  <div className="grid md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">{weatherData.current.temp}°C</div>
                      <Cloud className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                      <div className="text-sm text-slate-600">{weatherData.current.condition}</div>
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
                </div>

                {/* Interactive Map Placeholder */}
                <div className="bg-slate-100 rounded-xl h-96 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Interactive Nosara Map</h3>
                    <p className="text-slate-600 mb-4">Explore beaches, yoga studios, and nature reserves</p>
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                      View Full Map
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Nosara Properties</h3>
                  <div className="flex gap-2">
                    {['all', 'house', 'condo', 'lot'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedPropertyType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedPropertyType === type
                            ? 'bg-green-500 text-white'
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
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    View All Nosara Properties
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'wellness' && (
              <div className="space-y-8">
                {/* Yoga & Wellness */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Yoga & Wellness Centers
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Nosara Yoga Institute</h4>
                      <p className="text-slate-600 mb-3">World-renowned yoga center offering daily classes, teacher trainings, and retreats.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">Open Daily</span>
                        <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
                          View Schedule →
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Guiones Wellness Center</h4>
                      <p className="text-slate-600 mb-3">Holistic healing center with massage, reiki, and alternative therapies.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">By Appointment</span>
                        <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
                          Book Session →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beaches */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Waves className="w-6 h-6 text-cyan-600" />
                    Nosara Beaches
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
                    Conscious Cuisine
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
                    <Dumbbell className="w-6 h-6 text-red-600" />
                    Activities & Adventures
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {localAmenities.activities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{activity.name}</h4>
                        <p className="text-sm text-green-600 mb-2">{activity.provider}</p>
                        <p className="text-slate-700 text-sm mb-3">Experience Nosara's wellness-focused adventure activities.</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{activity.price}</span>
                          <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
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

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Investment Potential</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Eco-Conscious Growth</h4>
                      <p className="text-sm text-slate-600">Sustainable development drives long-term value</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Wellness Tourism</h4>
                      <p className="text-sm text-slate-600">Growing international wellness travel market</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-900 mb-1">Conservation Value</h4>
                      <p className="text-sm text-slate-600">Protected areas ensure environmental stability</p>
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

export default Nosara;