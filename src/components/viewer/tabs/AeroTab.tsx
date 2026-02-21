import React, { useState, useMemo } from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { Grid3X3, Layers, Database, BarChart2, Table as TableIcon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

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
        if (!val) return [];
        const trimmed = val.trim();
        if (trimmed === 'NULL' || trimmed === '') return [];

        try {
            if (trimmed.startsWith('[')) {
                return JSON.parse(trimmed);
            }
        } catch (e) {
            console.warn('Failed to parse JSON aero data, falling back to regex split');
        }

        // Split by whitespace or comma, handle multiple spaces
        return trimmed.split(/[\s,]+/).map(v => {
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        });
    };

    const machVec = parseData(aero.mach_vec);
    const alphaVec = parseData(aero.alpha_vec);
    const is6DOF = aero.dim === 2;

    const coefficients = [
        { key: 'aero_cx0_off', label: 'Cx0 (Off)', desc: 'Zero-lift drag (Engine Off)' },
        { key: 'aero_cx0_on', label: 'Cx0 (On)', desc: 'Zero-lift drag (Engine On)' },
        { key: 'aero_cna', label: 'Cna', desc: 'Normal force slope' },
        { key: 'aero_xcp', label: 'Xcp', desc: 'Center of pressure' },
        { key: 'aero_cmq', label: 'CmQ', desc: 'Pitching moment' },
        { key: 'aero_cnd', label: 'Cnd', desc: 'Control surface force' },
    ];

    const currentMatrixRaw = parseData((aero as any)[selectedCoeff]);

    const currentMatrix = useMemo(() => {
        if (!is6DOF || !Array.isArray(currentMatrixRaw) || currentMatrixRaw.length === 0) {
            return currentMatrixRaw;
        }

        // If it's already a 2D array, we're good
        if (Array.isArray(currentMatrixRaw[0])) {
            return currentMatrixRaw;
        }

        // Reshape flat array: Rows = Alpha, Cols = Mach (matching WPF logic)
        const rows = alphaVec.length || 1;
        const cols = machVec.length || 1;
        const matrix: number[][] = [];
        let index = 0;
        for (let i = 0; i < rows; i++) {
            const row: number[] = [];
            for (let j = 0; j < cols; j++) {
                row.push(currentMatrixRaw[index++] || 0);
            }
            matrix.push(row);
        }
        return matrix;
    }, [currentMatrixRaw, is6DOF, alphaVec, machVec]);

    const chartData3DOF = useMemo(() => {
        if (is6DOF) return [];
        return machVec.map((m: number, i: number) => {
            const point: any = { mach: m };
            coefficients.forEach(c => {
                const data = parseData((aero as any)[c.key]);
                point[c.label] = Array.isArray(data) ? data[i] : 0;
            });
            return point;
        });
    }, [aero, machVec, is6DOF]);

    const chartData6DOF = useMemo(() => {
        if (!is6DOF) return [];
        // Map Mach vectors to objects containing values for each Alpha slice
        return machVec.map((m: number, machIdx: number) => {
            const point: any = { mach: m };
            alphaVec.forEach((a: number, alphaIdx: number) => {
                point[`alpha_${a}`] = currentMatrix[alphaIdx] ? currentMatrix[alphaIdx][machIdx] : 0;
            });
            return point;
        });
    }, [machVec, alphaVec, currentMatrix, is6DOF]);

    const MatrixCell = ({ val }: { val: number }) => {
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

    const activeCoeffLabel = coefficients.find(c => c.key === selectedCoeff)?.label || '';

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Analysis (Graph) */}
                <div className="bg-white rounded-[12px] border border-[#C7D8E6] overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#f8fafc] p-4 border-b border-[#C7D8E6] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-[#227d8d]" />
                            <span className="text-[11px] font-bold text-[#144a54] uppercase tracking-tight">Trend Analysis: {activeCoeffLabel}</span>
                        </div>
                    </div>
                    <div className="h-[350px] p-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={is6DOF ? chartData6DOF : chartData3DOF} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="mach"
                                    type="number"
                                    domain={['auto', 'auto']}
                                    label={{ value: 'MACH', position: 'insideBottom', offset: -5, fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                                    tick={{ fontSize: 9, fontWeight: 600, fill: '#64748b' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 9, fontWeight: 600, fill: '#64748b' }}
                                    label={{ value: activeCoeffLabel, angle: -90, position: 'insideLeft', fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#144a54' }}
                                />
                                {is6DOF ? (
                                    <>
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '9px', fontWeight: 700 }} />
                                        {alphaVec.map((a: number, i: number) => (
                                            <Line
                                                key={a}
                                                type="monotone"
                                                dataKey={`alpha_${a}`}
                                                name={`α = ${a}°`}
                                                stroke={i % 2 === 0 ? '#227d8d' : '#ef4444'}
                                                strokeWidth={2}
                                                dot={{ r: 2 }}
                                                activeDot={{ r: 4 }}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <Line
                                        type="monotone"
                                        dataKey={activeCoeffLabel}
                                        stroke="#227d8d"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#227d8d', strokeWidth: 0 }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Matrix / Table */}
                <div className="bg-white rounded-[12px] border border-[#C7D8E6] overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#f8fafc] p-4 border-b border-[#C7D8E6] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {is6DOF ? <Grid3X3 className="w-4 h-4 text-[#227d8d]" /> : <TableIcon className="w-4 h-4 text-[#227d8d]" />}
                            <span className="text-[11px] font-bold text-[#144a54] uppercase tracking-tight">
                                {is6DOF ? `Mach x Alpha Matrix [${activeCoeffLabel}]` : 'Detailed Aerodynamic Data'}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-auto max-h-[350px]">
                        {is6DOF ? (
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-white shadow-sm border-b border-[#C7D8E6]">
                                    <tr>
                                        <th className="p-3 text-left bg-[#f1f5f9] border-r border-[#C7D8E6] w-20">
                                            <div className="text-[8px] text-[#64748b] font-bold leading-tight">MACH \ ALPHA</div>
                                        </th>
                                        {alphaVec.map((a: number, i: number) => (
                                            <th key={i} className="p-2 text-center text-[9px] font-extrabold text-[#144a54] bg-[#f8fafc] border-r border-[#C7D8E6] last:border-r-0">
                                                {a}°
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {machVec.map((m: number, i: number) => (
                                        <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="p-2 bg-[#f1f5f9] border-r border-[#C7D8E6] font-bold text-[9px] text-[#144a54]">
                                                M{m.toFixed(1)}
                                            </td>
                                            {currentMatrix[machVec.length > alphaVec.length ? i : i]?.length > 0 && Array.isArray(currentMatrix[i]) ? (
                                                currentMatrix[i].map((val: number, j: number) => (
                                                    <td key={j} className="p-0 border-r border-[#C7D8E6] last:border-r-0">
                                                        <MatrixCell val={val} />
                                                    </td>
                                                ))
                                            ) : (
                                                // Handle case where matrix might be arranged differently (Alpha x Mach vs Mach x Alpha)
                                                alphaVec.map((_: any, j: number) => (
                                                    <td key={j} className="p-0 border-r border-[#C7D8E6] last:border-r-0">
                                                        <MatrixCell val={currentMatrix[j] ? currentMatrix[j][i] : 0} />
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-white shadow-sm border-b border-[#C7D8E6]">
                                    <tr className="bg-[#f8fafc]">
                                        <th className="p-3 text-left text-[9px] font-extrabold text-[#64748b] uppercase border-r border-[#C7D8E6]">Mach</th>
                                        {coefficients.map(c => (
                                            <th key={c.key} className={`p-3 text-center text-[9px] font-extrabold uppercase border-r border-[#C7D8E6] last:border-r-0 ${selectedCoeff === c.key ? 'text-[#227d8d] bg-[#227d8d]/5' : 'text-[#64748b]'}`}>
                                                {c.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {machVec.map((m: number, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-[#f1f5f9] last:border-0">
                                            <td className="p-3 font-bold text-[10px] text-[#144a54] bg-[#f8fafc] border-r border-[#C7D8E6]">
                                                {m.toFixed(1)}
                                            </td>
                                            {coefficients.map(c => {
                                                const data = parseData((aero as any)[c.key]);
                                                const val = Array.isArray(data) ? data[i] : 0;
                                                return (
                                                    <td key={c.key} className={`p-3 text-center font-mono text-[10px] border-r border-[#C7D8E6] last:border-r-0 ${selectedCoeff === c.key ? 'bg-[#227d8d]/5 font-bold text-[#227d8d]' : 'text-[#144a54]'}`}>
                                                        {val?.toFixed(4) || '0.0000'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Matrix Logic Info */}
            <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#C7D8E6] flex gap-4">
                <div className="bg-[#227d8d]/10 p-2 rounded-full self-start">
                    <Info className="w-4 h-4 text-[#227d8d]" />
                </div>
                <div>
                    <h5 className="text-[10px] font-bold text-[#144a54] uppercase mb-1">Aerodynamic Analysis Details</h5>
                    <p className="text-[10px] text-[#6b788e] leading-relaxed">
                        Data represents aerodynamic coefficients derived from computational fluid dynamics.
                        {is6DOF
                            ? " 6DOF analysis includes pitching/yawing moment coupling across Mach and Alpha vectors."
                            : " 3DOF analysis provides velocity-dependent drag and lift characteristics at zero angle of attack."
                        } All values are dimensionless unless specified.
                    </p>
                </div>
            </div>
        </div>
    );
};
