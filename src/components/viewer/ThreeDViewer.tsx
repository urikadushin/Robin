import React, { Suspense, useMemo, useLayoutEffect, useState, Component, ReactNode } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { Box, Package, HelpCircle, AlertCircle } from 'lucide-react';

// Error Boundary for 3D Parts to prevent full app crash
class PartErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return this.props.fallback || null;
        return this.props.children;
    }
}

interface ModelProps {
    url: string;
    partName: string;
    opacity: number;
}

const MissilePart = ({ url, partName, opacity }: ModelProps) => {
    const obj = useLoader(OBJLoader, url);
    const clonedObj = useMemo(() => obj.clone(), [obj]);

    useLayoutEffect(() => {
        clonedObj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: partName.includes('RV') ? '#ef4444' : '#227d8d',
                    metalness: 0.8,
                    roughness: 0.2,
                    transparent: true,
                    opacity: opacity,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                });
            }
        });
    }, [clonedObj, partName, opacity]);

    return <primitive object={clonedObj} />;
};

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                    Initializing 3D Core: {progress.toFixed(0)}%
                </span>
            </div>
        </Html>
    );
};

interface ThreeDViewerProps {
    missileName: string;
    assets?: any[];
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ missileName, assets = [] }) => {
    const nameLower = missileName.toLowerCase();

    const parts = useMemo(() => {
        // If we have database assets of type 3dModel, use them exclusively
        const dbModels = assets.filter(img => img.image_type === '3dModel');

        if (dbModels.length > 0) {
            return dbModels.map(m => ({
                id: m.part_name,
                label: m.part_name === 'UN' ? 'Unit Assembly' :
                    m.part_name === 'RV' ? 'Re-entry Vehicle' :
                        m.part_name === 'BT' ? 'Booster / Tail' :
                            m.part_name.startsWith('S') ? `Stage ${m.part_name.substring(1)}` : m.part_name,
                url: `http://localhost:3000/api/data/3DModel/${m.image_path}`
            }));
        }

        // Fallback to legacy heuristic if no DB assets found
        const potentialParts = [
            { id: 'UN', suffix: 'UN', label: 'Unit Assembly' },
            { id: 'RV', suffix: 'RV', label: 'Re-entry Vehicle' },
            { id: 'BT', suffix: 'BT', label: 'Booster / Tail' },
            { id: 'S1', suffix: 'S1', label: 'Stage 1' },
            { id: 'S2', suffix: 'S2', label: 'Stage 2' },
            { id: 'S3', suffix: 'S3', label: 'Stage 3' },
        ];

        // ... existing fallback logic ...
        const getUrl = (p: { suffix: string }) => {
            if (nameLower === 'bulava') return `http://localhost:3000/api/data/3DModel/Bulava_${p.suffix}.obj`;
            return `http://localhost:3000/api/data/3DModel/${nameLower}${p.suffix}.obj`;
        };

        const isSingleFileModel = nameLower.includes('shahed') || nameLower.includes('aim') || nameLower.includes('hellfire');
        if (isSingleFileModel) {
            const baseUrl = nameLower.includes('shahed') ? 'shahed' : nameLower;
            return [{ id: 'UN', suffix: '', label: 'Unit Assembly', url: `http://localhost:3000/api/data/3DModel/${baseUrl}.obj` }];
        }

        return potentialParts
            .filter(p => nameLower === 'bulava' ? ['BT', 'S1', 'S3'].includes(p.id) : true)
            .map(p => ({ ...p, url: getUrl(p) }));
    }, [missileName, nameLower, assets]);

    const [selectedPartId, setSelectedPartId] = useState<string>('UN');

    const visibleParts = useMemo(() => {
        return parts.filter(p => p.id === selectedPartId);
    }, [parts, selectedPartId]);

    if (parts.length === 0) {
        return <div className="h-full flex items-center justify-center text-gray-400">No 3D Model available</div>;
    }

    return (
        <div className="relative w-full h-full bg-[#f8fafc] rounded-xl overflow-hidden shadow-inner">
            {/* Part Selection Pills */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm transition-all hover:bg-white">
                    <Box className="w-4 h-4 text-teal-600" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Spatial Analysis Mode</span>
                </div>

                <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                    {parts.map(part => (
                        <button
                            key={part.id}
                            onClick={() => setSelectedPartId(part.id)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-200 ${selectedPartId === part.id
                                ? 'bg-teal-600 text-white shadow-md scale-105'
                                : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
                                }`}
                        >
                            {part.id}
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="p-2 bg-white/80 backdrop-blur rounded-lg border border-slate-200 shadow-sm cursor-help" title="Rotate: Drag | Zoom: Scroll | Pan: Right Click">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
                <Canvas shadows dpr={[1, 2]}>
                    <Suspense fallback={<Loader />}>
                        <PerspectiveCamera makeDefault fov={35} position={[10, 10, 10]} />
                        <Stage environment="city" intensity={0.5} adjustCamera={true}>
                            <group rotation={[0, 0, 0]}>
                                {visibleParts.map((p) => (
                                    <PartErrorBoundary key={p.id} fallback={null}>
                                        <Suspense fallback={null}>
                                            <MissilePart
                                                url={p.url}
                                                partName={p.id}
                                                opacity={1.0}
                                            />
                                        </Suspense>
                                    </PartErrorBoundary>
                                ))}
                            </group>
                        </Stage>
                        <OrbitControls
                            makeDefault
                            enableDamping
                            dampingFactor={0.05}
                            autoRotate
                            autoRotateSpeed={0.1}
                        />
                    </Suspense>
                </Canvas>
            </div>

            <div className="px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between">
                <div className="flex gap-4">
                    {parts.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${p.id.includes('RV') ? 'bg-red-500' : 'bg-teal-500'}`} />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{p.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-teal-600">
                    <Package className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">3D Reconstruction: Active</span>
                </div>
            </div>
        </div>
    );
};
