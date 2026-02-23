import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { Loader2, Play, Pause, SkipBack, CircleDot, MapPin, Send } from 'lucide-react';
import { loadModules } from 'esri-loader';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Import ESRI types
// @ts-ignore
import type Map from 'esri/Map';
// @ts-ignore
import type SceneView from 'esri/views/SceneView';
// @ts-ignore
import type MapView from 'esri/views/MapView';
// @ts-ignore
import type GraphicsLayer from 'esri/layers/GraphicsLayer';
// @ts-ignore
import type Graphic from 'esri/Graphic';
// @ts-ignore
import type geometryEngine from 'esri/geometry/geometryEngine';
// @ts-ignore
import type Point from 'esri/geometry/Point';


export interface LightweightThreat {
    id: string;
    name: string;
}

interface TrajectorySceneTabProps {
    threat: FullMissileData;
    onClose?: () => void;
    allThreats?: LightweightThreat[];
    onThreatChange?: (id: string) => void;
}

interface TrajPoint {
    [key: string]: number;
}

type Stage = 'setup' | 'playback';

export const TrajectorySceneTab: React.FC<TrajectorySceneTabProps> = ({ threat, onClose, allThreats, onThreatChange }) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const sceneDiv = useRef<HTMLDivElement>(null);

    // ESRI Refs
    const viewSceneRef = useRef<SceneView | null>(null);
    const viewMapRef = useRef<MapView | null>(null);
    const graphicsLayerRouteRef = useRef<GraphicsLayer | null>(null);
    const graphicsLayerMarkerRef = useRef<GraphicsLayer | null>(null);
    const graphicsLayerRouteMapRef = useRef<GraphicsLayer | null>(null);
    const graphicsLayerMarkerMapRef = useRef<GraphicsLayer | null>(null);
    const graphicsLayerSetupRef = useRef<GraphicsLayer | null>(null);

    const esriGraphicRef = useRef<typeof Graphic | null>(null);
    const esriPointRef = useRef<typeof Point | null>(null);
    const esriPolylineRef = useRef<any | null>(null);
    const geometryEngineRef = useRef<typeof geometryEngine | null>(null);

    // Coordinate State
    const [stage, setStage] = useState<Stage>('setup');
    const [launchPos, setLaunchPos] = useState<{ lat: number, lon: number } | null>(null);
    const [targetPos, setTargetPos] = useState<{ lat: number, lon: number } | null>(null);
    const [hoverPos, setHoverPos] = useState<{ lat: number, lon: number } | null>(null);
    const [clickStep, setClickStep] = useState<0 | 1>(0); // 0 = picking launch, 1 = picking target

    // Latest refs to avoid stale closures in ESRI events
    const stageRef = useRef(stage);
    const clickStepRef = useRef(clickStep);
    const launchPosRef = useRef(launchPos);
    const targetPosRef = useRef(targetPos);

    useEffect(() => { stageRef.current = stage; }, [stage]);
    useEffect(() => { clickStepRef.current = clickStep; }, [clickStep]);
    useEffect(() => { launchPosRef.current = launchPos; }, [launchPos]);
    useEffect(() => { targetPosRef.current = targetPos; }, [targetPos]);

    const [data, setData] = useState<TrajPoint[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Playback state
    const [timeIndex, setTimeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Max Range for current threat (km)
    const maxRange = useMemo(() => {
        let rng = 0;

        const parseNum = (val: any) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            const match = String(val).replace(/,/g, '').match(/\d+(\.\d+)?/);
            return match ? parseFloat(match[0]) : 0;
        };

        // 1. Check weightAndSize (general properties mapped here)
        if (threat.weightAndSize) {
            const wsRng = threat.weightAndSize.find((w: any) => w.generic_name === 'maxRange' || w.generic_name === 'max_range');
            if (wsRng && wsRng.property_value) {
                const parsed = parseNum(wsRng.property_value);
                if (parsed > rng) rng = parsed;
            }
        }

        // 2. Check performance runs
        if (threat.performance && threat.performance.length > 0) {
            const ranges = threat.performance.map((p: any) => parseNum(p.rng)).filter(r => r > 0);
            if (ranges.length > 0) {
                const maxPerfRng = Math.max(...ranges);
                if (maxPerfRng > rng) rng = maxPerfRng;
            }
        }

        return rng > 0 ? rng : 500; // default 500km if completely unknown
    }, [threat]);

    useEffect(() => {
        let mounted = true;

        const initEsri = async () => {
            try {
                const [
                    Map, SceneView, MapView, WebTileLayer, GraphicsLayer, Graphic, Polyline, SimpleLineSymbol, Point, SimpleMarkerSymbol, geometryEngineImport
                ] = await loadModules(
                    [
                        'esri/Map',
                        'esri/views/SceneView',
                        'esri/views/MapView',
                        'esri/layers/WebTileLayer',
                        'esri/layers/GraphicsLayer',
                        'esri/Graphic',
                        'esri/geometry/Polyline',
                        'esri/symbols/SimpleLineSymbol',
                        'esri/geometry/Point',
                        'esri/symbols/SimpleMarkerSymbol',
                        'esri/geometry/geometryEngine'
                    ],
                    {
                        css: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/esri/themes/light/main.css',
                        url: '/api/data/SDK/arcgis_js_v434_api/arcgis_js_v434_api/arcgis_js_api/javascript/4.34/init.js'
                    }
                );

                if (!mounted) return;
                esriGraphicRef.current = Graphic;
                esriPointRef.current = Point;
                esriPolylineRef.current = Polyline;
                geometryEngineRef.current = geometryEngineImport;

                const baseUrl = window.location.origin;

                const mapScene = new Map();
                const map2D = new Map();

                const baseLayerScene = new WebTileLayer({
                    urlTemplate: `${baseUrl}/api/data/Maps/world_imagery/{level}/{col}/{row}.jpg`,
                    id: 'base-layer-scene'
                });
                mapScene.add(baseLayerScene);

                const baseLayer2D = new WebTileLayer({
                    urlTemplate: `${baseUrl}/api/data/Maps/world_imagery/{level}/{col}/{row}.jpg`,
                    id: 'base-layer-2d'
                });
                map2D.add(baseLayer2D);

                const boundariesLayerUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{level}/{row}/{col}';
                mapScene.add(new WebTileLayer({ urlTemplate: boundariesLayerUrl }));
                map2D.add(new WebTileLayer({ urlTemplate: boundariesLayerUrl }));

                // Layers
                const glRouteScene = new GraphicsLayer();
                const glMarkerScene = new GraphicsLayer();
                mapScene.addMany([glRouteScene, glMarkerScene]);
                graphicsLayerRouteRef.current = glRouteScene;
                graphicsLayerMarkerRef.current = glMarkerScene;

                const glRouteMap = new GraphicsLayer();
                const glMarkerMap = new GraphicsLayer();
                const glSetup = new GraphicsLayer(); // specifically for setup drawing
                map2D.addMany([glRouteMap, glMarkerMap, glSetup]);
                graphicsLayerRouteMapRef.current = glRouteMap;
                graphicsLayerMarkerMapRef.current = glMarkerMap;
                graphicsLayerSetupRef.current = glSetup;

                if (sceneDiv.current && !viewSceneRef.current) {
                    viewSceneRef.current = new SceneView({
                        container: sceneDiv.current,
                        map: mapScene,
                        camera: { position: { x: 35.1, y: 29.5, z: 2000000 }, tilt: 0 },
                        environment: { atmosphere: { quality: 'low' }, starsEnabled: false },
                        alphaCompositingEnabled: true,
                        background: { color: "transparent" } as any,
                        ui: { components: [] }
                    });
                }

                if (mapDiv.current && !viewMapRef.current) {
                    viewMapRef.current = new MapView({
                        container: mapDiv.current,
                        map: map2D,
                        center: [20.0, 40.0], // Centered roughly over Europe/Med
                        zoom: 4,
                        ui: { components: [] },
                        alphaCompositingEnabled: true,
                        background: { color: "transparent" } as any,
                        constraints: {
                            minZoom: 3,
                            maxZoom: 10,
                            geometry: {
                                type: "extent",
                                xmin: -20, // West (Atlantic)
                                ymin: 10,  // South (Africa)
                                xmax: 65,  // East (Iran)
                                ymax: 65,  // North (Norway)
                                spatialReference: { wkid: 4326 }
                            }
                        }
                    });

                    // Setup click listener for stage 1
                    (viewMapRef.current as any).on('click', (event: any) => {
                        if (stageRef.current !== 'setup') return;

                        const lat = Number(event.mapPoint.latitude.toFixed(5));
                        const lon = Number(event.mapPoint.longitude.toFixed(5));

                        if (clickStepRef.current === 0) {
                            setLaunchPos({ lat, lon });
                            setTargetPos(null);
                            setClickStep(1);
                        } else {
                            // Target bounds check: is it within max range?
                            if (launchPosRef.current) {
                                const dist = calculateHaversineDistance(
                                    launchPosRef.current.lat,
                                    launchPosRef.current.lon,
                                    lat,
                                    lon
                                );

                                if (dist > maxRange) {
                                    console.warn(`Target out of range! Distance: ${dist.toFixed(0)}km (Max: ${maxRange}km)`);
                                    return;
                                }
                            }

                            setTargetPos({ lat, lon });
                            setClickStep(0); // reset if they click again it sets launch again
                        }
                    });

                    // Track mouse movement for Lat/Lon hover
                    (viewMapRef.current as any).on('pointer-move', (event: any) => {
                        const mapPoint = (viewMapRef.current as any).toMap({ x: event.x, y: event.y });
                        if (mapPoint) {
                            setHoverPos({ lat: mapPoint.latitude, lon: mapPoint.longitude });
                        }
                    });
                    (viewMapRef.current as any).on('pointer-leave', () => {
                        setHoverPos(null);
                    });
                }
            } catch (err) {
                console.error("Error loading ESRI modules:", err);
            }
        };

        initEsri();

        return () => {
            mounted = false;
            // Robust cleanup to prevent WebGL memory leaks
            if (viewSceneRef.current) {
                if (viewSceneRef.current.map) {
                    (viewSceneRef.current.map as any).layers.removeAll();
                    (viewSceneRef.current.map as any).destroy();
                }
                viewSceneRef.current.destroy();
                viewSceneRef.current = null;
            }
            if (viewMapRef.current) {
                if (viewMapRef.current.map) {
                    (viewMapRef.current.map as any).layers.removeAll();
                    (viewMapRef.current.map as any).destroy();
                }
                viewMapRef.current.destroy();
                viewMapRef.current = null;
            }
        };
    }, []);

    // Draw Setup Graphics (Stage 1)
    useEffect(() => {
        if (!graphicsLayerSetupRef.current || !esriGraphicRef.current || !esriPointRef.current || !geometryEngineRef.current) return;
        const gl = graphicsLayerSetupRef.current;
        const Graphic = esriGraphicRef.current;
        const Point = esriPointRef.current;
        const ge = geometryEngineRef.current;
        gl.removeAll();

        if (launchPos) {
            const launchPt = new Point({ longitude: launchPos.lon, latitude: launchPos.lat });

            if (stage === 'setup') {
                // Draw Range Circle (Max Range)
                try {
                    // To avoid drawing massive circles that break WebGL or GeometryEngine, max 20,000 km
                    const safeRange = Math.min(maxRange, 20000);
                    const circlePoly = ge.geodesicBuffer(launchPt, safeRange, "kilometers");
                    if (circlePoly) {
                        gl.add(new Graphic({
                            geometry: circlePoly as any,
                            symbol: {
                                type: "simple-fill",
                                color: [34, 125, 141, 0.15],
                                outline: { color: [34, 125, 141, 0.8], width: 2 }
                            }
                        }));
                    }
                } catch (err) {
                    console.warn("Could not calculate geodesic buffer for range circle", err);
                }
            }

            // Draw Launch Marker
            gl.add(new Graphic({
                geometry: launchPt,
                symbol: { type: "simple-marker", color: [226, 119, 40], outline: { color: [255, 255, 255], width: 2 }, size: "12px" }
            }));
        }

        if (launchPos && targetPos) {
            const launchPt = new Point({ longitude: launchPos.lon, latitude: launchPos.lat });
            const targetPt = new Point({ longitude: targetPos.lon, latitude: targetPos.lat });

            if (stage === 'setup') {
                // Draw line
                gl.add(new Graphic({
                    geometry: { type: "polyline", paths: [[[launchPt.longitude, launchPt.latitude], [targetPt.longitude, targetPt.latitude]]] } as any,
                    symbol: { type: "simple-line", color: [255, 0, 0, 0.8], width: 2, style: "short-dash" }
                }));
            }

            // Draw Target Marker
            gl.add(new Graphic({
                geometry: targetPt,
                symbol: { type: "simple-marker", color: [255, 0, 0], outline: { color: [255, 255, 255], width: 2 }, size: "12px" }
            }));
        }
    }, [launchPos, targetPos, stage, maxRange]);


    const handleLaunch = async () => {
        if (!launchPos || !targetPos) return;

        setLoading(true);
        setError(null);
        try {
            // Find distance and bearing
            // Distance and Bearing
            let distanceKm = calculateHaversineDistance(launchPos.lat, launchPos.lon, targetPos.lat, targetPos.lon);
            let bearingDegrees = calculateBearing(launchPos.lat, launchPos.lon, targetPos.lat, targetPos.lon);

            // 1. Select the closest trajectory in threat.performance
            if (!threat.performance || threat.performance.length === 0) throw new Error("No performance data available for this threat.");

            let closestRun = threat.performance[0];
            let minDiff = Infinity;

            for (const run of threat.performance) {
                if (!run.trajectoryRvPath && !run.trajectoryBtPath) continue;
                const runRange = run.rng || 0; // km
                const diff = Math.abs(runRange - distanceKm);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestRun = run;
                }
            }

            const path = closestRun.trajectoryRvPath || closestRun.trajectoryBtPath;
            if (!path) throw new Error("No trajectory files found in performance runs.");

            // 2. Fetch
            const response = await fetch(`/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
            if (!response.ok) throw new Error('Failed to fetch trajectory file: ' + response.statusText);
            const text = await response.text();

            // 3. Parse and Transform
            const transformedData = transformTrajectory(text, launchPos, targetPos, bearingDegrees);

            setData(transformedData);
            setTimeIndex(0);
            setStage('playback');
            setIsPlaying(true);

            // Re-zoom Scene view to frame the whole trajectory
            if (viewSceneRef.current && esriPointRef.current) {
                const Point = esriPointRef.current;
                const launchPt = new Point({ longitude: launchPos.lon, latitude: launchPos.lat });
                const targetPt = new Point({ longitude: targetPos.lon, latitude: targetPos.lat });

                (viewSceneRef.current as any).goTo({
                    target: [launchPt, targetPt],
                    tilt: 45
                }, { speedFactor: 0.5 });
            }

            // Zoom 2D map to fit trajectory bounds (adding 1.5x padding buffer)
            if (viewMapRef.current && esriPointRef.current) {
                const Point = esriPointRef.current;
                const launchPt = new Point({ longitude: launchPos.lon, latitude: launchPos.lat });
                const targetPt = new Point({ longitude: targetPos.lon, latitude: targetPos.lat });

                (viewMapRef.current as any).goTo({
                    target: [launchPt, targetPt]
                }, { speedFactor: 0.7 });
            }

        } catch (e: any) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-playback logic
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = Date.now();

        const loop = () => {
            if (isPlaying && data.length > 0 && stage === 'playback') {
                const now = Date.now();
                if (now - lastTime > 30) {
                    setTimeIndex(prev => {
                        if (prev >= data.length - 1) {
                            setIsPlaying(false);
                            return prev;
                        }
                        return prev + 1;
                    });
                    lastTime = now;
                }
                animationFrameId = requestAnimationFrame(loop);
            }
        };

        if (isPlaying && stage === 'playback') {
            animationFrameId = requestAnimationFrame(loop);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, data.length, stage]);


    // Draw Route Polyline (Playback)
    useEffect(() => {
        if (stage !== 'playback' || !data || data.length === 0 || !esriGraphicRef.current || !graphicsLayerRouteRef.current || !graphicsLayerRouteMapRef.current) return;

        const Graphic = esriGraphicRef.current;
        const path = data.map(pt => [pt.lon, pt.lat, pt.alt]);

        const polylineGraphicScene = new Graphic({
            geometry: { type: "polyline", paths: [path] } as any,
            symbol: { type: "simple-line", color: [226, 119, 40], width: 4 }
        });

        const polylineGraphicMap = new Graphic({
            geometry: { type: "polyline", paths: [path] } as any,
            symbol: { type: "simple-line", color: [34, 125, 141], width: 3 }
        });

        const launchPt = launchPosRef.current ? { longitude: launchPosRef.current.lon, latitude: launchPosRef.current.lat } : { longitude: path[0][0], latitude: path[0][1] };
        const targetPt = targetPosRef.current ? { longitude: targetPosRef.current.lon, latitude: targetPosRef.current.lat } : { longitude: path[path.length - 1][0], latitude: path[path.length - 1][1] };

        const launchGraphicMap = new Graphic({
            geometry: { type: "point", ...launchPt } as any,
            symbol: { type: "simple-marker", color: [226, 119, 40], outline: { color: [255, 255, 255], width: 2 }, size: "12px" }
        });

        const targetGraphicMap = new Graphic({
            geometry: { type: "point", ...targetPt } as any,
            symbol: { type: "simple-marker", color: [255, 0, 0], outline: { color: [255, 255, 255], width: 2 }, size: "12px" }
        });

        graphicsLayerRouteRef.current.removeAll();
        graphicsLayerRouteRef.current.add(polylineGraphicScene);

        graphicsLayerRouteMapRef.current.removeAll();
        graphicsLayerRouteMapRef.current.addMany([polylineGraphicMap, launchGraphicMap, targetGraphicMap]);

    }, [data, stage]);

    // Update Marker position based on timeIndex (Playback)
    useEffect(() => {
        if (stage !== 'playback' || !data || data.length === 0 || !esriGraphicRef.current || !graphicsLayerMarkerRef.current || !graphicsLayerMarkerMapRef.current) return;

        const Graphic = esriGraphicRef.current;
        const ptData = data[timeIndex];
        if (!ptData) return;

        const pointGraphicScene = new Graphic({
            geometry: { type: "point", longitude: ptData.lon, latitude: ptData.lat, z: ptData.alt } as any,
            symbol: { type: "simple-marker", color: [255, 0, 0], outline: { color: [255, 255, 255], width: 2 }, size: "12px" }
        });

        const pointGraphicMap = new Graphic({
            geometry: { type: "point", longitude: ptData.lon, latitude: ptData.lat } as any,
            symbol: { type: "simple-marker", color: [255, 0, 0], outline: { color: [255, 255, 255], width: 2 }, size: "10px" }
        });

        graphicsLayerMarkerRef.current.removeAll();
        graphicsLayerMarkerRef.current.add(pointGraphicScene);

        graphicsLayerMarkerMapRef.current.removeAll();
        graphicsLayerMarkerMapRef.current.add(pointGraphicMap);

    }, [timeIndex, data, stage]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPlaying(false);
        setTimeIndex(parseInt(e.target.value, 10));
    };

    const currentPoint = data[timeIndex] || null;

    if (!threat.performance || threat.performance.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#f5f6f7] font-sans">
            {/* Header / Nav */}
            <div className="h-16 bg-[#144a54] flex flex-shrink-0 items-center justify-between px-6 shadow-md z-20">
                <div className="flex flex-col">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#227d8d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        3D Trajectory Intel
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    {stage === 'playback' && (
                        <button onClick={() => {
                            setStage('setup');
                            setLaunchPos(null);
                            setTargetPos(null);
                            setData([]);
                            setTimeIndex(0);
                            setIsPlaying(false);
                            setClickStep(0);
                            if (graphicsLayerRouteRef.current) graphicsLayerRouteRef.current.removeAll();
                            if (graphicsLayerMarkerRef.current) graphicsLayerMarkerRef.current.removeAll();
                            if (graphicsLayerRouteMapRef.current) graphicsLayerRouteMapRef.current.removeAll();
                            if (graphicsLayerMarkerMapRef.current) graphicsLayerMarkerMapRef.current.removeAll();
                        }} className="pointer-events-auto bg-white/10 hover:bg-[#227d8d] border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                            <SkipBack className="w-4 h-4" />
                            Back to Setup
                        </button>
                    )}
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all rounded-[10px] group">
                        <span className="text-xl font-light transform group-hover:rotate-90 transition-transform">✕</span>
                    </button>
                </div>
            </div>

            {/* Split View Container using Absolute Positioning for robust ArcGis rendering */}
            <div className="flex-1 relative px-6 py-2 pb-2 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 select-none">
                    <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#227d8d] blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-[10%] right-[10%] w-[45%] h-[45%] bg-[#1a5f6b] blur-[140px] rounded-full" />
                </div>

                <div className="relative w-full h-full">

                    {/* 3D Scene - Absolute left 2/3 */}
                    <div ref={sceneDiv}
                        className="absolute left-0 top-0 transition-all duration-500 rounded-xl overflow-hidden shadow-sm border border-[#E2E8F0] bg-[#0d2232]"
                        style={{
                            width: 'calc(66.666% - 12px)',
                            height: '100%',
                            opacity: stage === 'setup' ? 0 : 1,
                            pointerEvents: stage === 'setup' ? 'none' : 'auto',
                            zIndex: stage === 'setup' ? 1 : 10
                        }}
                    >
                        <div className="absolute inset-x-0 top-0 p-4 z-10 pointer-events-none bg-gradient-to-b from-black/50 to-transparent">
                            <h3 className="text-white font-bold text-[16px] drop-shadow-md">3D Earth Trajectory</h3>
                        </div>
                    </div>

                    {/* 2D Map - Absolute. Left 2/3 (Setup) -> Bottom Right 1/3 (Playback) */}
                    <div className="absolute transition-all duration-500 rounded-xl overflow-hidden shadow-sm border border-[#E2E8F0] z-20 bg-[#0d2232]"
                        style={{
                            ...(stage === 'setup'
                                ? { left: 0, top: 0, width: 'calc(66.666% - 12px)', height: '100%', backgroundColor: '#0d2232' }
                                : { left: 'calc(66.666% + 12px)', top: 'calc(50% + 12px)', width: 'calc(33.333% - 12px)', height: 'calc(50% - 12px)', backgroundColor: '#0d2232' })
                        }}
                    >
                        <div ref={mapDiv} className="w-full h-full" />

                        {/* Hover coordinates overlay */}
                        {hoverPos && stage === 'setup' && (
                            <div className="absolute bottom-4 left-4 bg-[#0d2232]/80 backdrop-blur-sm px-3 py-1.5 rounded shadow border border-white/10 text-white font-mono text-[11px] pointer-events-none z-50 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-[#4ecdc4]" />
                                <span>Lat: {hoverPos.lat.toFixed(5)}</span>
                                <span className="opacity-50">|</span>
                                <span>Lon: {hoverPos.lon.toFixed(5)}</span>
                            </div>
                        )}
                        <div className="absolute inset-x-0 top-0 p-4 z-10 pointer-events-none bg-gradient-to-b from-black/50 to-transparent flex justify-between">
                            <h3 className="text-white font-bold text-[16px] drop-shadow-md">{stage === 'setup' ? 'Select Launch & Target Locations' : '2D Ground Track'}</h3>
                            {stage === 'setup' && <span className="text-white/80 font-mono text-sm drop-shadow-md animate-pulse">Click map to select {clickStep === 0 ? 'Launch' : 'Target'}</span>}
                        </div>
                    </div>

                    {/* Setup Panel - Absolute right 1/3 */}
                    <div className="absolute right-0 top-0 transition-all duration-500 z-30 flex flex-col"
                        style={{
                            width: 'calc(33.333% - 12px)',
                            height: '100%',
                            opacity: stage === 'setup' ? 1 : 0,
                            pointerEvents: stage === 'setup' ? 'auto' : 'none',
                            transform: stage === 'setup' ? 'translateX(0)' : 'translateX(20px)'
                        }}
                    >
                        {/* Setup Configuration Panel */}
                        <div className="w-full h-full bg-white relative flex flex-col rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden p-4">
                            <h3 className="text-[#144a54] font-bold text-lg mb-3 border-b border-gray-100 pb-2">Mission Configuration</h3>

                            <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
                                <div>
                                    <label className="block text-sm font-semibold text-[#6b788e] mb-1 uppercase tracking-wide">Threat System</label>
                                    <select
                                        title="Select Threat" aria-label="Select Threat"
                                        value={threat.missile.id?.toString() || ''}
                                        onChange={(e) => { if (onThreatChange) onThreatChange(e.target.value); }}
                                        className="w-full bg-[#f8fafc] text-[#144a54] border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-[#4ecdc4] font-medium"
                                    >
                                        {allThreats?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <p className="text-[11px] text-slate-500 mt-1.5 font-mono">Max Range: {maxRange} km</p>
                                </div>

                                <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CircleDot className="w-4 h-4 text-orange-500" />
                                            <span className="font-bold text-slate-700 text-sm">Launch Position</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">Latitude</label>
                                            <input
                                                type="number" step="any"
                                                className="w-full bg-white border border-orange-200 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                                                placeholder="e.g. 51.76"
                                                value={launchPos?.lat || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setLaunchPos(prev => prev ? { ...prev, lat: isNaN(val) ? 0 : val } : { lat: isNaN(val) ? 0 : val, lon: 0 });
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">Longitude</label>
                                            <input
                                                type="number" step="any"
                                                className="w-full bg-white border border-orange-200 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                                                placeholder="e.g. 47.19"
                                                value={launchPos?.lon || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setLaunchPos(prev => prev ? { ...prev, lon: isNaN(val) ? 0 : val } : { lat: 0, lon: isNaN(val) ? 0 : val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            <span className="font-bold text-slate-700 text-sm">Target Position</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">Latitude</label>
                                            <input
                                                type="number" step="any"
                                                className="w-full bg-white border border-red-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                                placeholder="e.g. 32.08"
                                                value={targetPos?.lat || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setTargetPos(prev => prev ? { ...prev, lat: isNaN(val) ? 0 : val } : { lat: isNaN(val) ? 0 : val, lon: 0 });
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">Longitude</label>
                                            <input
                                                type="number" step="any"
                                                className="w-full bg-white border border-red-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                                placeholder="e.g. 34.78"
                                                value={targetPos?.lon || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setTargetPos(prev => prev ? { ...prev, lon: isNaN(val) ? 0 : val } : { lat: 0, lon: isNaN(val) ? 0 : val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 shrink-0 border-t border-gray-100">
                                <button
                                    onClick={handleLaunch}
                                    disabled={!launchPos || !targetPos || loading}
                                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-bold tracking-wide shadow-sm
                                        ${(!launchPos || !targetPos)
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                            : loading
                                                ? 'bg-[#144a54] text-white opacity-80 cursor-wait'
                                                : 'bg-[#89bdd3] hover:bg-[#227d8d] hover:shadow text-white cursor-pointer active:scale-[0.98]'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                    Launch Trajectory
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Playback Details Panel (Threat Model) - Absolute right config area top half */}
                    <div className="absolute right-0 top-0 transition-all duration-500 z-10 flex flex-col"
                        style={{
                            width: 'calc(33.333% - 12px)',
                            height: 'calc(50% - 12px)',
                            opacity: stage === 'playback' ? 1 : 0,
                            pointerEvents: stage === 'playback' ? 'auto' : 'none',
                            transform: stage === 'playback' ? 'translateX(0)' : 'translateX(20px)'
                        }}
                    >
                        <div className="w-full h-full bg-[#144a54] relative flex flex-col rounded-xl border border-[#0d343b] shadow-sm overflow-hidden min-h-0">
                            <div className="absolute inset-x-0 top-0 p-4 z-10 pointer-events-none bg-gradient-to-b from-black/50 to-transparent flex justify-between">
                                <h3 className="text-white font-bold text-[16px] drop-shadow-md">Flight Telemetry: {threat.missile.name}</h3>
                            </div>
                            <div className="flex-1 w-full relative pt-12 p-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
                                <div className="flex-1 min-h-[140px] flex flex-col">
                                    <h4 className="text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">Altitude Profile (km)</h4>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.slice(0, timeIndex + 1).map(d => ({ ...d, altKm: d.alt !== undefined ? d.alt / 1000 : 0 }))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                                                <XAxis dataKey="time" stroke="#ffffff44" tick={{ fill: '#ffffff88', fontSize: 10 }} />
                                                <YAxis stroke="#ffffff44" tick={{ fill: '#ffffff88', fontSize: 10 }} width={45} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0d343b', borderColor: '#227d8d' }} itemStyle={{ color: '#4ecdc4' }} />
                                                <Line type="monotone" dataKey="altKm" stroke="#4ecdc4" strokeWidth={2} dot={false} isAnimationActive={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[140px] flex flex-col">
                                    <h4 className="text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">Velocity (m/s)</h4>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.slice(0, timeIndex + 1)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                                                <XAxis dataKey="time" stroke="#ffffff44" tick={{ fill: '#ffffff88', fontSize: 10 }} />
                                                <YAxis stroke="#ffffff44" tick={{ fill: '#ffffff88', fontSize: 10 }} width={45} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0d343b', borderColor: '#227d8d' }} itemStyle={{ color: '#ff9f43' }} />
                                                <Line type="monotone" dataKey="vz" name="Vz" stroke="#ff9f43" strokeWidth={2} dot={false} isAnimationActive={false} />
                                                <Line type="monotone" dataKey="vx" name="Vx" stroke="#A3E635" strokeWidth={2} dot={false} isAnimationActive={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Scrubber Bar (Only Playback) */}
            <div className={`h-16 bg-[#F8FAFC] flex items-center px-6 gap-4 border-t border-[#E2E8F0] transition-all overflow-hidden ${stage === 'setup' ? 'h-0 border-t-0 p-0 opacity-0' : 'opacity-100'}`}>
                {stage === 'playback' && (
                    <>
                        <button onClick={() => { setIsPlaying(false); setTimeIndex(0); }} className="p-2 text-[#6b788e] hover:text-[#144a54] hover:bg-[#E2E8F0] rounded-full transition-colors"><SkipBack className="w-5 h-5" /></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-[#227d8d] text-white hover:bg-[#1a5f6b] rounded-full transition-colors shadow-sm" disabled={data.length === 0}>
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        <div className="flex-1 flex items-center gap-4 px-4">
                            <span className="text-[12px] font-bold text-[#6b788e] w-16 text-right font-mono">{currentPoint?.time?.toFixed(2) || (timeIndex * 0.1).toFixed(2)}s</span>
                            <input
                                type="range"
                                min="0"
                                max={Math.max(0, data.length - 1)}
                                value={timeIndex}
                                onChange={handleSliderChange}
                                disabled={data.length === 0}
                                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    '--progress': '100%',
                                    '--accent': '#227d8d',
                                    backgroundColor: '#227d8d'
                                } as React.CSSProperties}
                            />
                            <span className="text-[12px] font-bold text-[#6b788e] w-16 font-mono">{data.length > 0 ? (data[data.length - 1].time?.toFixed(2) || ((data.length - 1) * 0.1).toFixed(2)) : '0.00'}s</span>
                        </div>
                    </>
                )}
            </div>

            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-50">
                    <Loader2 className="w-8 h-8 text-[#227d8d] animate-spin mb-2" />
                    <span className="text-[12px] font-bold text-[#227d8d] uppercase">Loading Trajectory...</span>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-lg border border-red-200 max-w-md text-center">
                        <p className="font-bold mb-2 text-lg">Error Loading Scene</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 font-medium transition-colors">Dismiss</button>
                    </div>
                </div>
            )}
        </div>
    );
};


