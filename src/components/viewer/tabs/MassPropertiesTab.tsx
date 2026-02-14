import React from 'react';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';
import { MassMomentAndXCG } from '../../../../../backend/src/models/EngineeringModels';

interface MassPropertiesTabProps {
    threat: FullMissileData;
}

export const MassPropertiesTab: React.FC<MassPropertiesTabProps> = ({ threat }) => {
    const massProps = threat.massProperties || [];

    if (massProps.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#747E8B] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[12px] bg-white">
                Mass properties not initialized: Balance and inertia data unavailable
            </div>
        );
    }

    const MassRow = ({ item }: { item: MassMomentAndXCG }) => (
        <div className="flex items-center justify-between p-4.5 px-6 border-b border-[#ECF2F6] hover:bg-[#EFF6FB] transition-colors group">
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold text-[#464C53] uppercase tracking-wider">{item.description || 'Unknown Component'}</span>
                <span className="text-[10px] text-[#747E8B] uppercase font-bold italic">{item.sign || '---'}</span>
            </div>
            <div className="flex items-end gap-12 text-right">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#747E8B] uppercase font-bold">Launch</span>
                    <span className="text-[15px] text-[#21133B] font-extrabold">{item.launch_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#747E8B] uppercase font-bold">EOB</span>
                    <span className="text-[15px] text-[#03879E] font-extrabold">{item.eob_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="w-14 text-[11px] font-extrabold text-[#747E8B] uppercase pr-2">{item.unit || '---'}</div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700 pb-10" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <h3 className="text-[12px] font-extrabold text-[#21133B] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                Mass, Moments & XCG
            </h3>

            <div className="flex flex-col border border-[#C7D8E6] bg-white rounded-[12px] overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-[#ECF2F6] border-b border-[#C7D8E6]">
                    <span className="text-[11px] font-extrabold text-[#464C53] uppercase tracking-widest">Component Detail</span>
                    <div className="flex gap-14 mr-14">
                        <span className="text-[11px] font-extrabold text-[#464C53] uppercase tracking-widest">Data Matrix</span>
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                    {massProps.map((prop: MassMomentAndXCG, idx: number) => (
                        <MassRow key={idx} item={prop} />
                    ))}
                </div>
            </div>

            <div className="p-5 border-l-4 border-[#03879E] bg-[#03879E]/5 rounded-r-[12px]">
                <p className="text-[11px] text-[#03879E] uppercase font-extrabold tracking-widest">
                    EOB = End of Burn State | Values calibrated based on latest flight telemetry
                </p>
            </div>
        </div>
    );
};
