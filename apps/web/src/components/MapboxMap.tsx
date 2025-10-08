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
            offsetTop={-10}
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