// Mathematical Helper Functions

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Converts from degrees to radians.
    const toRad = (val: number) => val * Math.PI / 180;
    const toDeg = (val: number) => val * 180 / Math.PI;

    const startLat = toRad(lat1);
    const startLng = toRad(lon1);
    const destLat = toRad(lat2);
    const destLng = toRad(lon2);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

    let brng = Math.atan2(y, x);
    brng = toDeg(brng);
    return (brng + 360) % 360;
}

function transformTrajectory(fileText: string, launch: { lat: number, lon: number }, target: { lat: number, lon: number }, targetBearing: number): TrajPoint[] {
    const lines = fileText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    let headersMatch: string[] = ['time', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'alt'];
    let startIndex = 0;

    if (lines[0].startsWith('#')) {
        headersMatch = lines[0].substring(1).split(',').map(h => h.trim());
        startIndex = 1;
    }

    const parsedData: TrajPoint[] = [];
    for (let i = startIndex; i < lines.length; i++) {
        const values = lines[i].split(/\s+/).map(v => parseFloat(v));
        if (values.length >= headersMatch.length) {
            const point: TrajPoint = {};
            headersMatch.forEach((h, idx) => {
                point[h] = values[idx];
            });
            parsedData.push(point);
        }
    }

    // Time-based Sampling (every 0.5 seconds)
    const sampledData: TrajPoint[] = [];

    // First find the starting time
    const minTime = parsedData.length > 0 && parsedData[0].time !== undefined ? parsedData[0].time : 0;
    let nextTargetTime = minTime;

    for (const point of parsedData) {
        // Fallback to index if time is missing
        if (point.time === undefined) {
            sampledData.push(point);
            continue;
        }

        if (point.time >= nextTargetTime) {
            // Normalize time to start at 0
            sampledData.push({
                ...point,
                time: point.time - minTime
            });
            nextTargetTime = point.time + 0.5;
        }
    }

    // If data uses x,y in meters, convert to Lat/Lon based on Launch
    // Base trajectory azimuth is usually 0 (North) or arbitrary. 
    // We assume the final point of the raw trajectory defines its natural bearing or it just goes +X.
    // To make it simple, we will project X,Y relative to launch directly along the targetBearing.

    // Calculate raw distance of each point from start (0,0 assumed or parsedData[0].x, parsedData[0].y)
    const originX = sampledData[0]?.x || 0;
    const originY = sampledData[0]?.y || 0;

    // Scale X/Y to lat/lon roughly. 1 degree latitude = ~111.32km = 111320m.
    // Better: We compute distance from start for each point:
    return sampledData.map(pt => {
        // Assume x,y are in meters. Find linear distance travel from origin
        const dx = (pt.x || 0) - originX;
        const dy = (pt.y || 0) - originY;
        const distFromStartMeters = Math.sqrt(dx * dx + dy * dy);

        // We push this distance along targetBearing from LaunchPos using rough sphere projection
        const brngRad = targetBearing * Math.PI / 180;
        const R = 6378137; // Earth radius in meters

        const lat1 = launch.lat * Math.PI / 180;
        const lon1 = launch.lon * Math.PI / 180;
        const d_R = distFromStartMeters / R;

        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d_R) + Math.cos(lat1) * Math.sin(d_R) * Math.cos(brngRad));
        const lon2 = lon1 + Math.atan2(Math.sin(brngRad) * Math.sin(d_R) * Math.cos(lat1), Math.cos(d_R) - Math.sin(lat1) * Math.sin(lat2));

        // Let's assume alt is z or alt
        let altMeters = pt.alt !== undefined ? pt.alt : (pt.z !== undefined ? pt.z : 0);
        // "missiles are ballistic that exit the atmosphere so alt is probably in km"
        // Let's check max alt. If it's single digits for a ballistic missile, it's probably km.
        // But if it's thousands, it's meters.
        if (altMeters < 5000 && altMeters > 0) { // e.g. 1000km is 1000
            altMeters = altMeters * 1000;
        }

        return {
            ...pt,
            lon: (lon2 * 180) / Math.PI,
            lat: (lat2 * 180) / Math.PI,
            alt: altMeters
        };
    });
}
