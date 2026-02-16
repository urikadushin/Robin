import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FullMissileData } from '../../backend/src/models/FullMissileModel';
import { Loader2, TrendingUp, GitCompare } from 'lucide-react';

interface OverlaidTrajectoryChartProps {
    threatsData: FullMissileData[];
}

interface PlotPoint {
    [key: string]: number;
    threatIdx: number;
}

export const OverlaidTrajectoryChart: React.FC<OverlaidTrajectoryChartProps> = ({ threatsData }) => {
    const [xAxis, setXAxis] = useState<string>('time');
    const [yAxis, setYAxis] = useState<string>('alt');
    const [allData, setAllData] = useState<{ [threatIdx: number]: PlotPoint[] }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);

    useEffect(() => {
        const fetchAllTrajectories = async () => {
            setLoading(true);
            const newData: { [threatIdx: number]: PlotPoint[] } = {};
            let globalHeaders: string[] = [];

            try {
                await Promise.all(threatsData.map(async (threat, idx) => {
                    const perf = threat.performance?.[0];
                    const path = perf?.trajectoryRvPath || perf?.trajectoryBtPath;
                    if (!path) return;

                    const response = await fetch(`http://localhost:3000/api/data/Trajectories/${path.replace(/\\/g, '/')}`);
                    if (!response.ok) return;

                    const text = await response.text();
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length === 0) return;

                    let headers: string[] = [];
                    let startIndex = 0;

                    if (lines[0].startsWith('#')) {
                        headers = lines[0].substring(1).split(',').map(h => h.trim());
                        startIndex = 1;
                    } else {
                        headers = ['time', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'alt', 'rcs'];
                    }

                    if (idx === 0) globalHeaders = headers;

                    const parsedPoints: PlotPoint[] = [];
                    for (let i = startIndex; i < lines.length; i++) {
                        const values = lines[i].split(/\s+/).map(v => parseFloat(v));
                        if (values.length >= headers.length) {
                            const point: PlotPoint = { threatIdx: idx };
                            headers.forEach((h, hIdx) => {
                                point[h] = values[hIdx];
                            });
                            parsedPoints.push(point);
                        }
                    }

                    // Sampling for performance
                    const samplingRate = Math.max(1, Math.floor(parsedPoints.length / 500));
                    newData[idx] = parsedPoints.filter((_, pIdx) => pIdx % samplingRate === 0);
                }));

                setAllData(newData);
                setAvailableHeaders(globalHeaders);
            } catch (err) {
                console.error("Error fetching overlaid trajectories:", err);
            } finally {
                setLoading(false);
            }
        };

        if (threatsData.length > 0) {
            fetchAllTrajectories();
        }
    }, [threatsData]);

    const combinedChartData = useMemo(() => {
        // Recharts works best with objects like { xAxisValue, threat0_y: val, threat1_y: val ... }
        // We need to align all series by the xAxis. 
        // This is complex for arbitrary X values. 
        // A simpler way for visualization is to just render multiple Line components with different data props.
        return allData;
    }, [allData]);

    // Color palette for threats
    const colors = ['#227d8d', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <div className="flex flex-col h-full gap-4 bg-white rounded-[12px] border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-[#227d8d]/10 p-2 rounded-lg">
                        <GitCompare className="w-5 h-5 text-[#227d8d]" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-[#144a54]">Comparative Trajectory Analysis</h4>
                        <p className="text-[10px] text-[#6b788e] font-bold uppercase tracking-tight">Overlaid telemetry data</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">X-Axis</label>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            title="Select X Axis"
                            className="bg-slate-50 border border-[#C7D8E6] rounded px-2 py-1 text-[10px] font-bold text-[#144a54] outline-none"
                        >
                            {availableHeaders.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-[#6b788e] uppercase mb-1">Y-Axis</label>
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            title="Select Y Axis"
                            className="bg-slate-50 border border-[#C7D8E6] rounded px-2 py-1 text-[10px] font-bold text-[#144a54] outline-none"
                        >
                            {availableHeaders.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 text-[#227d8d] animate-spin mb-2" />
                        <span className="text-[12px] font-bold text-[#227d8d] uppercase">Aligning Trajectories...</span>
                    </div>
                ) : (
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
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />

                            {Object.entries(allData).map(([idxStr, data]) => {
                                const idx = parseInt(idxStr);
                                const threatName = threatsData[idx]?.missile?.name || `Threat ${idx + 1}`;
                                return (
                                    <Line
                                        key={idx}
                                        data={data}
                                        type="monotone"
                                        dataKey={yAxis}
                                        name={threatName}
                                        stroke={colors[idx % colors.length]}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                        isAnimationActive={true}
                                        connectNulls
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
