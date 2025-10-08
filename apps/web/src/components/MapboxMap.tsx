import React from 'react';

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
  // Always show fallback map display since Mapbox integration has compatibility issues
  return (
    <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db' }}>
      <div className="text-center">
        <div className="text-slate-400 text-4xl mb-2">🗺️</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Map</h3>
        <p className="text-slate-600 mb-4">Map integration temporarily unavailable</p>
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
};

export default MapboxMap;