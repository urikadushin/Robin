import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Performance } from '../../../backend/src/models/EngineeringModels';
import { Loader2, TrendingUp, FileText } from 'lucide-react';

interface TrajectoryPlotterProps {
    performanceData: Performance[];
}

interface TrajPoint {
    [key: string]: number;
}

export const TrajectoryPlotter: React.FC<TrajectoryPlotterProps> = ({ performanceData }) => {
    const [selectedPerfId, setSelectedPerfId] = useState<number | null>(
        performanceData.length > 0 ? (performanceData[0].perfIndex ?? null) : null
    );
    const [data, setData] = useState<TrajPoint[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [xAxis, setXAxis] = useState<string>('');
    const [yAxis, setYAxis] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPerf = useMemo(() =>
        performanceData.find(p => p.perfIndex === selectedPerfId),
        [performanceData, selectedPerfId]
    );

    useEffect(() => {
        if (!selectedPerf) return;

        const loadTrajectory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try RV path first, then BT path
                const path = selectedPerf.trajectoryRvPath || selectedPerf.trajectoryBtPath;
                if (!path) {
                    throw new Error('No trajectory file path found for this run');
                }

                // Path is typically something like "BULAVA\bulava_bt_2000.txt"
                // The server serves this via /api/data/Trajectories
                const response = await fetch(`/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
                if (!response.ok) throw new Error('Failed to fetch trajectory file');

                const text = await response.text();
                parseTrajFile(text);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadTrajectory();
    }, [selectedPerf]);

    const parseTrajFile = (text: string) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        let headersMatch: string[] = [];
        let startIndex = 0;

        // Check first line for header
        if (lines[0].startsWith('#')) {
            headersMatch = lines[0].substring(1).split(',').map(h => h.trim());
            startIndex = 1;
        } else {
            // Fallback headers if not matching
            headersMatch = ['time', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'alt'];
        }

        const parsedData: TrajPoint[] = [];
        for (let i = startIndex; i < lines.length; i++) {
            const values = lines[i].split(/\s+/).map(v => parseFloat(v));
            if (values.length >= headersMatch.length) {
                const point: TrajPoint = {};
                headersMatch.forEach((h, idx) => {
                    point[h] = values[idx];
                });
                parsedData.push(point);
            }
        }

        // Sampling if data is too large for Recharts performance (e.g. max 500 points)
        const samplingRate = Math.max(1, Math.floor(parsedData.length / 500));
        const sampledData = parsedData.filter((_, idx) => idx % samplingRate === 0);

        setHeaders(headersMatch);
        setData(sampledData);

        // Auto-select common axes if available
        if (headersMatch.includes('rng') && headersMatch.includes('alt')) {
            setXAxis('rng');
            setYAxis('alt');
        } else if (headersMatch.includes('time') && headersMatch.includes('alt')) {
            setXAxis('time');
            setYAxis('alt');
        } else if (headersMatch.length >= 2) {
            setXAxis(headersMatch[0]);
            setYAxis(headersMatch[1]);
        }
    };

    if (performanceData.length === 0) return null;

    return (
        <div className="flex flex-col h-full bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Header / Selector */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-[#227d8d]/10 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-[#227d8d]" />
                    </div>
                    <div>
                        <h3 className="text-[#144a54] font-bold text-[14px]">Dynamic Trajectory Analysis</h3>
                        <p className="text-[#6b788e] text-[10px] font-bold uppercase tracking-tight">Full telemetry resolution</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">Select Run</label>
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

                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">X-Axis</label>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            title="Select X-Axis"
                            className="bg-slate-50 border border-[#C7D8E6] rounded px-2 py-1 text-[10px] font-bold text-[#144a54] outline-none"
                        >
                            {headers.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">Y-Axis</label>
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            title="Select Y-Axis"
                            className="bg-slate-50 border border-[#C7D8E6] rounded px-2 py-1 text-[10px] font-bold text-[#144a54] outline-none"
                        >
                            {headers.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Plot Area */}
            <div className="flex-1 p-6 min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 text-[#227d8d] animate-spin mb-2" />
                        <span className="text-[12px] font-bold text-[#227d8d] uppercase">Processing telemetry data...</span>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-red-500">
                        <FileText className="w-12 h-12 opacity-20 mb-4" />
                        <p className="text-[14px] font-bold text-[#144a54]">{error}</p>
                        <p className="text-[10px] text-[#6b788e] mt-1 font-medium">Make sure the trajectory files exist in the dataroot directory.</p>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey={xAxis}
                                type="number"
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                label={{ value: xAxis.toUpperCase(), position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                            />
                            <YAxis
                                type="number"
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                label={{ value: yAxis.toUpperCase(), angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Line
                                data={data}
                                type="monotone"
                                dataKey={yAxis}
                                stroke="#227d8d"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }}
                                isAnimationActive={false}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#94a3b8]">
                        <span className="text-[10px] uppercase tracking-widest font-bold">No Data Available</span>
                    </div>
                )}
            </div>

            {/* Legend / Status */}
            {!loading && !error && data.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-[#E2E8F0] flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#227d8d]"></div>
                            <span className="text-[10px] text-[#144a54] font-bold uppercase tracking-tight">Active Telemetry Range</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-[#6b788e] font-bold">{data.length} datapoints processed</span>
                </div>
            )}
        </div>
    );
};
