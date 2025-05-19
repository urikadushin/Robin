import React from 'react';
import MapOverlay from './MapOverlay';

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
const WorldMap: React.FC<WorldMapProps> = ({ className, mode }) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Proxi map iframe below overlay */}
      <iframe
        src="https://map.proxi.co/r/Rko1A-RQvdSmSHS1GF_1"
        allow="geolocation; clipboard-write"
        width="100%"
        height="100%"
        style={{ borderWidth: 0, minHeight: 400, position: 'relative', zIndex: 2 }}
        allowFullScreen
        title="Proxi Interactive Map"
      ></iframe>
      <div style={{fontFamily: 'Sans-Serif', fontSize: '12px', color: '#000000', opacity: 0.5, paddingTop: '5px', position: 'relative', zIndex: 3}}>
        powered by <a href="https://www.proxi.co/?utm_source=poweredbyproxi" style={{color:'#000000'}} target="_blank" rel="noopener noreferrer">Proxi</a>
      </div>
      {/* Map overlay for light/dark mode - must be last and highest z-index */}
      <MapOverlay mode={mode} zIndex={10} />
    </div>
  );
};

export default WorldMap;
