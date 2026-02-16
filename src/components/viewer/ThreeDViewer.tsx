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
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ missileName }) => {
    const nameLower = missileName.toLowerCase();

    const parts = useMemo(() => {
        const potentialParts = [
            { id: 'UN', suffix: 'UN', label: 'Unit Assembly' },
            { id: 'RV', suffix: 'RV', label: 'Re-entry Vehicle' },
            { id: 'BT', suffix: 'BT', label: 'Booster / Tail' },
            { id: 'S1', suffix: 'S1', label: 'Stage 1' },
            { id: 'S2', suffix: 'S2', label: 'Stage 2' },
            { id: 'S3', suffix: 'S3', label: 'Stage 3' },
        ];

        // Normalizing missile names for 3D asset matching
        const normalizedBase = nameLower.includes('shahed') ? 'shahed' :
            (nameLower === 'bulava' ? 'Bulava_' : missileName);

        // Heuristic: If it's a drone/UAV, it's likely a single 'UN' assembly or just Name.obj
        const isSingleFileModel = nameLower.includes('shahed') || nameLower.includes('aim') || nameLower.includes('hellfire');

        if (isSingleFileModel) {
            // Only return the Unit assembly with the base name (no suffix)
            return [{
                id: 'UN',
                suffix: '',
                label: 'Unit Assembly',
                url: `http://localhost:3000/api/data/3DModel/${normalizedBase}.obj`
            }];
        }

        return potentialParts.map(p => ({
            ...p,
            url: `http://localhost:3000/api/data/3DModel/${normalizedBase}${p.suffix}.obj`
        }));
    }, [missileName, nameLower]);

    return (
        <div className="w-full h-full min-h-[500px] bg-[#f8fafc] rounded-[12px] border border-slate-200 relative overflow-hidden flex flex-col group">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                    <Box className="w-3 h-3 text-teal-600" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Spatial Analysis Mode</span>
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
                        <PerspectiveCamera makeDefault fov={35} />
                        <Stage environment="city" intensity={0.5}>
                            <group rotation={[0, 0, 0]}>
                                {parts.map((p) => (
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
                        <Environment preset="city" />
                        <OrbitControls
                            makeDefault
                            enableDamping
                            dampingFactor={0.05}
                            autoRotate
                            autoRotateSpeed={0.5}
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
