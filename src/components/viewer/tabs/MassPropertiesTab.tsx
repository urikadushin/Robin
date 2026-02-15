import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { MassMomentAndXCG } from '../../../../backend/src/models/EngineeringModels';

interface MassPropertiesTabProps {
    threat: FullMissileData;
}

export const MassPropertiesTab: React.FC<MassPropertiesTabProps> = ({ threat }) => {
    const massProps = threat.massProperties || [];

    if (massProps.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#6b788e] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[8px] bg-white">
                Mass properties not initialized: Balance and inertia data unavailable
            </div>
        );
    }

    const MassRow = ({ item }: { item: MassMomentAndXCG }) => (
        <div className="flex items-center justify-between p-4.5 px-6 border-b border-[#ECF2F6] hover:bg-[#EFF6FB] transition-colors group">
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#144a54] uppercase tracking-wider">{item.description || 'Unknown Component'}</span>
                <span className="text-[10px] text-[#6b788e] uppercase font-bold italic">{item.sign || '---'}</span>
            </div>
            <div className="flex items-end gap-12 text-right">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6b788e] uppercase font-bold">Launch</span>
                    <span className="text-[15px] text-[#144a54] font-bold">{item.launch_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6b788e] uppercase font-bold">EOB</span>
                    <span className="text-[15px] text-[#227d8d] font-bold">{item.eob_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="w-14 text-[11px] font-bold text-[#6b788e] uppercase pr-2">{item.unit || '---'}</div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700 pb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
            <h3 className="text-[12px] font-bold text-[#144a54] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#227d8d] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                Mass, Moments & XCG
            </h3>

            <div className="flex flex-col border border-[#C7D8E6] bg-white rounded-[8px] overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-[#ECF2F6] border-b border-[#C7D8E6]">
                    <span className="text-[11px] font-bold text-[#144a54] uppercase tracking-widest">Component Detail</span>
                    <div className="flex gap-14 mr-14">
                        <span className="text-[11px] font-bold text-[#144a54] uppercase tracking-widest">Data Matrix</span>
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                    {massProps.map((prop: MassMomentAndXCG, idx: number) => (
                        <MassRow key={idx} item={prop} />
                    ))}
                </div>
            </div>

            <div className="p-5 border-l-4 border-[#227d8d] bg-[#227d8d]/5 rounded-r-[8px]">
                <p className="text-[11px] text-[#227d8d] uppercase font-bold tracking-widest">
                    EOB = End of Burn State | Values calibrated based on latest flight telemetry
                </p>
            </div>
        </div>
    );
};
