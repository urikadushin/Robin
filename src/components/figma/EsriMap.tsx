import React, { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';

// Import the ESRI types we defined
import type Map from 'esri/Map';
import type MapView from 'esri/views/MapView';
import type TileLayer from 'esri/layers/TileLayer';

interface EsriMapProps {
  className?: string;
}

// Extend the window object to include the require function
declare global {
  interface Window {
    require: any;
  }
}

const EsriMap: React.FC<EsriMapProps> = ({ className }) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const mapRef = useRef<Map | null>(null);

  // Initialize the map and view
  useEffect(() => {
    let mounted = true;
    let view: MapView | null = null;
    let map: Map | null = null;

    const initializeMap = async () => {
      try {
        // Load required ESRI modules
        const [Map, MapView, TileLayer] = await loadModules(
          [
            'esri/Map',
            'esri/views/MapView',
            'esri/layers/TileLayer',
          ],
          { css: true }
        );

        if (!mounted || !mapDiv.current) return;

        // Create the base map
        const newMap = new Map({});
        map = newMap;
        mapRef.current = newMap;

        // Add base imagery layer
        const baseLayer = new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          id: 'base-layer',
        });
        newMap.add(baseLayer);

        // Add boundaries layer
        const boundariesLayer = new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
          id: 'boundaries-layer',
        });
        newMap.add(boundariesLayer);

        // Create the view
        if (mapDiv.current) {
          const newView = new MapView({
            container: mapDiv.current,
            map: newMap,
            center: [54, 27], // Centered to include Iran, Yemen, and Israel
            zoom: 5, // Adjusted zoom level to show the entire region
            ui: {
              components: ['attribution']
            },
            highlightOptions: {
              color: '#00b3fd',
              fillOpacity: 0.3,
            },
          });

          view = newView;
          viewRef.current = newView;
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      mounted = false;
      
      // Safely destroy view if it exists
      const currentView = viewRef.current;
      if (currentView) {
        try {
          currentView.destroy();
        } catch (error) {
          console.error('Error destroying view:', error);
        }
      }
      
      // Safely destroy map if it exists
      const currentMap = mapRef.current;
      if (currentMap) {
        try {
          currentMap.destroy();
        } catch (error) {
          console.error('Error destroying map:', error);
        }
      }
      
      // Clean up refs
      viewRef.current = null;
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapDiv}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
};

export default EsriMap;
