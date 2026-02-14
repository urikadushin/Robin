import React from 'react';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';

interface AeroTabProps {
    threat: FullMissileData;
}

export const AeroTab: React.FC<AeroTabProps> = ({ threat }) => {
    const aero = threat.aero;

    if (!aero) {
        return (
            <div className="flex items-center justify-center h-full text-[#747E8B] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[12px] bg-white">
                Aero Profile Missing: Computational fluid dynamics data required
            </div>
        );
    }

    const CoeffItem = ({ label, value, description }: { label: string, value: number | undefined, description: string }) => (
        <div className="border border-[#C7D8E6] bg-white p-5 rounded-[12px] flex flex-col gap-3 group hover:border-[#03879E]/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#03879E] uppercase tracking-wider">{label}</span>
                <span className="text-[18px] font-extrabold text-[#21133B]">{value?.toFixed(4) || '0.0000'}</span>
            </div>
            <p className="text-[10px] text-[#747E8B] leading-tight uppercase font-bold">{description}</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <h3 className="text-[12px] font-extrabold text-[#03879E] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                Aerodynamic Coefficients
            </h3>

            <div className="grid grid-cols-3 gap-6">
                <CoeffItem label="Cx0" value={aero.cx0} description="Zero-lift drag coefficient at reference Mach" />
                <CoeffItem label="Cna" value={aero.cna} description="Normal force coefficient slope per degree alpha" />
                <CoeffItem label="Xcp" value={aero.xcp_from_tip} description="Center of pressure location from missile tip (meters)" />
                <CoeffItem label="CmQ" value={aero.cmq} description="Pitching moment derivative due to pitch rate" />
                <CoeffItem label="Cma" value={aero.cma} description="Static stability margin / Pitching moment slope" />
                <CoeffItem label="Cnd" value={aero.cnd} description="Normal force due to control surface deflection" />
            </div>

            <div className="border border-[#C7D8E6] bg-white p-6 rounded-[12px] shadow-sm">
                <h4 className="text-[11px] font-extrabold text-[#747E8B] mb-6 uppercase tracking-widest border-b-2 border-[#ECF2F6] pb-2 inline-block">Reference Vectors</h4>
                <div className="grid grid-cols-2 gap-10">
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] text-[#464C53] uppercase font-bold tracking-widest">Mach Vector</span>
                        <div className="flex flex-wrap gap-2">
                            {aero.mach_vec?.split(',').map((val: string, idx: number) => (
                                <div key={idx} className="bg-[#ECF2F6] p-2.5 px-4 rounded-[4px] text-[11px] font-extrabold text-[#21133B] text-center border border-[#C7D8E6] min-w-[50px]">{val}</div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] text-[#464C53] uppercase font-bold tracking-widest">Alpha Vector (DEG)</span>
                        <div className="flex flex-wrap gap-2">
                            {aero.alpha_vec?.split(',').map((val: string, idx: number) => (
                                <div key={idx} className="bg-[#ECF2F6] p-2.5 px-4 rounded-[4px] text-[11px] font-extrabold text-[#21133B] text-center border border-[#C7D8E6] min-w-[50px]">{val}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
