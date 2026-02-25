import React, { Suspense, useMemo, useLayoutEffect, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';

interface HeatTabProps {
    threat: FullMissileData;
}

// Tactical Metadata Mapping
const THERMAL_METADATA: Record<string, { time: string; alt: string; vel: string; summary: string }> = {
    'TL_1': {
        time: '65s',
        alt: '32km',
        vel: '1.4 Mach',
        summary: 'This map represents the Max-Q to Mid-Ascent transition. It shows a missile that is "heat-soaked"—its skin and structural conduits are at peak temperature due to atmospheric friction and internal combustion, but the direct propulsion heat (plume) is not the dominant feature in this specific sensor view.'
    },
    'TL_2': {
        time: '480s',
        alt: '110km',
        vel: '3.8 Mach',
        summary: 'Post-boost passive IR phase. Characterized by residual base heating and thermal equalization across the main body. Atmospheric friction is negligible at this altitude, showing pure structural thermal emission.'
    },
    'TL_3': {
        time: '115s',
        alt: '85km',
        vel: '2.2 Mach',
        summary: 'Inter-stage separation phase. High thermal contrast at the separation interface. Significant heat soak from the 1st stage motor is still visible, with secondary stagnation peaks on aerodynamic leading edges.'
    },
    'TL_4': {
        time: '90s',
        alt: '55km',
        vel: '1.8 Mach',
        summary: 'Hypersonic transition zone. Intense mid-body heating due to boundary layer transition. The thermal signature is dominated by aerodynamic friction on the conduits and structural ribs.'
    }
};

const getMetadata = (path: string) => {
    if (path.includes('TL_1')) return THERMAL_METADATA['TL_1'];
    if (path.includes('TL_2')) return THERMAL_METADATA['TL_2'];
    if (path.includes('TL_3')) return THERMAL_METADATA['TL_3'];
    if (path.includes('TL_4')) return THERMAL_METADATA['TL_4'];
    return { time: '--', alt: '--', vel: '--', summary: 'Standard thermal distribution analysis showing heat dissipation patterns.' };
};

const translationMap: { [key: string]: string } = {
    'חתימה טרמית של הגוף האחוד': 'Thermal signature of the full assembly',
    'חתימה טרמית של הגוף החודר': 'Thermal signature of the re-entry vehicle',
    'חתימה טרמית של המנוע': 'Thermal signature of the engine stage',
};

const getObjUrl = (partName: string, missileName: string, assets: any[]): string => {
    const dbModel = assets?.find(img => img.image_type === '3dModel' && img.part_name === partName)
        ?? assets?.find(img => img.image_type === '3dModel');
    if (dbModel) return `http://localhost:3000/api/data/3DModel/${dbModel.image_path}`;
    const nameLower = missileName.toLowerCase();
    if (nameLower === 'bulava') return `http://localhost:3000/api/data/3DModel/Bulava_${partName}.obj`;
    const isSingle = nameLower.includes('shahed') || nameLower.includes('aim') || nameLower.includes('hellfire');
    if (isSingle) return `http://localhost:3000/api/data/3DModel/${nameLower}.obj`;
    return `http://localhost:3000/api/data/3DModel/${nameLower}${partName}.obj`;
};

const performAutoCrop = (img: HTMLImageElement): HTMLCanvasElement | null => {
    try {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = img.width;
        tmpCanvas.height = img.height;
        const tmpCtx = tmpCanvas.getContext('2d')!;
        tmpCtx.drawImage(img, 0, 0);
        const pixels = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
        const W = tmpCanvas.width, H = tmpCanvas.height;

        const isColorful = (px: number, py: number): boolean => {
            const idx = (py * W + px) * 4;
            const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
            return Math.max(r, g, b) - Math.min(r, g, b) > 20;
        };
        const checkCol = (px: number): boolean => {
            for (let py = 2; py < H - 2; py += 2) { if (isColorful(px, py)) return true; }
            return false;
        };
        const checkRow = (py: number): boolean => {
            for (let px = 2; px < W - 2; px += 2) { if (isColorful(px, py)) return true; }
            return false;
        };

        let dataLeft = 0;
        for (let px = 0; px < W; px++) { if (checkCol(px)) { dataLeft = px; break; } }
        let dataRight = W - 1;
        for (let px = W - 1; px >= 0; px--) { if (checkCol(px)) { dataRight = px; break; } }
        let dataTop = 0;
        for (let py = 0; py < H; py++) { if (checkRow(py)) { dataTop = py; break; } }
        let dataBottom = H - 1;
        for (let py = H - 1; py >= 0; py--) { if (checkRow(py)) { dataBottom = py; break; } }

        const dw = Math.max(1, dataRight - dataLeft + 1);
        const dh = Math.max(1, dataBottom - dataTop + 1);
        if (dw <= 1 || dh <= 1) return null;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = dw;
        cropCanvas.height = dh;
        cropCanvas.getContext('2d')!.drawImage(img, dataLeft, dataTop, dw, dh, 0, 0, dw, dh);
        return cropCanvas;
    } catch (e) {
        return null;
    }
};

const ThermalMesh = ({ objUrl, croppedTexture }: { objUrl: string; croppedTexture: THREE.Texture }) => {
    const obj = useLoader(OBJLoader, objUrl);
    const clonedObj = useMemo(() => obj.clone(), [obj]);
    const { camera } = useThree();

    useLayoutEffect(() => {
        const bbox = new THREE.Box3();
        clonedObj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const pos = child.geometry.attributes.position;
            const v = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); bbox.expandByPoint(v); }
        });
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const longAxis: 'x' | 'y' | 'z' =
            size.x >= size.y && size.x >= size.z ? 'x' : size.y >= size.z ? 'y' : 'z';
        const axisMin = bbox.min[longAxis];
        const axisMax = bbox.max[longAxis];
        const axisLen = axisMax - axisMin;
        const sliceSize = axisLen * 0.1;

        // Detect nose: the pointed end has the smallest cross-sectional radius.
        // Nose → U=0 (left of image = 0° Aspect). Tail → U=1 (right = 180° Aspect).
        let minEndPerp = 0, maxEndPerp = 0;
        clonedObj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const pos = child.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                const axisPos = longAxis === 'x' ? x : longAxis === 'y' ? y : z;
                const a = longAxis === 'x' ? y : x;
                const b = longAxis === 'x' ? z : longAxis === 'y' ? z : y;
                const perp = Math.sqrt(a * a + b * b);
                if (axisPos < axisMin + sliceSize) minEndPerp = Math.max(minEndPerp, perp);
                if (axisPos > axisMax - sliceSize) maxEndPerp = Math.max(maxEndPerp, perp);
            }
        });
        const noseAtMax = maxEndPerp < minEndPerp;

        clonedObj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const pos = child.geometry.attributes.position;
            const uvArray = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                const axisPos = longAxis === 'x' ? x : longAxis === 'y' ? y : z;
                const normalized = (axisPos - axisMin) / axisLen;
                const u = noseAtMax ? (1.0 - normalized) : normalized;
                const a = longAxis === 'x' ? y : x;
                const b = longAxis === 'x' ? z : longAxis === 'y' ? z : y;
                const vCoord = (Math.atan2(b, a) + Math.PI) / (2 * Math.PI);
                uvArray[i * 2] = u;
                uvArray[i * 2 + 1] = vCoord;
            }
            child.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
            child.material = new THREE.MeshBasicMaterial({ map: croppedTexture });
        });

        // Center model at origin so OrbitControls works naturally
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        clonedObj.position.set(-center.x, -center.y, -center.z);

        // Auto-fit camera: position based on model size, fix near/far for any unit scale
        // For a 12m missile in mm = 12000 units. Far plane must be >> 12000.
        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 1.2;
        const cam = camera as THREE.PerspectiveCamera;
        cam.near = 10; // 1cm in mm
        cam.far = maxDim * 100; // Plenty of room
        cam.position.set(dist * 0.4, dist * 0.3, dist);
        cam.lookAt(0, 0, 0);
        cam.updateProjectionMatrix();
    }, [clonedObj, croppedTexture, camera]);

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
                    Loading: {progress.toFixed(0)}%
                </span>
            </div>
        </Html>
    );
};

