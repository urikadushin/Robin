import React, { useState } from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { Grid3X3, Layers, Database } from 'lucide-react';

interface AeroTabProps {
    threat: FullMissileData;
}

export const AeroTab: React.FC<AeroTabProps> = ({ threat }) => {
    const aeroData = threat.aerodynamics || [];
    const [selectedAeroIdx, setSelectedAeroIdx] = useState(0);
    const [selectedCoeff, setSelectedCoeff] = useState<string>('aero_cx0_off');

    const aero = aeroData[selectedAeroIdx];

    if (!aero) {
        return (
            <div className="flex items-center justify-center h-full text-[#6b788e] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[8px] bg-white">
                Aero Profile Missing: Computational fluid dynamics data required
            </div>
        );
    }

    const parseData = (val: string | undefined): any => {
        try {
            return val ? JSON.parse(val) : [];
        } catch {
            return val?.split(',').map(Number) || [];
        }
    };

    const machVec = aero.mach_vec?.split(',').map(Number) || [];
    const alphaVec = aero.alpha_vec?.split(',').map(Number) || [];
    const is6DOF = aero.dim === 2;

    const coefficients = [
        { key: 'aero_cx0_off', label: 'Cx0 (Off)', desc: 'Zero-lift drag (Engine Off)' },
        { key: 'aero_cx0_on', label: 'Cx0 (On)', desc: 'Zero-lift drag (Engine On)' },
        { key: 'aero_cna', label: 'Cna', desc: 'Normal force slope' },
        { key: 'aero_xcp', label: 'Xcp', desc: 'Center of pressure' },
        { key: 'aero_cmq', label: 'CmQ', desc: 'Pitching moment' },
        { key: 'aero_cnd', label: 'Cnd', desc: 'Control surface force' },
    ];

    const currentMatrix = parseData((aero as any)[selectedCoeff]);

    const MatrixCell = ({ val }: { val: number }) => {
        // Color scale logic (mock heatmap)
        const opacity = Math.min(Math.abs(val) / 5, 1);
        const bg = val >= 0 ? `rgba(34, 125, 141, ${0.1 + opacity * 0.9})` : `rgba(239, 68, 68, ${0.1 + opacity * 0.9})`;

        return (
            <div
                className="flex-1 p-2 text-center text-[10px] font-mono border-r border-b border-teal-500/10 last:border-r-0"
                style={{ backgroundColor: bg, color: opacity > 0.6 ? '#fff' : '#144a54' }}
            >
                {val.toFixed(3)}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-[#144a54] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#227d8d] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                    Aerodynamic Analysis {is6DOF ? '(6DOF Matrix)' : '(3DOF Vector)'}
                </h3>

                {aeroData.length > 1 && (
                    <select
                        value={selectedAeroIdx}
                        onChange={(e) => setSelectedAeroIdx(parseInt(e.target.value))}
                        title="Select Aero Profile"
                        className="bg-white border border-[#C7D8E6] text-[10px] font-bold uppercase rounded px-3 py-1 text-[#144a54] focus:outline-none"
                    >
                        {aeroData.map((a, i) => (
                            <option key={i} value={i}>{a.part_name} - {a.dim === 2 ? '6DOF' : '3DOF'}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Coefficient Selector Buttons */}
            <div className="flex flex-wrap gap-2">
                {coefficients.map(c => (
                    <button
                        key={c.key}
                        onClick={() => setSelectedCoeff(c.key)}
                        className={`px-4 py-2 rounded-[6px] border transition-all text-left flex-1 min-w-[150px] ${selectedCoeff === c.key
                                ? 'bg-[#227d8d] border-[#227d8d] text-white shadow-md'
                                : 'bg-white border-[#C7D8E6] text-[#6b788e] hover:border-[#227d8d]/40'
                            }`}
                    >
                        <div className="text-[10px] font-bold uppercase mb-1 opacity-80">{c.label}</div>
                        <div className="text-[9px] truncate">{c.desc}</div>
                    </button>
                ))}
            </div>

            {is6DOF ? (
                <div className="bg-white rounded-[8px] border border-[#C7D8E6] overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#f8fafc] p-3 border-b border-[#C7D8E6] flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#6b788e] uppercase">Interactive Heatmap [MACH x ALPHA]</span>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#227d8d]"></div>
                                <span className="text-[9px] font-bold text-[#6b788e]">POSITIVE</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                                <span className="text-[9px] font-bold text-[#6b788e]">NEGATIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-auto max-h-[500px]">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                <tr>
                                    <th className="p-3 text-left bg-[#f8fafc] border-r border-[#C7D8E6] w-20">
                                        <div className="text-[9px] text-[#6b788e] leading-tight">MACH \ ALPHA</div>
                                    </th>
                                    {alphaVec.map((a, i) => (
                                        <th key={i} className="p-2 text-center text-[10px] font-bold text-[#144a54] bg-[#f8fafc] border-r border-[#C7D8E6] last:border-r-0">
                                            {a.toFixed(1)}°
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {machVec.map((m, i) => (
                                    <tr key={i}>
                                        <td className="p-3 bg-[#f8fafc] border-r border-[#C7D8E6] font-bold text-[10px] text-[#144a54]">
                                            M{m.toFixed(1)}
                                        </td>
                                        {currentMatrix[i]?.map((val: number, j: number) => (
                                            <td key={j} className="p-0 border-r border-[#C7D8E6] last:border-r-0">
                                                <MatrixCell val={val} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-[8px] border border-[#C7D8E6] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[11px] font-bold text-[#6b788e] uppercase tracking-widest border-b-2 border-[#ECF2F6] pb-2">Single-Dimension Analysis [MACH Dependent]</h4>
                            <span className="text-[14px] font-bold text-[#227d8d]">{aero.part_name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            {machVec.map((m, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-[#ECF2F6] last:border-0 hover:bg-[#f8fafc] px-2 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-[#144a54]">MACH {m.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[14px] font-mono font-bold text-[#227d8d]">
                                        {Array.isArray(currentMatrix) ? (currentMatrix[i]?.toFixed(4) || '0.0000') : '0.0000'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
