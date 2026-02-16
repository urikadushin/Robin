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

    useEffect(() => {
        if (!selectedPerf) return;

        const loadTrajectory = async () => {
            setLoading(true);
            setError(null);
            try {
                const path = selectedPerf.trajectoryRvPath || selectedPerf.trajectoryBtPath;
                if (!path) throw new Error('No trajectory file path found');

                const response = await fetch(`http://localhost:3000/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
                if (!response.ok) throw new Error('Failed to fetch trajectory file');

                const text = await response.text();
                parseTrajFile(text);
            } catch (err: any) {
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

        const samplingRate = Math.max(1, Math.floor(parsedData.length / 500));
        setData(parsedData.filter((_, idx) => idx % samplingRate === 0));
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e] rounded-xl border border-teal-500/20 overflow-hidden">
            <div className="p-4 border-b border-teal-500/20 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500/10 p-2 rounded-lg">
                        <Radar className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Dynamic RCS Signature</h3>
                        <p className="text-teal-400/60 text-xs">Multi-frequency response analysis</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] text-teal-400/40 uppercase font-bold mb-1">Select Engagement Run</label>
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
            </div>

            <div className="flex-1 p-4 min-h-[300px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                        <span className="text-teal-400 text-sm">Loading Signal Data...</span>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-red-400">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2dd4bf" opacity={0.1} vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #14b8a6', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#2dd4bf' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="rcs1" stroke="#2dd4bf" strokeWidth={1.5} dot={false} name="Freq A" />
                            <Line type="monotone" dataKey="rcs2" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="Freq B" />
                            <Line type="monotone" dataKey="rcs3" stroke="#f472b6" strokeWidth={1.5} dot={false} name="Freq C" />
                            <Line type="monotone" dataKey="rcs4" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="Freq D" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
};