// --------------------------------------------------------------------------
// Altitude vs Time trajectory graph with clickable image markers
// --------------------------------------------------------------------------
const TrajectoryGraph: React.FC<{
    sortedItems: { img: any; originalIdx: number }[];
    selectedOriginalIdx: number;
    onSelect: (originalIdx: number) => void;
}> = ({ sortedItems, selectedOriginalIdx, onSelect }) => {
    const MAX_T = 550, MAX_A = 130;
    const SVG_W = 268, SVG_H = 310;
    const P = { top: 20, right: 16, bottom: 36, left: 40 };
    const gW = SVG_W - P.left - P.right;
    const gH = SVG_H - P.top - P.bottom;

    const toX = (t: number) => P.left + (t / MAX_T) * gW;
    const toY = (a: number) => P.top + gH - (a / MAX_A) * gH;

    // Each point carries its sorted position (1-based label) and original index
    const points = sortedItems.map(({ img, originalIdx }, sortedPos) => {
        const meta = getMetadata(img.image_path);
        const t = parseInt(meta.time) || 0;
        const a = parseInt(meta.alt) || 0;
        return { t, a, originalIdx, label: sortedPos + 1, meta };
    });

    const yTicks = [0, 40, 80, 120];
    const xTicks = [0, 200, 400];

    // Ballistic parabola arc for visual reference
    const arcPath = `M ${toX(0)},${toY(0)} Q ${toX(300)},${toY(128)} ${toX(580)},${toY(0)}`;

    return (
        <div className="flex flex-col h-full">
            <div className="pb-2 flex-shrink-0">
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Alt Profile</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Click to select</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center flex-1 overflow-hidden">
                <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
                    {/* Grid */}
                    {yTicks.map(v => (
                        <g key={`y${v}`}>
                            <line x1={P.left} y1={toY(v)} x2={P.left + gW} y2={toY(v)}
                                stroke="#e2e8f0" strokeWidth="0.6" strokeDasharray="3,3" />
                            <text x={P.left - 5} y={toY(v) + 3.5} textAnchor="end"
                                fontSize="7.5" fill="#94a3b8" fontFamily="monospace" fontWeight="700">{v}</text>
                        </g>
                    ))}
                    {xTicks.map(v => (
                        <g key={`x${v}`}>
                            <line x1={toX(v)} y1={P.top} x2={toX(v)} y2={P.top + gH}
                                stroke="#e2e8f0" strokeWidth="0.6" strokeDasharray="3,3" />
                            <text x={toX(v)} y={P.top + gH + 13} textAnchor="middle"
                                fontSize="7.5" fill="#94a3b8" fontFamily="monospace" fontWeight="700">{v}</text>
                        </g>
                    ))}

                    {/* Axes */}
                    <line x1={P.left} y1={P.top} x2={P.left} y2={P.top + gH} stroke="#cbd5e1" strokeWidth="1.2" />
                    <line x1={P.left} y1={P.top + gH} x2={P.left + gW} y2={P.top + gH} stroke="#cbd5e1" strokeWidth="1.2" />

                    {/* Ballistic arc reference */}
                    <path d={arcPath} fill="none" stroke="#f97316" strokeWidth="1.2"
                        strokeDasharray="5,4" opacity="0.18" />

                    {/* Segment lines connecting consecutive markers */}
                    {points.map((p, si) => {
                        const prev = si === 0 ? { t: 0, a: 0 } : points[si - 1];
                        return (
                            <line key={`seg${p.originalIdx}`}
                                x1={toX(prev.t)} y1={toY(prev.a)}
                                x2={toX(p.t)} y2={toY(p.a)}
                                stroke="#f97316" strokeWidth="1" opacity="0.3" />
                        );
                    })}

                    {/* Markers */}
                    {points.map(p => {
                        const sel = p.originalIdx === selectedOriginalIdx;
                        // Label offset: cluster on left side → push right; TL_2 far right → push left
                        const dx = p.t < 200 ? 10 : -28;
                        return (
                            <g key={p.originalIdx} onClick={() => onSelect(p.originalIdx)}
                                style={{ cursor: 'pointer' }}>
                                {sel && <circle cx={toX(p.t)} cy={toY(p.a)} r={13}
                                    fill="#f97316" opacity={0.12} />}
                                <circle cx={toX(p.t)} cy={toY(p.a)}
                                    r={sel ? 8 : 5.5}
                                    fill={sel ? '#f97316' : '#cbd5e1'}
                                    stroke={sel ? '#fff' : '#94a3b8'}
                                    strokeWidth={sel ? 2 : 1.5} />
                                <text x={toX(p.t)} y={toY(p.a) + 3.5}
                                    textAnchor="middle"
                                    fontSize={sel ? '7' : '6.5'}
                                    fill={sel ? '#fff' : '#64748b'}
                                    fontWeight="900" fontFamily="monospace">
                                    {p.label}
                                </text>
                                {/* Altitude label */}
                                <text x={toX(p.t) + dx} y={toY(p.a) - 7}
                                    fontSize="7" fill={sel ? '#f97316' : '#94a3b8'}
                                    fontWeight="800" fontFamily="monospace">
                                    {p.meta.alt}
                                </text>
                            </g>
                        );
                    })}

                    {/* Axis labels */}
                    <text x={P.left + gW / 2} y={SVG_H - 2} textAnchor="middle"
                        fontSize="7" fill="#94a3b8" fontWeight="800" fontFamily="monospace" letterSpacing="1">
                        TIME (s)
                    </text>
                    <text x={9} y={P.top + gH / 2} textAnchor="middle"
                        fontSize="7" fill="#94a3b8" fontWeight="800" fontFamily="monospace" letterSpacing="1"
                        transform={`rotate(-90, 9, ${P.top + gH / 2})`}>
                        ALT (km)
                    </text>
                </svg>
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------

const HeatTab: React.FC<HeatTabProps> = ({ threat }) => {
    const thermalImages = threat.images?.filter((img: any) => img.image_type === 'thermal') || [];
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [view, setView] = useState<'image' | '3d'>('image');
    const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Sort thermal images chronologically by flight time for display
    const sortedThermalImages = useMemo(() =>
        thermalImages
            .map((img: any, originalIdx: number) => ({ img, originalIdx }))
            .sort((a, b) => {
                const tA = parseInt(getMetadata(a.img.image_path).time) || 0;
                const tB = parseInt(getMetadata(b.img.image_path).time) || 0;
                return tA - tB;
            }),
        [thermalImages]
    );

    const selectedImage = thermalImages[selectedIdx];
    const thermalUrl = selectedImage
        ? `http://localhost:3000/api/data/Images/Thermal/${(threat.missile.name || 'unknown').toLowerCase()}/${selectedImage.image_path}`
        : '';
    const objUrl = selectedImage
        ? getObjUrl(selectedImage.part_name, threat.missile.name || '', threat.images || [])
        : '';

    const currentMetadata = useMemo(() => getMetadata(selectedImage?.image_path || ''), [selectedImage]);

    React.useEffect(() => {
        if (!thermalUrl) return;
        setCroppedCanvas(null);
        setShowAnalysis(false);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = thermalUrl;
        img.onload = () => {
            const canvas = performAutoCrop(img);
            if (canvas) setCroppedCanvas(canvas);
        };
    }, [thermalUrl]);

    // CanvasTexture is SYNCHRONOUS — no async race condition
    const croppedTexture = useMemo(() => {
        if (!croppedCanvas) return null;
        const texture = new THREE.CanvasTexture(croppedCanvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        return texture;
    }, [croppedCanvas]);

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

    return (
        <div className="flex gap-2 h-[750px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">

            {/* ── Left: Signature Inventory (sorted by time) ── */}
            <div className="w-[270px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                <div className="pb-2">
                    <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Signature Inventory</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Sorted by flight time</p>
                </div>

                <div className="space-y-1.5">
                    {sortedThermalImages.map(({ img, originalIdx }, sortedPos) => {
                        const isSelected = selectedIdx === originalIdx;
                        const meta = getMetadata(img.image_path);
                        return (
                            <button
                                key={originalIdx}
                                onClick={() => setSelectedIdx(originalIdx)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-300 relative group
                                    ${isSelected
                                        ? 'bg-white border-orange-500 shadow-lg ring-1 ring-orange-100'
                                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 font-black text-[9px] transition-colors
                                      ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        {sortedPos + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <h4 className={`text-[10px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {img.part_name === 'UN' ? 'Full Assembly' :
                                                    img.part_name === 'RV' ? 'Re-entry Vehicle' :
                                                        img.part_name === 'BT' ? 'Booster Stage' : img.part_name}
                                            </h4>
                                            {isSelected && (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setShowAnalysis(!showAnalysis); }}
                                                    className={`p-0.5 rounded transition-colors cursor-pointer flex-shrink-0
                                                        ${showAnalysis ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-orange-100 hover:text-orange-500'}`}
                                                    title="View Analysis"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-black text-slate-400 uppercase">{meta.time}</span>
                                            <span className="text-[8px] text-slate-300">•</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase">{meta.alt}</span>
                                            <span className="text-[8px] text-slate-300">•</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase">{meta.vel}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Status Nom.</span>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                        Fidelity: High (SWIR) • Sensor: Operational
                    </p>
                </div>
            </div>

            {/* ── Middle: Alt vs Time Graph ── */}
            <div className="w-[300px] flex-shrink-0 flex flex-col py-0.5">
                <TrajectoryGraph
                    sortedItems={sortedThermalImages}
                    selectedOriginalIdx={selectedIdx}
                    onSelect={setSelectedIdx}
                />
            </div>

            {/* ── Right: Viewer ── */}
            <div className="flex-1 flex flex-col gap-4 relative min-w-0">
                {/* Analysis overlay */}
                {showAnalysis && (
                    <div className="absolute inset-0 z-50 animate-in fade-in zoom-in-95 duration-300 flex items-center justify-center pointer-events-none p-12">
                        <div className="bg-white/95 backdrop-blur-md w-full max-w-2xl p-8 rounded-3xl border border-orange-100 shadow-2xl pointer-events-auto relative">
                            <button onClick={() => setShowAnalysis(false)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tactical Analysis</h4>
                                    <p className="text-[10px] text-orange-500 font-bold uppercase">Confidence: 94%</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-bold mb-6 italic">
                                "{currentMetadata.summary}"
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Time', val: currentMetadata.time },
                                    { label: 'Altitude', val: currentMetadata.alt },
                                    { label: 'Velocity', val: currentMetadata.vel },
                                ].map(({ label, val }) => (
                                    <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">{label}</span>
                                        <span className="text-xs font-black text-slate-900">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{threat.missile.name}</h3>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{selectedImage.part_name} Stage</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                            <button onClick={() => setView('image')}
                                className={`px-3.5 py-1.5 text-[9px] font-black rounded-lg transition-all duration-300 uppercase
                                    ${view === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                IR Scan
                            </button>
                            <button onClick={() => setView('3d')}
                                className={`px-3.5 py-1.5 text-[9px] font-black rounded-lg transition-all duration-300 uppercase
                                    ${view === '3d' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-orange-500'}`}>
                                3D Map
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative overflow-hidden bg-slate-50">
                        {view === 'image' ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    key={selectedImage.image_path}
                                    src={thermalUrl}
                                    alt="Thermal Scan"
                                    className="animate-in zoom-in-95 duration-500 w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-slate-50">
                                <Canvas dpr={[1, 2]}>
                                    <color attach="background" args={['#f8fafc']} />
                                    <ambientLight intensity={1.5} />
                                    <pointLight position={[10, 10, 10]} intensity={1} />
                                    <Suspense fallback={<ThermalLoader />}>
                                        {croppedTexture && (
                                            <ThermalMesh objUrl={objUrl} croppedTexture={croppedTexture} />
                                        )}
                                    </Suspense>
                                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.1} />
                                </Canvas>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatTab;
