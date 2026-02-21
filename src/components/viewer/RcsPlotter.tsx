import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Performance } from '../../../backend/src/models/EngineeringModels';
import { Loader2, Radar, Activity } from 'lucide-react';

interface RcsPlotterProps {
    performanceData: Performance[];
}

interface TrajPoint {
    [key: string]: number;
}

export const RcsPlotter: React.FC<RcsPlotterProps> = ({ performanceData }) => {
    const [selectedPerfId, setSelectedPerfId] = useState<number | null>(
        performanceData.length > 0 ? (performanceData[0].perfIndex ?? null) : null
    );
    const [data, setData] = useState<TrajPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPerf = useMemo(() =>
        performanceData.find(p => p.perfIndex === selectedPerfId),
        [performanceData, selectedPerfId]
    );

    const radarLabels = useMemo(() => {
        const selectedRun = performanceData.find(p => p.perfIndex === selectedPerfId);
        if ((selectedRun as any)?.rcs && (selectedRun as any).rcs.length > 0) {
            // Take the first RCS entry's radars string
            const firstRcs = (selectedRun as any).rcs[0];
            const radarsStr = firstRcs.radars || '';
            const names = radarsStr.split(/\s+/).filter((n: string) => n.length > 0);
            return {
                rcs1: names[0] || 'Radar 1',
                rcs2: names[1] || 'Radar 2',
                rcs3: names[2] || 'Radar 3',
                rcs4: names[3] || 'Radar 4'
            };
        }
        return {
            rcs1: 'Freq A',
            rcs2: 'Freq B',
            rcs3: 'Freq C',
            rcs4: 'Freq D'
        };
    }, [performanceData, selectedPerfId]);

    useEffect(() => {
        const fetchTraj = async () => {
            setLoading(true);
            setError(null);
            const selectedRun = performanceData.find(p => p.perfIndex === selectedPerfId);
            const path = selectedRun?.trajectoryRvPath || selectedRun?.trajectoryBtPath;

            if (!path) {
                setError('No trajectory file path found for selected run.');
                setData([]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
                if (!response.ok) throw new Error('Failed to fetch trajectory file');
                const text = await response.text();
                parseTrajFile(text);
            } catch (err: any) {
                setError(err.message);
                setData([]);
                console.error('Error fetching RCS trajectory:', err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedPerfId !== null) {
            fetchTraj();
        } else {
            setData([]);
            setError(null);
            setLoading(false);
        }
    }, [performanceData, selectedPerfId]);

    const parseTrajFile = (text: string) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        let headers: string[] = [];
        let startIndex = 0;

        if (lines[0].startsWith('#')) {
            headers = lines[0].substring(1).split(',').map(h => h.trim());
            startIndex = 1;
        } else {
            headers = ['time', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'alt', 'rcs1', 'rcs2', 'rcs3', 'rcs4'];
        }

        const parsedData: TrajPoint[] = [];
        for (let i = startIndex; i < lines.length; i++) {
            const values = lines[i].split(/\s+/).map(v => parseFloat(v));
            if (values.length >= headers.length) {
                const point: TrajPoint = {};
                headers.forEach((h, idx) => {
                    point[h] = values[idx];
                });
                parsedData.push(point);
            }
        }

        // Debug: Log if we have non-zero RCS values
        const hasRcsData = parsedData.some(p => (p.rcs1 || 0) !== 0 || (p.rcs2 || 0) !== 0 || (p.rcs3 || 0) !== 0 || (p.rcs4 || 0) !== 0);
        console.log(`Parsed ${parsedData.length} points for run ${selectedPerfId}. Has non-zero RCS: ${hasRcsData}`);

        const samplingRate = Math.max(1, Math.floor(parsedData.length / 500));
        setData(parsedData.filter((_, idx) => idx % samplingRate === 0));
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-[#227d8d]/10 p-2 rounded-lg">
                        <Radar className="w-5 h-5 text-[#227d8d]" />
                    </div>
                    <div>
                        <h3 className="text-[#144a54] font-bold text-[14px]">Dynamic RCS Signature</h3>
                        <p className="text-[#6b788e] text-[10px] font-bold uppercase tracking-tight">Multi-frequency response analysis</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">Select Engagement Run</label>
                    <select
                        value={selectedPerfId ?? ''}
                        onChange={(e) => setSelectedPerfId(parseInt(e.target.value))}
                        title="Select Performance Run"
                        className="bg-slate-50 border border-[#C7D8E6] rounded px-2 py-1 text-[10px] font-bold text-[#144a54] outline-none transition-colors cursor-pointer"
                    >
                        {performanceData.map(p => (
                            <option key={p.perfIndex} value={p.perfIndex}>
                                Run #{p.perfIndex}: {p.trajType} ({p.rng}km)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 p-6 min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 text-[#227d8d] animate-spin mb-2" />
                        <span className="text-[12px] font-bold text-[#227d8d] uppercase">Loading Signal Data...</span>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-red-500">
                        <p className="text-[14px] font-bold text-[#144a54]">{error}</p>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="number"
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                            <Line data={data} type="monotone" dataKey="rcs1" stroke="#227d8d" strokeWidth={2} dot={false} name="Freq A" isAnimationActive={false} connectNulls />
                            <Line data={data} type="monotone" dataKey="rcs2" stroke="#ef4444" strokeWidth={2} dot={false} name="Freq B" isAnimationActive={false} connectNulls />
                            <Line data={data} type="monotone" dataKey="rcs3" stroke="#f59e0b" strokeWidth={2} dot={false} name="Freq C" isAnimationActive={false} connectNulls />
                            <Line data={data} type="monotone" dataKey="rcs4" stroke="#6366f1" strokeWidth={2} dot={false} name="Freq D" isAnimationActive={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
};
