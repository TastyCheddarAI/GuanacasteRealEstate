import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Calendar, Heart, Share2, Phone, Mail, MessageSquare, Star, ChevronLeft, ChevronRight, Camera, Shield, Check, Clock, Award, Users, ExternalLink, Zap, Waves, Home, Car, Wifi, Mountain, Eye, DollarSign, Ruler, Compass, Loader2 } from 'lucide-react';
import AIPropertyAssistant from '../components/AIPropertyAssistant';
import SEO, { generatePropertyStructuredData } from '../components/SEO';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [rawProperty, setRawProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await propertiesAPI.getProperty(id);
        setRawProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !rawProperty) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h2>
          <p className="text-slate-600 mb-4">{error || 'The property you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Transform the data to match the expected format
  const property = {
    id: rawProperty.id,
    title: rawProperty.title,
    location: `${rawProperty.town}, Guanacaste`,
    price: rawProperty.price_numeric,
    beds: rawProperty.beds,
    baths: rawProperty.baths,
    sqft: rawProperty.area_m2,
    lot: rawProperty.lot_m2,
    yearBuilt: rawProperty.year_built,
    description: rawProperty.description_md || 'No description available.',
    images: rawProperty.media?.map((m: any) => `${SUPABASE_URL}/storage/v1/object/public/properties/${m.storage_path}`) || [],
    features: [], // Would need to be derived from property data
    utilities: {
      water: rawProperty.water_source || 'Not specified',
      electric: rawProperty.electric_provider || 'Not specified',
      internet: rawProperty.internet_provider || 'Not specified',
      access: 'Paved road' // Default assumption
    },
    legal: {
      titleType: rawProperty.title_type === 'titled' ? 'Titled' : 'Maritime Concession',
      planoCatastrado: 'Not available', // Would need additional data
      usoSuelo: 'Residential', // Default assumption
      concession: rawProperty.concession_until
    },
    seller: {
      name: rawProperty.owner?.full_name || 'Property Owner',
      type: 'Owner',
      verified: !!rawProperty.owner?.verified_at,
      responseTime: '< 24 hours', // Default assumption
      listings: 1 // Would need to count from database
    },
    coordinates: { lat: rawProperty.lat, lng: rawProperty.lng },
    listedDate: rawProperty.published_at || rawProperty.created_at,
    views: 0, // Would need analytics data
    saves: 0 // Would need saved properties data
  };

  const similarProperties = [
    {
      id: 2,
      title: 'Beachfront Condo with Ocean Views',
      location: 'Tamarindo Centro',
      price: 425000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    },
    {
      id: 3,
      title: 'Luxury Villa in Flamingo',
      location: 'Playa Flamingo',
      price: 875000,
      beds: 3,
      baths: 3,
      sqft: 2200,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
    },
    {
      id: 4,
      title: 'Mountain View Estate',
      location: 'Potrero',
      price: 650000,
      beds: 4,
      baths: 3,
      sqft: 2800,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO and Structured Data */}
      <SEO
        title={`${property.title} - ${property.location}`}
        description={`Beautiful ${property.beds} bedroom, ${property.baths} bathroom property in ${property.location}. ${property.sqft.toLocaleString()} sq ft, ${property.lot.toLocaleString()} m² lot. Listed for $${property.price.toLocaleString()} USD.`}
        keywords={[property.location.split(',')[0], 'real estate', 'property', 'Guanacaste', 'Costa Rica', `${property.beds} bedroom`, `${property.baths} bathroom`]}
        image={property.images[0]}
        url={`/property/${property.id}`}
        type="product"
        structuredData={generatePropertyStructuredData(property)}
      />

      {/* Image Gallery */}
      <div className="relative h-96 md:h-[600px] bg-slate-200">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 text-slate-700" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
          <Camera className="w-4 h-4" />
          {currentImageIndex + 1} / {property.images.length}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.images.slice(0, 5).map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index === currentImageIndex ? 'border-cyan-500' : 'border-white/50'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
          {property.images.length > 5 && (
            <div className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              +{property.images.length - 5}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-3">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
          >
            <Heart className={`w-6 h-6 transition-all duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300">
            <Share2 className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xl shadow-lg">
          ${property.price.toLocaleString()} USD
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{property.location}</span>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <Bed className="w-6 h-6 text-slate-500 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{property.beds}</div>
                  <div className="text-sm text-slate-600">Bedrooms</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <Bath className="w-6 h-6 text-slate-500 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{property.baths}</div>
                  <div className="text-sm text-slate-600">Bathrooms</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <Maximize className="w-6 h-6 text-slate-500 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Sq Ft</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <Ruler className="w-6 h-6 text-slate-500 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{property.lot.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Lot (m²)</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200">
                {['overview', 'details', 'location', 'legal'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Description</h3>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {property.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Features & Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-slate-700">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Property Details</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Year Built</span>
                            <span className="font-semibold text-slate-900">{property.yearBuilt}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Property Type</span>
                            <span className="font-semibold text-slate-900">Single Family Home</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Parking</span>
                            <span className="font-semibold text-slate-900">2 Car Garage</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Lot Size</span>
                            <span className="font-semibold text-slate-900">{property.lot.toLocaleString()} m²</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Listed</span>
                            <span className="font-semibold text-slate-900">{new Date(property.listedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Views</span>
                            <span className="font-semibold text-slate-900">{property.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Utilities</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <Waves className="w-6 h-6 text-blue-500" />
                          <div>
                            <div className="font-semibold text-slate-900">Water</div>
                            <div className="text-sm text-slate-600">{property.utilities.water}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <Zap className="w-6 h-6 text-yellow-500" />
                          <div>
                            <div className="font-semibold text-slate-900">Electric</div>
                            <div className="text-sm text-slate-600">{property.utilities.electric}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <Wifi className="w-6 h-6 text-green-500" />
                          <div>
                            <div className="font-semibold text-slate-900">Internet</div>
                            <div className="text-sm text-slate-600">{property.utilities.internet}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <Car className="w-6 h-6 text-slate-500" />
                          <div>
                            <div className="font-semibold text-slate-900">Access</div>
                            <div className="text-sm text-slate-600">{property.utilities.access}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Location</h3>
                      <div className="flex items-center gap-2 text-slate-700 mb-4">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <span>{property.location}</span>
                      </div>
                      <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Compass className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">Interactive Map</p>
                          <p className="text-sm text-slate-500">Lat: {property.coordinates.lat}, Lng: {property.coordinates.lng}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Nearby Amenities</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Mountain className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-700">5 min walk to beach</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Home className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-700">10 min drive to Tamarindo town</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-700">Restaurants and shops nearby</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-700">Airport access within 20 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'legal' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Legal Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-green-600" />
                            <div>
                              <div className="font-semibold text-green-900">Title Type</div>
                              <div className="text-sm text-green-700">{property.legal.titleType}</div>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="font-semibold text-slate-900 mb-1">Plano Catastrado</div>
                            <div className="text-sm text-slate-600">{property.legal.planoCatastrado}</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="font-semibold text-slate-900 mb-1">Uso de Suelo</div>
                            <div className="text-sm text-slate-600">{property.legal.usoSuelo}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                          <strong>Legal Disclaimer:</strong> This information is educational only and not legal advice. Always consult a licensed Costa Rican attorney or notary for property transactions.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Properties */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Similar Properties</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {similarProperties.map((similar) => (
                  <div key={similar.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="h-48 bg-slate-200">
                      <img src={similar.image} alt={similar.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-bold text-slate-900 mb-1">${similar.price.toLocaleString()}</div>
                      <h4 className="font-semibold text-slate-900 mb-2">{similar.title}</h4>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{similar.location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-700">
                        <span>{similar.beds} beds</span>
                        <span>{similar.baths} baths</span>
                        <span>{similar.sqft.toLocaleString()} ft²</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Seller Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-slate-900 mb-1">${property.price.toLocaleString()}</div>
                <div className="text-slate-600">USD</div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setAiAssistantOpen(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Ask AI About This Property
                </button>
                <button className="w-full bg-white border-2 border-slate-200 text-slate-900 py-3 rounded-xl font-semibold hover:border-slate-300 transition-all duration-300 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Seller
                </button>
                <button className="w-full bg-white border-2 border-slate-200 text-slate-900 py-3 rounded-xl font-semibold hover:border-slate-300 transition-all duration-300 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Now
                </button>
              </div>

              {/* Seller Info */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{property.seller.name}</div>
                    <div className="text-sm text-slate-600">{property.seller.type}</div>
                  </div>
                  {property.seller.verified && (
                    <Shield className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Responds in {property.seller.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>{property.seller.listings} active listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{property.views} views this month</span>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{property.views}</div>
                    <div className="text-xs text-slate-600">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{property.saves}</div>
                    <div className="text-xs text-slate-600">Saves</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default PropertyDetail;