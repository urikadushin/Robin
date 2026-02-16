import React, { useEffect, useState } from 'react';
import { ThreatData } from '../App';
import { api } from '../services/api';
import { FullMissileData } from '../../backend/src/models/FullMissileModel';
import { OverlaidTrajectoryChart } from './OverlaidTrajectoryChart';
import { Loader2, GitCompare, Shield, Activity, Zap, Scale, LayoutGrid } from 'lucide-react';

interface ComparisonViewProps {
    threats: ThreatData[];
    onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ threats, onClose }) => {
    const [fullThreatsData, setFullThreatsData] = useState<FullMissileData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    threats.map(t => api.getFullThreat(parseInt(t.id)))
                );
                setFullThreatsData(results);
            } catch (err) {
                console.error("Failed to fetch full threat data for comparison:", err);
            } finally {
                setLoading(false);
            }
        };

        if (threats.length > 0) {
            fetchAllData();
        }
    }, [threats]);

    if (!threats || threats.length === 0) return null;

    const attributes = [
        { label: 'Classification', key: 'missile', icon: <Shield className="w-4 h-4" /> },
        { label: 'Operational Range', key: 'range', icon: <Activity className="w-4 h-4" /> },
        { label: 'Terminal Velocity', key: 'speed', icon: <Zap className="w-4 h-4" /> },
        { label: 'Launch Weight', key: 'weight', icon: <Scale className="w-4 h-4" /> },
        { label: 'Warhead Mass', key: 'warhead', icon: <LayoutGrid className="w-4 h-4" /> },
        { label: 'Status', key: 'status', icon: <Activity className="w-4 h-4" /> },
    ];

    const colors = ['#227d8d', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-[#144a54]/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#f8fafc] w-full max-w-[1600px] h-[90vh] rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>

                {/* Background Ambient Layers */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#227d8d]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0066FF]/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Header */}
                <div className="relative z-10 px-8 py-6 border-b border-[#E2E8F0] bg-white/50 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#227d8d] rounded-[14px] flex items-center justify-center shadow-[0_8px_16px_rgba(34,125,141,0.2)]">
                            <GitCompare className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#144a54] tracking-tight">Comparative Systems Analysis</h2>
                            <p className="text-[11px] font-bold text-[#6b788e] uppercase tracking-widest">Cross-platform performance benchmarking</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#6b788e] hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] transition-all flex items-center justify-center group shadow-sm"
                    >
                        <span className="text-xl font-light transform group-hover:rotate-90 transition-transform">✕</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col relative z-10">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-[#227d8d] animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-[#144a54] uppercase tracking-widest">Aggregating Intelligence Data</h3>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <div className="flex flex-col gap-10 max-w-[1500px] mx-auto">

                                {/* Top Comparison Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {threats.map((t, idx) => (
                                        <div key={t.id} className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-[10px] bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <span className="text-lg">🚀</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-[#6b788e] uppercase tracking-tighter">System ID: {t.id}</span>
                                                        <h3 className="text-lg font-bold text-[#144a54]" style={{ color: colors[idx % colors.length] }}>{t.name}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {attributes.slice(0, 3).map(attr => (
                                                        <div key={attr.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                                            <div className="flex items-center gap-2 text-[#6b788e]">
                                                                {attr.icon}
                                                                <span className="text-[10px] font-bold uppercase">{attr.label}</span>
                                                            </div>
                                                            <span className="text-[12px] font-bold text-[#144a54]">
                                                                {/* @ts-ignore */}
                                                                {t[attr.key] || '-'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Analytical Overlays Section */}
                                <div className="grid grid-cols-1 gap-10">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-[#227d8d] rounded-full" />
                                            <h3 className="text-[16px] font-black text-[#144a54] uppercase tracking-widest">Multi-Series Telemetry Analysis</h3>
                                        </div>
                                        <div className="h-[500px]">
                                            <OverlaidTrajectoryChart threatsData={fullThreatsData} />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Specification Matrix */}
                                <div className="flex flex-col gap-6 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-[#227d8d] rounded-full" />
                                        <h3 className="text-[16px] font-black text-[#144a54] uppercase tracking-widest">Technical Specification Matrix</h3>
                                    </div>

                                    <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50">
                                                        <th className="px-6 py-4 text-left text-[11px] font-black text-[#6b788e] uppercase tracking-widest border-b border-[#E2E8F0] min-w-[200px] sticky left-0 bg-slate-50/50 z-10">Metric</th>
                                                        {threats.map((t, idx) => (
                                                            <th key={t.id} className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest border-b border-[#E2E8F0]" style={{ color: colors[idx % colors.length] }}>
                                                                {t.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attributes.map(attr => (
                                                        <tr key={attr.key} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-6 py-4 border-b border-[#F1F5F9] sticky left-0 bg-white z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-[#227d8d]">{attr.icon}</div>
                                                                    <span className="text-[12px] font-bold text-[#6b788e] uppercase">{attr.label}</span>
                                                                </div>
                                                            </td>
                                                            {threats.map(t => (
                                                                <td key={t.id} className="px-6 py-4 text-center border-b border-[#F1F5F9] text-[13px] font-bold text-[#144a54]">
                                                                    {/* @ts-ignore */}
                                                                    {t[attr.key] || '-'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                    <tr className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-6 py-4 border-b border-[#F1F5F9] align-top sticky left-0 bg-white z-10">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-[#227d8d]"><Activity className="w-4 h-4" /></div>
                                                                <span className="text-[12px] font-bold text-[#6b788e] uppercase">Propulsion System</span>
                                                            </div>
                                                        </td>
                                                        {fullThreatsData.map(ft => (
                                                            <td key={ft.missile?.id} className="px-6 py-4 text-center border-b border-[#F1F5F9] text-[12px] text-[#144a54]">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-bold">{ft.engine?.type || 'N/A'}</span>
                                                                    <span className="text-[10px] text-[#6b788e] uppercase font-black tracking-tighter">
                                                                        {ft.engine?.thrust ? `${ft.engine.thrust} kN` : ''}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Status Bar */}
                <div className="h-8 bg-[#144a54] px-8 flex items-center justify-between text-[9px] font-bold text-white/50 uppercase tracking-widest relative z-50">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-[#227d8d]">
                            <GitCompare className="w-3 h-3" />
                            Active Comparison Sequence
                        </span>
                        <span>Population: {threats.length} Units</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>AeroDan_Analytics_V2</span>
                        <div className="w-1.5 h-1.5 bg-[#227d8d] rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};
