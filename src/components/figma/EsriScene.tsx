import React, { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';

// Import the ESRI types we defined
import type Map from 'esri/Map';
import type SceneView from 'esri/views/SceneView';
import type TileLayer from 'esri/layers/TileLayer';

interface EsriSceneProps {
    className?: string;
    center?: [number, number];
    zoom?: number;
}

const EsriScene: React.FC<EsriSceneProps> = ({
    className,
    center = [40, 52],
    zoom = 4
}) => {
    const sceneDiv = useRef<HTMLDivElement>(null);
    const viewRef = useRef<SceneView | null>(null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        let mounted = true;
        let view: SceneView | null = null;
        let map: Map | null = null;

        const initializeScene = async () => {
            try {
                // Load required ESRI modules from local SDK if available
                // Set up the options to point to our local backend SDK endpoint
                const [Map, SceneView, WebTileLayer, esriConfig] = await loadModules(
                    [
                        'esri/Map',
                        'esri/views/SceneView',
                        'esri/layers/WebTileLayer',
                        'esri/config'
                    ],
                    {
                        css: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/esri/themes/light/main.css',
                        url: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/init.js'
                    }
                );

                if (!mounted || !sceneDiv.current) return;

                // Create the base map for 3D
                // We remove 'world-elevation' to ensure it doesn't try to fetch online elevation data,
                // which causes the entire globe to fail rendering offline.
                const newMap = new Map({});
                map = newMap;
                mapRef.current = newMap;

                // Add local base imagery layer using extracted tiles
                const baseUrl = window.location.origin;
                const baseLayer = new WebTileLayer({
                    urlTemplate: `${baseUrl}/api/data/Maps/world_imagery/{level}/{col}/{row}.jpg`,
                    id: 'base-layer',
                });
                newMap.add(baseLayer);

                // Add local boundaries layer
                // const boundariesLayer = new TileLayer({
                //     url: '/api/data/Maps/world_boundaries_and_places_4-11.tpk',
                //     id: 'boundaries-layer',
                // });
                // newMap.add(boundariesLayer);

                // Create the 3D Scene View
                const newView = new SceneView({
                    container: sceneDiv.current,
                    map: newMap,
                    center: center,
                    zoom: zoom,
                    camera: {
                        position: {
                            x: center[0],
                            y: center[1] - 5, // Offset for better 3D perspective
                            z: 5000000 // Altitude in meters
                        },
                        tilt: 45
                    },
                    ui: {
                        components: ['attribution']
                    },
                    environment: {
                        atmosphere: {
                            quality: 'high'
                        },
                        starsEnabled: true
                    }
                });

                view = newView;
                viewRef.current = newView;

            } catch (error) {
                console.error('Error initializing 3D Scene:', error);
            }
        };

        initializeScene();

        return () => {
            mounted = false;
            if (viewRef.current) {
                viewRef.current.destroy();
            }
            if (mapRef.current) {
                mapRef.current.destroy();
            }
            viewRef.current = null;
            mapRef.current = null;
        };
    }, [center, zoom]);

    return (
        <div
            ref={sceneDiv}
            className={`${className} w-full h-full relative`}
        />
    );
};

export default EsriScene;
