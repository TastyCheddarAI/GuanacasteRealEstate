import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building, DollarSign, Bed, Bath, Maximize, Heart, Share2, MessageSquare, ChevronRight } from 'lucide-react';
import AIPropertyAssistant from '../components/AIPropertyAssistant';

const FreeListings = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const propertyTypes = [
    { id: 'all', label: 'All Free Listings', icon: Home, count: 89 },
    { id: 'house', label: 'Houses', icon: Home, count: 34 },
    { id: 'condo', label: 'Condos', icon: Building, count: 23 },
    { id: 'lot', label: 'Lots', icon: Maximize, count: 18 }
  ];

  const freeListings = [
    {
      id: 1,
      title: 'Charming Beach Cottage',
      location: 'Tamarindo, Guanacaste',
      price: 285000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      lot: 800,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      verified: true,
      new: true,
      tags: ['Walk to Beach', 'Titled', 'Furnished']
    },
    {
      id: 2,
      title: 'Ocean View Villa',
      location: 'Nosara, Guanacaste',
      price: 450000,
      beds: 3,
      baths: 3,
      sqft: 1800,
      lot: 1500,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      verified: true,
      tags: ['Ocean View', 'Pool', 'Titled']
    },
    {
      id: 3,
      title: 'La Paz Community School Area Home',
      location: 'Playa Flamingo, Guanacaste',
      price: 625000,
      beds: 4,
      baths: 3,
      sqft: 2200,
      lot: 1200,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      verified: true,
      new: false,
      tags: ['La Paz School District', 'Titled', 'Pool']
    },
    {
      id: 4,
      title: 'Costa Rica International Academy Area',
      location: 'Nosara, Guanacaste',
      price: 525000,
      beds: 3,
      baths: 2.5,
      sqft: 1950,
      lot: 1800,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      verified: true,
      tags: ['CIA School Area', 'Titled', 'Mountain View']
    },
    {
      id: 5,
      title: 'Luxury Resort Condo',
      location: 'Playa Grande, Guanacaste',
      price: 395000,
      beds: 2,
      baths: 2,
      sqft: 1400,
      lot: null,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      verified: true,
      new: true,
      tags: ['Resort Amenities', 'Titled', 'Pool']
    },
    {
      id: 6,
      title: 'Sámara Pacific School District',
      location: 'Sámara, Guanacaste',
      price: 345000,
      beds: 3,
      baths: 2,
      sqft: 1650,
      lot: 950,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      verified: true,
      tags: ['Pacific School Area', 'Titled', 'Garden']
    },
    {
      id: 7,
      title: 'Tamarindo International School Area',
      location: 'Tamarindo Centro, Guanacaste',
      price: 425000,
      beds: 3,
      baths: 2,
      sqft: 1750,
      lot: 600,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      verified: true,
      tags: ['International School', 'Titled', 'Walk to Town']
    },
    {
      id: 8,
      title: 'Living Earth School Neighborhood',
      location: 'Nosara, Guanacaste',
      price: 485000,
      beds: 4,
      baths: 3,
      sqft: 2100,
      lot: 2200,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      verified: true,
      new: false,
      tags: ['Living Earth School', 'Titled', 'Jungle Setting']
    },
    {
      id: 9,
      title: 'Playa Grande Public School Area',
      location: 'Playa Grande, Guanacaste',
      price: 575000,
      beds: 3,
      baths: 2.5,
      sqft: 1850,
      lot: 1600,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      verified: true,
      tags: ['Public School Area', 'Titled', 'Ocean Access']
    }
  ];

  const PropertyCard = ({ property }: { property: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleViewDetails = () => {
      navigate(`/property/${property.id}`);
    };

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-[600px] flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-64 overflow-hidden bg-slate-200 flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
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
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              FREE LISTING
            </span>
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
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100">
              <Share2 className="w-5 h-5 text-slate-700" />
            </button>
          </div>
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
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-3xl font-bold text-slate-900">
              ${property.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 font-medium">USD</div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300 line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-600 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium line-clamp-1">{property.location}</span>
          </div>
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
          <div className="flex flex-wrap gap-2 mt-auto">
            {property.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5 mt-auto">
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
    <div className="bg-slate-50">
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden py-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Free FSBO Listings<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Save on Commissions
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Browse verified properties listed directly by owners. No realtor fees, no commissions, just pure savings on Costa Rica's Gold Coast.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {propertyTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveFilter(type.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                        activeFilter === type.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                      <span className="text-xs opacity-75">({type.count})</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search free listings by location, beach, or property name..."
                  className="w-full pl-14 pr-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all duration-300"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3">
                <Search className="w-5 h-5" />
                Search {propertyTypes.find(t => t.id === activeFilter)?.count || 89} Free Listings
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Free FSBO Listings</h2>
            <p className="text-slate-600">Direct from owners - no commissions, no fees, just great deals</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {freeListings.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="text-center">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
              Load More Free Listings
            </button>
          </div>
        </div>
      </section>

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

export default FreeListings;