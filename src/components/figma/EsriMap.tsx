import React, { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';

const EsriMap: React.FC<{ className?: string }> = ({ className }) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);

  useEffect(() => {
    let view: any;
    let map: any;
    let destroyed = false;

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/TileLayer',
    ], { css: true })
      .then(([Map, MapView, TileLayer]) => {
        if (!mapDiv.current || destroyed) return;
        map = new Map({});

        // Use public ESRI imagery as the base layer
        const imageryLayer = new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        });
        map.add(imageryLayer);

        // Use public ESRI boundaries/places as overlay
        const boundariesLayer = new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
        });
        map.add(boundariesLayer);

        view = new MapView({
          container: mapDiv.current,
          map,
          center: [34.8516, 31.0461],
          zoom: 6,
        });
        viewRef.current = view;
      });

    return () => {
      destroyed = true;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
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
