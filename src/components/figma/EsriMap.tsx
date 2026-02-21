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
        // Load required ESRI modules from local SDK if available
        // Set up the options to point to our local backend SDK endpoint
        const [Map, MapView, WebTileLayer, esriConfig, Extent] = await loadModules(
          [
            'esri/Map',
            'esri/views/MapView',
            'esri/layers/WebTileLayer',
            'esri/config',
            'esri/geometry/Extent'
          ],
          {
            css: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/esri/themes/light/main.css',
            url: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/init.js'
          }
        );

        // Let the SDK infer its assets path from init.js
        // If fonts are missing later, we can add esriConfig.fontsUrl back.

        if (!mounted || !mapDiv.current) return;

        // Create the base map
        const newMap = new Map({});
        map = newMap;
        mapRef.current = newMap;

        // Add base imagery layer from local dataroot containing extracted tiles
        const baseUrl = window.location.origin;
        const baseLayer = new WebTileLayer({
          urlTemplate: `${baseUrl}/api/data/Maps/world_imagery/{level}/{col}/{row}.jpg`,
          id: 'base-layer',
        });
        newMap.add(baseLayer);

        // Add boundaries layer from local extracted tiles
        const boundariesLayer = new WebTileLayer({
          urlTemplate: `${baseUrl}/api/data/Maps/world_boundaries_and_places/{level}/{col}/{row}.png`,
          id: 'boundaries-layer',
        });
        newMap.add(boundariesLayer);

        // Create the view
        if (mapDiv.current) {
          const newView = new MapView({
            container: mapDiv.current,
            map: newMap,
            center: [40, 52], // Centered on Turkey/Middle East as requested
            zoom: 4, // Adjusted zoom level to show the entire region
            constraints: {
              minZoom: 4,
              maxZoom: 11,
              geometry: new Extent({
                xmin: -18,
                ymin: 0,
                xmax: 84,
                ymax: 65,
                spatialReference: { wkid: 4326 }
              })
            },
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
