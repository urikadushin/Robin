import React from 'react';
import EsriMap from './EsriMap';


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
const WorldMap: React.FC<WorldMapProps> = ({ className }) => {
  return <EsriMap className={className} />;
};

export default WorldMap;
