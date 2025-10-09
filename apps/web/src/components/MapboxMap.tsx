import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: 'beach' | 'restaurant' | 'activity' | 'property';
  icon?: string;
}

interface MapboxMapProps {
  markers: MapMarker[];
  center: { latitude: number; longitude: number };
  zoom?: number;
  height?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  markers,
  center,
  zoom = 12,
  height = '400px'
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db' }}>
        <div className="text-center">
          <div className="text-slate-400 text-4xl mb-2">🗺️</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Map Unavailable</h3>
          <p className="text-slate-600 mb-4">Mapbox access token not configured</p>
        </div>
      </div>
    );
  }

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'beach': return '#3b82f6'; // blue-500
      case 'restaurant': return '#f59e0b'; // amber-500
      case 'activity': return '#10b981'; // emerald-500
      case 'property': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Map
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: getMarkerColor(marker.type) }}
            />
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
            offsetTop={-10}
          >
            <div className="p-2">
              <h3 className="font-semibold text-slate-900">{selectedMarker.title}</h3>
              {selectedMarker.description && (
                <p className="text-sm text-slate-600 mt-1">{selectedMarker.description}</p>
              )}
              <div className="flex items-center mt-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getMarkerColor(selectedMarker.type) }}
                />
                <span className="text-xs text-slate-500 capitalize">{selectedMarker.type}</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapboxMap;