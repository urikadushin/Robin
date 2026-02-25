import React, { Suspense, useMemo, useLayoutEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';

interface HeatTabProps {
    threat: FullMissileData;
}

const translationMap: { [key: string]: string } = {
    'חתימה טרמית של הגוף האחוד': 'Thermal signature of the full assembly',
    'חתימה טרמית של הגוף החודר': 'Thermal signature of the re-entry vehicle',
    'חתימה טרמית של המנוע': 'Thermal signature of the engine stage',
    'מבט 1': 'View 1',
    'מבט 2': 'View 2',
    'מבט ורטיקלי': 'Vertical View',
};

const translateDescription = (hebrew: string) => {
    if (!hebrew) return 'Detailed thermal distribution analysis showing heat dissipation patterns.';
    let english = hebrew;
    Object.keys(translationMap).forEach(key => {
        english = english.replace(key, translationMap[key]);
    });
    return english;
};

// Resolves which OBJ file to load for a given part
const getObjUrl = (partName: string, missileName: string, assets: any[]): string => {
    const dbModel = assets?.find(img => img.image_type === '3dModel' && img.part_name === partName)
        ?? assets?.find(img => img.image_type === '3dModel'); // fallback to any part
    if (dbModel) return `http://localhost:3000/api/data/3DModel/${dbModel.image_path}`;
    const nameLower = missileName.toLowerCase();
    if (nameLower === 'bulava') return `http://localhost:3000/api/data/3DModel/Bulava_${partName}.obj`;
    const isSingle = nameLower.includes('shahed') || nameLower.includes('aim') || nameLower.includes('hellfire');
    if (isSingle) return `http://localhost:3000/api/data/3DModel/${nameLower}.obj`;
    return `http://localhost:3000/api/data/3DModel/${nameLower}${partName}.obj`;
};

// 3D mesh with thermal image projected as texture
const ThermalMesh = ({ objUrl, thermalUrl }: { objUrl: string; thermalUrl: string }) => {
    const obj = useLoader(OBJLoader, objUrl);
    const texture = useLoader(THREE.TextureLoader, thermalUrl);
    const clonedObj = useMemo(() => obj.clone(), [obj]);

    useLayoutEffect(() => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        clonedObj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({
                    map: texture,
                    transparent: false,
                    shininess: 20,
                });
            }
        });
    }, [clonedObj, texture]);

    return <primitive object={clonedObj} />;
};

const ThermalLoader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                    Loading 3D: {progress.toFixed(0)}%
                </span>
            </div>
        </Html>
    );
};

const HeatTab: React.FC<HeatTabProps> = ({ threat }) => {
    const thermalImages = threat.images?.filter((img: any) => img.image_type === 'thermal') || [];
    const [selectedIdx, setSelectedIdx] = React.useState(0);
    const [view, setView] = React.useState<'image' | '3d'>('image');

    if (thermalImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 4.5 6 4.5 8 0 3-1.5 5-1.5 5" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No Heat Signatures Available</h3>
            </div>
        );
    }

    const selectedImage = thermalImages[selectedIdx];
    const thermalUrl = `/api/data/Images/Thermal/${(threat.missile.name || 'unknown').toLowerCase()}/${selectedImage.image_path}`;
    const objUrl = getObjUrl(selectedImage.part_name, threat.missile.name || '', threat.images || []);

    return (
        <div className="flex gap-8 h-[750px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Selection List */}
            <div className="w-[350px] flex flex-col gap-4 overflow-y-auto pr-4 custom-scrollbar">
                <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Signature Inventory</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Select a thermal capture for detailed analysis</p>
                </div>

                <div className="space-y-3">
                    {thermalImages.map((image: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIdx(index)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group
                                ${selectedIdx === index
                                    ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500/20'
                                    : 'bg-slate-50/50 border-slate-200 hover:border-orange-200 hover:bg-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                                  ${selectedIdx === index ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-orange-100'}`}>
                                    <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${selectedIdx === index ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {image.part_name === 'UN' ? 'Full Assembly' :
                                            image.part_name === 'RV' ? 'Re-entry Vehicle' :
                                                image.part_name === 'BT' ? 'Booster Stage' : image.part_name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {translateDescription(image.image_description).split('.')[0]}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-tighter">System Health</span>
                    </div>
                    <p className="text-[10px] text-orange-600/80 leading-relaxed">
                        All IR sensors operational. Signal-to-noise ratio within nominal range for {threat.missile.name}.
                    </p>
                </div>
            </div>

            {/* Right Viewer */}
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative shadow-sm">

                {/* View toggle header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-orange-600/90 text-white text-[10px] uppercase font-bold tracking-wider rounded-full">
                            High-Resolution Analysis
                        </span>
                        <span className="px-2.5 py-1 bg-slate-700/80 text-white text-[10px] font-bold rounded-full uppercase">
                            {selectedImage.part_name} Component
                        </span>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setView('image')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                                ${view === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Image
                        </button>
                        <button
                            onClick={() => setView('3d')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                                ${view === '3d' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-orange-500'}`}
                        >
                            3D Model
                        </button>
                    </div>
                </div>

                {/* Image view */}
                {view === 'image' && (
                    <div className="flex-1 overflow-auto bg-slate-50 custom-scrollbar">
                        <div className="min-h-full flex items-center justify-center p-8">
                            <img
                                key={selectedImage.image_path}
                                src={thermalUrl}
                                alt="Thermal Scan"
                                className="max-w-none animate-in zoom-in-95 duration-500 shadow-2xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 3D view with thermal texture */}
                {view === '3d' && (
                    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
                        <Canvas shadows dpr={[1, 2]}>
                            <Suspense fallback={<ThermalLoader />}>
                                <PerspectiveCamera makeDefault fov={35} position={[10, 10, 10]} />
                                <Stage environment="city" intensity={0.6} adjustCamera>
                                    <ThermalMesh objUrl={objUrl} thermalUrl={thermalUrl} />
                                </Stage>
                                <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
                            </Suspense>
                        </Canvas>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeatTab;
