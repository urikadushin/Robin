import React, { useRef, useEffect, useState } from 'react';
// import MapOverlay from './MapOverlay';
import Map, { MapRef } from 'react-map-gl';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';


interface WorldMapProps {
  className?: string;
  interactive?: boolean;
  mode: 'light' | 'dark'; // Add mode prop for overlay
}

/**
 * Displays a Proxi interactive map embed.
 * Interactivity is handled by Proxi, not by this component.
 * Includes a semi-transparent overlay for light/dark modes.
 */
// TEMP: Use a public Mapbox style for troubleshooting
const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_VIEW_STATE = {
  longitude: 34.8516, // Center on Israel by default (example)
  latitude: 31.0461,
  zoom: 6,
};

const WorldMap: React.FC<WorldMapProps> = ({ className, mode }) => {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  // Debug: log token and style
  console.log("Mapbox token:", MAPBOX_TOKEN);
  console.log("Mapbox style:", MAPBOX_STYLE);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        {...viewState}
        width="100%"
        height="100%"
        minHeight={400}
        onViewportChange={setViewState}
      />
      {/* Overlay for light/dark mode - must be last and highest z-index */}
      {/* <MapOverlay mode={mode} zIndex={10} /> */}
    </div>
  );
};

export default WorldMap;
