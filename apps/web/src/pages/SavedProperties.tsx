import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Maximize, Calendar, Share2, MessageSquare, ChevronRight, Grid3x3, List, X, AlertCircle } from 'lucide-react';

const SavedProperties = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  const savedProperties = [
    {
      id: 1,
      title: 'Modern Oceanfront Villa',
      location: 'Tamarindo, Guanacaste',
      price: 1450000,
      beds: 4,
      baths: 4.5,
      sqft: 3800,
      lot: 2400,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      verified: true,
      featured: true,
      tags: ['Ocean View', 'Pool', 'Titled'],
      savedDate: '2024-01-15',
      notes: 'Perfect for vacation rental investment'
    },
    {
      id: 2,
      title: 'Beachfront Condo with Ocean Views',
      location: 'Tamarindo Centro',
      price: 425000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      lot: null,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      verified: true,
      tags: ['Walk to Beach', 'Pool', 'Titled'],
      savedDate: '2024-01-12',
      notes: 'Good starter property in Costa Rica'
    },
    {
      id: 3,
      title: 'Luxury Beach House',
      location: 'Playa Flamingo',
      price: 875000,
      beds: 3,
      baths: 3,
      sqft: 2200,
      lot: 1800,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      verified: true,
      featured: true,
      tags: ['Ocean View', 'Pool', 'New Construction'],
      savedDate: '2024-01-10',
      notes: 'Love the modern design and location'
    },
    {
      id: 4,
      title: 'Mountain View Estate',
      location: 'Potrero',
      price: 650000,
      beds: 4,
      baths: 3,
      sqft: 2800,
      lot: 3200,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      verified: true,
      tags: ['Mountain View', 'Privacy', 'Titled'],
      savedDate: '2024-01-08',
      notes: 'Great for full-time living'
    }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Recently Saved' },
    { value: 'oldest', label: 'First Saved' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'location', label: 'Location' }
  ];

  const PropertyCard = ({ property, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => onRemove(property.id)}
              className="w-10 h-10 bg-red-500/90 backdrop-blur-sm hover:bg-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100">
              <Share2 className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Quick View - Shows on Hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex gap-3">
              <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-xl hover:bg-slate-50 transition-all duration-300 flex items-center gap-2">
                View Details
              </button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2">
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

          {/* Saved Date */}
          <div className="text-xs text-slate-500 mb-4">
            Saved on {new Date(property.savedDate).toLocaleDateString()}
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
                <Maximize className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold">{property.sqft.toLocaleString()} ft²</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {property.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Notes */}
          {property.notes && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-slate-700 italic">"{property.notes}"</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
              View Details
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleRemoveSaved = (propertyId) => {
    // In a real app, this would remove from saved properties
    console.log('Removing property:', propertyId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Saved Properties</h1>
              <p className="text-slate-600 mt-1">Your favorite properties in one place</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedProperties.length > 0 ? (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">{savedProperties.length}</span> saved properties
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
                  <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
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
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onRemove={handleRemoveSaved}
                />
              ))}
            </div>

            {/* Create Alert */}
            <div className="mt-12 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Get notified about new properties</h3>
                  <p className="text-slate-600 mb-4">
                    Create a saved search alert and we'll notify you when new properties matching your criteria become available.
                  </p>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                    Create Search Alert
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved properties yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Start browsing properties and save your favorites to keep track of the ones you're interested in.
            </p>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;