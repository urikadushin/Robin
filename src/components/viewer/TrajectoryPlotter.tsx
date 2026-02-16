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
                const response = await fetch(`http://localhost:3000/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
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
        <div className="flex flex-col h-full bg-[#1a1c1e] rounded-xl border border-teal-500/20 overflow-hidden">
            {/* Header / Selector */}
            <div className="p-4 border-b border-teal-500/20 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500/10 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Dynamic Trajectory Analysis</h3>
                        <p className="text-teal-400/60 text-xs">Full telemetry resolution</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-teal-400/40 uppercase font-bold mb-1">Select Run</label>
                        <select
                            value={selectedPerfId ?? ''}
                            onChange={(e) => setSelectedPerfId(parseInt(e.target.value))}
                            title="Select Performance Run"
                            className="bg-[#2a2d31] text-teal-50 text-xs border border-teal-500/30 rounded px-2 py-1 focus:outline-none focus:border-teal-400 transition-colors cursor-pointer"
                        >
                            {performanceData.map(p => (
                                <option key={p.perfIndex} value={p.perfIndex}>
                                    Run #{p.perfIndex}: {p.trajType} ({p.rng}km)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] text-teal-400/40 uppercase font-bold mb-1">X-Axis</label>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            title="Select X-Axis"
                            className="bg-[#2a2d31] text-teal-50 text-xs border border-teal-500/30 rounded px-2 py-1 focus:outline-none focus:border-teal-400"
                        >
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] text-teal-400/40 uppercase font-bold mb-1">Y-Axis</label>
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            title="Select Y-Axis"
                            className="bg-[#2a2d31] text-teal-50 text-xs border border-teal-500/30 rounded px-2 py-1 focus:outline-none focus:border-teal-400"
                        >
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Plot Area */}
            <div className="flex-1 p-4 min-h-[300px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1c1e]/80 z-10">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                        <span className="text-teal-400 text-sm">Processing telemetry data...</span>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-red-400">
                        <FileText className="w-12 h-12 opacity-20 mb-4" />
                        <p className="text-sm font-medium">{error}</p>
                        <p className="text-xs opacity-60 mt-1">Make sure the trajectory files exist in the dataroot directory.</p>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2dd4bf" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey={xAxis}
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: xAxis, position: 'insideBottom', offset: -5, fill: '#5eead4', fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: yAxis, angle: -90, position: 'insideLeft', fill: '#5eead4', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #14b8a6', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#2dd4bf' }}
                            />
                            <Line
                                type="monotone"
                                dataKey={yAxis}
                                stroke="#2dd4bf"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, stroke: '#2dd4bf', strokeWidth: 2, fill: '#1f2937' }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-teal-400/20">
                        <span className="text-xs uppercase tracking-widest font-bold">No Data Available</span>
                    </div>
                )}
            </div>

            {/* Legend / Status */}
            {!loading && !error && data.length > 0 && (
                <div className="px-6 py-2 bg-teal-500/5 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-tight">Active Telemetry Range</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-teal-400/40">{data.length} datapoints processed</span>
                </div>
            )}
        </div>
    );
};
