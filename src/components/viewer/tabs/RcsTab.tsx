import React, { useState } from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { RcsPlotter } from '../RcsPlotter';
import { Radar, Shield, Target } from 'lucide-react';

interface RcsTabProps {
    threat: FullMissileData;
}

export const RcsTab: React.FC<RcsTabProps> = ({ threat }) => {
    const rcsImages = threat.images?.filter((img: any) => img.image_type === 'rcs') || [];
    const [selectedIdx, setSelectedIdx] = useState(0);

    const sortedPerformance = [...(threat.performance || [])].sort((a: any, b: any) =>
        (a.perfIndex || 0) - (b.perfIndex || 0)
    );

    if (rcsImages.length === 0 && sortedPerformance.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Radar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No RCS Data Available</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Awaiting sensor telemetry</p>
            </div>
        );
    }

    const selectedImage = rcsImages[selectedIdx];

    return (
        <div className="flex gap-8 h-[801px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Selection List (Sidebar) */}
            <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar shrink-0">
                <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">RCS Scan Inventory</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Select a scan for detailed signal analysis</p>
                </div>

                <div className="space-y-2">
                    {rcsImages.map((image: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIdx(index)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-300 group
                                ${selectedIdx === index
                                    ? 'bg-white border-[#227d8d] shadow-md ring-1 ring-[#227d8d]/20'
                                    : 'bg-slate-50/50 border-slate-200 hover:border-[#227d8d]/20 hover:bg-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                                  ${selectedIdx === index ? 'bg-[#227d8d] text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-[#227d8d]/10'}`}>
                                    <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-xs font-bold truncate ${selectedIdx === index ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {image.part_name === 'UN' ? 'Full Assembly' :
                                            image.part_name === 'RV' ? 'Re-entry Vehicle' :
                                                image.part_name === 'BT' ? 'Booster Stage' : image.part_name}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                        RCS Reflectivity Map
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Legend / Status Info */}
                <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-3 h-3 text-[#227d8d]" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Stealth Metrics</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Avg RCS</span>
                            <span className="text-[11px] text-[#144a54] font-bold">12.4 dBsm</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Peak Signal</span>
                            <span className="text-[11px] text-[#227d8d] font-bold">18.2 dBsm</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Main Content (Split Display) */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Top Section: RCS Visual Mapping */}
                <div className="flex-1 bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative shadow-sm min-h-[400px]">
                    <div className="flex-1 relative bg-white flex items-center justify-center p-8 overflow-hidden min-h-[300px]">
                        {selectedImage ? (
                            <img
                                key={selectedImage.image_path}
                                src={`/api/data/Images/Rcs/${(threat.missile.name || 'unknown').toUpperCase()}/${selectedImage.image_path}`}
                                alt="RCS Reflectivity Map"
                                className="max-w-full max-h-full w-auto h-auto object-contain animate-in zoom-in-95 duration-500"
                                style={{ minWidth: '300px', minHeight: '300px' }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center text-slate-300">
                                <Radar className="w-16 h-16 opacity-20 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest">No Visual Map Selected</span>
                            </div>
                        )}

                        <div className="absolute top-6 left-6 flex items-center gap-3">
                            <span className="px-3 py-1 bg-[#227d8d] text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-lg">
                                Static Polar Scan
                            </span>
                            {selectedImage && (
                                <span className="px-3 py-1 bg-black/5 text-[#144a54] text-[10px] font-bold rounded-full border border-black/5 uppercase">
                                    {selectedImage.part_name} Profile
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">
                                {selectedImage?.part_name === 'UN' ? 'Full Assembly Reflectivity' :
                                    selectedImage?.part_name === 'RV' ? 'Re-entry Vehicle Reflectivity' :
                                        selectedImage?.part_name === 'BT' ? 'Booster Stage Reflectivity' : 'Sub-component Mapping'}
                            </h4>
                            <p className="text-[11px] text-slate-500">Geometry and material reflectivity analysis at X-band frequency</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-px bg-slate-200"></div>
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 font-bold uppercase">Aspect Angle</div>
                                <div className="text-[14px] text-[#144a54] font-bold">0.0°</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Dynamic RCS Plotting */}
                <div className="flex-1 flex flex-col gap-4 min-h-[350px]">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-[#227d8d]/10 rounded-lg">
                            <Target className="w-5 h-5 text-[#227d8d]" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-bold text-[#144a54]">Dynamic Signal Analytics</h4>
                            <p className="text-[10px] text-[#6b788e] font-bold uppercase tracking-tight">Time-domain radar cross section</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-white rounded-xl overflow-hidden border border-slate-200">
                        {sortedPerformance.length > 0 ? (
                            <RcsPlotter performanceData={sortedPerformance} />
                        ) : (
                            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-[8px] bg-slate-50 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                Telemetry stream unavailable
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RcsTab;
