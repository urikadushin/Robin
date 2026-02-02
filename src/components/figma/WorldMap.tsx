import React from 'react';
import EsriMap from './EsriMap';

interface WorldMapProps {
  /** Additional CSS class name for the map container */
  className?: string;
  /** Whether the map should be interactive */
  interactive?: boolean;
}

/**
 * Displays an interactive map using ESRI's ArcGIS API.
 */
const WorldMap: React.FC<WorldMapProps> = ({ 
  className
}) => {
  return <EsriMap className={className} />;
};

export default WorldMap;
