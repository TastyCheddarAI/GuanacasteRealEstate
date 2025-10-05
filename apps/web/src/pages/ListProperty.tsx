import React, { useState } from 'react';
import { Home, MapPin, FileText, Waves, Zap, Building, Image, DollarSign, Check, ChevronRight, ChevronLeft, ArrowRight, Upload, X, AlertCircle, Info, Star, Shield, Sparkles, Play, Camera, FileText as FileTextIcon, CheckCircle, Clock, Award, Users, ChevronLeft as ChevronLeftIcon, ExternalLink, Package, Globe, Maximize } from 'lucide-react';

const FreeListingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basics
    title: '',
    propertyType: '',
    price: '',
    currency: 'USD',
    beds: '',
    baths: '',
    areaM2: '',
    lotM2: '',
    yearBuilt: '',

    // Step 2: Location
    address: '',
    town: '',
    lat: '',
    lng: '',
    accessNotes: '',

    // Step 3: Legal & Title
    titleType: '',
    planoCatastrado: '',
    usoSuelo: '',
    concessionUntil: '',

    // Step 4: Utilities
    waterSource: '',
    waterLetter: false,
    electricProvider: '',
    internetProvider: '',

    // Step 5: Description
    description: '',

    // Step 6: Photos
    photos: [],

    // Step 7: Pricing & Terms
    negotiable: false,
    furnished: '',
    hoa: false,
    hoaFees: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basics', icon: Home, desc: 'Property type & details' },
    { id: 2, title: 'Location', icon: MapPin, desc: 'Address & coordinates' },
    { id: 3, title: 'Legal & Title', icon: FileText, desc: 'Ownership documents' },
    { id: 4, title: 'Utilities', icon: Zap, desc: 'Water, electric, internet' },
    { id: 5, title: 'Description', icon: Building, desc: 'Property highlights' },
    { id: 6, title: 'Photos', icon: Camera, desc: 'Upload images' },
    { id: 7, title: 'Pricing', icon: DollarSign, desc: 'Final details' }
  ];

  const propertyTypes = [
    { value: 'house', label: 'House', icon: Home },
    { value: 'condo', label: 'Condo', icon: Building },
    { value: 'lot', label: 'Lot/Land', icon: Maximize },
    { value: 'commercial', label: 'Commercial', icon: Package },
    { value: 'farm', label: 'Farm/Ranch', icon: Globe },
    { value: 'hotel', label: 'Hotel/Business', icon: Award }
  ];

  const towns = [
    'Tamarindo', 'Nosara', 'Playa Flamingo', 'Playa Grande', 'Potrero',
    'Samara', 'Playa del Coco', 'Playa Hermosa', 'Playa Conchal', 'Playas del Coco'
  ];

  const titleTypes = [
    { value: 'titled', label: 'Titled (Registered Property)', recommended: true },
    { value: 'maritime_concession', label: 'Maritime Zone Concession' },
    { value: 'cooperative', label: 'Cooperative Rights' },
    { value: 'other', label: 'Other (Specify)' }
  ];

  const waterSources = [
    { value: 'AYA', label: 'AYA (National Water)' },
    { value: 'ASADA', label: 'ASADA (Community Water)' },
    { value: 'well', label: 'Private Well' },
    { value: 'truck', label: 'Water Truck' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      isPrimary: uploadedPhotos.length === 0 && index === 0
    }));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const setPrimaryPhoto = (id) => {
    setUploadedPhotos(prev => prev.map(photo => ({
      ...photo,
      isPrimary: photo.id === id
    })));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.price) newErrors.price = 'Price is required';
    }

    if (step === 2) {
      if (!formData.town) newErrors.town = 'Town is required';
    }

    if (step === 3) {
      if (!formData.titleType) newErrors.titleType = 'Title type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateQualityScore = () => {
    let score = 0;
    if (formData.title) score += 10;
    if (formData.description && formData.description.length > 100) score += 15;
    if (formData.titleType === 'titled') score += 20;
    if (formData.waterLetter) score += 10;
    if (formData.planoCatastrado) score += 10;
    if (uploadedPhotos.length >= 5) score += 15;
    if (uploadedPhotos.length >= 10) score += 10;
    if (formData.lat && formData.lng) score += 10;
    return Math.min(score, 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Property Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Modern Ocean View Villa in Tamarindo"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                  errors.title ? 'border-red-500' : 'border-slate-200 focus:border-cyan-500'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-500">Make it descriptive and appealing to buyers</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Property Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('propertyType', type.value)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.propertyType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        formData.propertyType === type.value ? 'text-cyan-600' : 'text-slate-600'
                      }`} />
                      <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                    </button>
                  );
                })}
              </div>
              {errors.propertyType && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.propertyType}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Price *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="px-3 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="CRC">CRC</option>
                  </select>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="425000"
                    className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.price ? 'border-red-500' : 'border-slate-200 focus:border-cyan-500'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Year Built</label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  placeholder="2020"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {formData.propertyType !== 'lot' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.beds}
                    onChange={(e) => handleInputChange('beds', e.target.value)}
                    placeholder="3"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.baths}
                    onChange={(e) => handleInputChange('baths', e.target.value)}
                    placeholder="2.5"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Area (m²)</label>
                  <input
                    type="number"
                    value={formData.areaM2}
                    onChange={(e) => handleInputChange('areaM2', e.target.value)}
                    placeholder="220"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Lot (m²)</label>
                  <input
                    type="number"
                    value={formData.lotM2}
                    onChange={(e) => handleInputChange('lotM2', e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {formData.propertyType === 'lot' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Lot Size (m²) *</label>
                <input
                  type="number"
                  value={formData.lotM2}
                  onChange={(e) => handleInputChange('lotM2', e.target.value)}
                  placeholder="5000"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Town/Beach *</label>
              <select
                value={formData.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                  errors.town ? 'border-red-500' : 'border-slate-200 focus:border-cyan-500'
                }`}
              >
                <option value="">Select a town...</option>
                {towns.map(town => (
                  <option key={town} value={town}>{town}</option>
                ))}
              </select>
              {errors.town && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.town}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., 200m west of Tamarindo Church"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-2 text-sm text-slate-500">Costa Rica addresses often use landmarks</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Latitude (Optional)</label>
                <input
                  type="text"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                  placeholder="10.3024"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Longitude (Optional)</label>
                <input
                  type="text"
                  value={formData.lng}
                  onChange={(e) => handleInputChange('lng', e.target.value)}
                  placeholder="-85.8371"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-cyan-900">
                  <strong>Pro Tip:</strong> Adding GPS coordinates increases your listing quality score by 10 points and helps buyers find your property on the map.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Access Notes</label>
              <textarea
                value={formData.accessNotes}
                onChange={(e) => handleInputChange('accessNotes', e.target.value)}
                placeholder="e.g., Paved road access, 4x4 required during rainy season, 5 min walk to beach..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Title Type *</label>
              <div className="space-y-3">
                {titleTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('titleType', type.value)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      formData.titleType === type.value
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.titleType === type.value
                            ? 'border-cyan-500 bg-cyan-500'
                            : 'border-slate-300'
                        }`}>
                          {formData.titleType === type.value && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{type.label}</div>
                        </div>
                      </div>
                      {type.recommended && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.titleType && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.titleType}
                </p>
              )}
            </div>

            {formData.titleType === 'maritime_concession' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Concession Expires</label>
                <input
                  type="date"
                  value={formData.concessionUntil}
                  onChange={(e) => handleInputChange('concessionUntil', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Plano Catastrado Number</label>
              <input
                type="text"
                value={formData.planoCatastrado}
                onChange={(e) => handleInputChange('planoCatastrado', e.target.value)}
                placeholder="e.g., G-1234567-2020"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-2 text-sm text-slate-500">Official cadastral survey number (adds 10 points to quality score)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Uso de Suelo Number</label>
              <input
                type="text"
                value={formData.usoSuelo}
                onChange={(e) => handleInputChange('usoSuelo', e.target.value)}
                placeholder="Land use permit number"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
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
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Water Source</label>
              <select
                value={formData.waterSource}
                onChange={(e) => handleInputChange('waterSource', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select water source...</option>
                {waterSources.map(source => (
                  <option key={source.value} value={source.value}>{source.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="waterLetter"
                checked={formData.waterLetter}
                onChange={(e) => handleInputChange('waterLetter', e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="waterLetter" className="text-sm font-semibold text-slate-700 cursor-pointer">
                I have a Water Availability Letter (adds 10 points to quality score)
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Electric Provider</label>
              <input
                type="text"
                value={formData.electricProvider}
                onChange={(e) => handleInputChange('electricProvider', e.target.value)}
                placeholder="e.g., ICE, COOPEGUANACASTE, Solar"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Internet Provider</label>
              <input
                type="text"
                value={formData.internetProvider}
                onChange={(e) => handleInputChange('internetProvider', e.target.value)}
                placeholder="e.g., Fiber, Tigo, Kolbi, Starlink"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-2 text-sm text-slate-500">Fiber internet is highly valued by buyers</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Waves className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <strong>Utility Tip:</strong> Properties with reliable water (AYA/ASADA), electric connection, and fiber internet sell 40% faster on average.
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Property Description
                <span className="ml-2 text-slate-500 font-normal">(Current: {formData.description.length} characters)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property in detail. Include: views, construction quality, special features, nearby amenities, beach distance, rental history, etc. The more detail, the better!"
                rows={10}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
              />
              <p className="mt-2 text-sm text-slate-500">
                {formData.description.length < 100 ? (
                  <span className="text-amber-600">Add {100 - formData.description.length} more characters for 15 bonus points</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Great! Detailed descriptions improve your listing quality score
                  </span>
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                Pro Tips for Great Descriptions
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span>Mention ocean/mountain views and exact distances</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span>Highlight construction materials and condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span>Include rental income potential if applicable</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span>Mention nearby beaches, restaurants, and amenities</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Upload Photos (Max 10 on Free Plan)
              </label>

              {uploadedPhotos.length < 10 && (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="mb-2 text-sm font-semibold text-slate-700">Click to upload photos</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 10MB each</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {uploadedPhotos.length}/10 photos uploaded
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}

              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt="Property"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-all"
                        >
                          {photo.isPrimary ? '✓ Primary' : 'Set Primary'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {photo.isPrimary && (
                        <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PRIMARY
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`w-5 h-5 ${uploadedPhotos.length >= 5 ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={uploadedPhotos.length >= 5 ? 'text-green-700 font-semibold' : 'text-slate-600'}>
                    5+ photos (+15 points)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`w-5 h-5 ${uploadedPhotos.length >= 10 ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={uploadedPhotos.length >= 10 ? 'text-green-700 font-semibold' : 'text-slate-600'}>
                    10 photos (+10 bonus points)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Camera className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-purple-900 mb-2">Want More Photos?</div>
                  <p className="text-sm text-purple-800 mb-3">
                    Upgrade to Owner Featured ($99/mo) for unlimited photos + video + 3D tours
                  </p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all">
                    Learn About Featured
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="negotiable"
                checked={formData.negotiable}
                onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="negotiable" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Price is negotiable
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Furnished Status</label>
              <select
                value={formData.furnished}
                onChange={(e) => handleInputChange('furnished', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="partially">Partially Furnished</option>
                <option value="fully">Fully Furnished</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="hoa"
                checked={formData.hoa}
                onChange={(e) => handleInputChange('hoa', e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="hoa" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Property has HOA fees
              </label>
            </div>

            {formData.hoa && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Monthly HOA Fees (USD)</label>
                <input
                  type="number"
                  value={formData.hoaFees}
                  onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Quality Score Preview */}
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 border-2 border-cyan-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-600" />
                Your Listing Quality Score
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Score</span>
                  <span className="text-2xl font-bold text-cyan-600">{calculateQualityScore()}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${calculateQualityScore()}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Complete title information</span>
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">5+ photos uploaded</span>
                  <span className={uploadedPhotos.length >= 5 ? 'text-green-600 font-semibold' : 'text-slate-400'}>
                    {uploadedPhotos.length >= 5 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Detailed description (100+ chars)</span>
                  <span className={formData.description.length >= 100 ? 'text-green-600 font-semibold' : 'text-slate-400'}>
                    {formData.description.length >= 100 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">GPS coordinates added</span>
                  <span className={formData.lat && formData.lng ? 'text-green-600 font-semibold' : 'text-slate-400'}>
                    {formData.lat && formData.lng ? '✓' : '○'}
                  </span>
                </div>
              </div>

              {calculateQualityScore() < 70 && (
                <div className="mt-4 pt-4 border-t border-cyan-200">
                  <p className="text-sm text-slate-600">
                    <strong>Tip:</strong> Listings with 70+ quality score get 3x more views!
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30">
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${isActive ? 'text-cyan-600' : 'text-slate-600'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500 hidden md:block">{step.desc}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-slate-600">{steps[currentStep - 1].desc}</p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => alert('Publishing listing... (Demo)')}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Check className="w-5 h-5" />
                Publish Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeListingWizard;