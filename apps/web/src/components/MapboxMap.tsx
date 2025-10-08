import React, { useState } from 'react';
import Map, { Marker, Popup } from '@vis.gl/react-mapbox';
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
  const [viewState, setViewState] = useState({
    latitude: center.latitude,
    longitude: center.longitude,
    zoom: zoom,
  });

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'beach': return '#3B82F6'; // blue
      case 'restaurant': return '#F59E0B'; // amber
      case 'activity': return '#10B981'; // emerald
      case 'property': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  if (!mapboxToken) {
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db' }}>
        <div className="text-center">
          <div className="text-slate-400 text-4xl mb-2">🗺️</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Map</h3>
          <p className="text-slate-600 mb-4">Mapbox access token not configured</p>
          <div className="space-y-2">
            {markers.slice(0, 3).map((marker) => (
              <div key={marker.id} className="text-sm text-slate-700">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  marker.type === 'beach' ? 'bg-blue-500' :
                  marker.type === 'restaurant' ? 'bg-amber-500' :
                  marker.type === 'activity' ? 'bg-emerald-500' :
                  'bg-red-500'
                }`}></span>
                {marker.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
            }}
          >
            <div
              style={{
                backgroundColor: getMarkerColor(marker.type),
                border: '2px solid white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            latitude={selectedMarker.latitude}
            longitude={selectedMarker.longitude}
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -10]}
          >
            <div className="p-2">
              <h3 className="font-semibold text-slate-900 mb-1">{selectedMarker.title}</h3>
              {selectedMarker.description && (
                <p className="text-sm text-slate-600">{selectedMarker.description}</p>
              )}
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                selectedMarker.type === 'beach' ? 'bg-blue-100 text-blue-800' :
                selectedMarker.type === 'restaurant' ? 'bg-amber-100 text-amber-800' :
                selectedMarker.type === 'activity' ? 'bg-emerald-100 text-emerald-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedMarker.type.charAt(0).toUpperCase() + selectedMarker.type.slice(1)}
              </span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapboxMap;