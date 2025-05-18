import React from 'react';

interface WorldMapProps {
  className?: string;
  interactive?: boolean;
}

/**
 * Displays a Proxi interactive map embed.
 * Interactivity is handled by Proxi, not by this component.
 */
const WorldMap: React.FC<WorldMapProps> = ({ className }) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* Proxi map iframe above overlay */}
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
    </div>
  );
};

export default WorldMap;
