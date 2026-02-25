import React from 'react';
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

const HeatTab: React.FC<HeatTabProps> = ({ threat }) => {
    const thermalImages = threat.images?.filter((img: any) => img.image_type === 'thermal') || [];
    const [selectedIdx, setSelectedIdx] = React.useState(0);

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

    return (
        <div className="flex gap-8 h-[750px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Selection List (30%) */}
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

            {/* Right Detailed Viewer (70%) */}
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative shadow-sm">
                <div className="flex-1 overflow-auto bg-slate-50 custom-scrollbar relative">
                    <div className="min-h-full flex items-center justify-center p-8 bg-slate-50">
                        <img
                            key={selectedImage.image_path}
                            src={`/api/data/Images/Thermal/${(threat.missile.name || 'unknown').toLowerCase()}/${selectedImage.image_path}`}
                            alt="Thermal Scan"
                            className="max-w-none animate-in zoom-in-95 duration-500 shadow-2xl"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>

                    <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                        <span className="px-3 py-1 bg-orange-600/90 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-xl border border-white/20">
                            High-Resolution Analysis
                        </span>
                        <span className="px-3 py-1 bg-slate-700/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-slate-600/30 uppercase">
                            {selectedImage.part_name} Component
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatTab;
