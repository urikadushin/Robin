import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FullMissileData } from '../../../../../../backend/src/models/FullMissileModel';

interface PerformanceTabProps {
    threat: FullMissileData;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ threat }) => {
    const performanceData = threat.performance || [];

    if (performanceData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                No performance data available for this threat.
            </div>
        );
    }

    // Sort data by time step just in case
    const sortedData = [...performanceData].sort((a, b) => (a.time_step || 0) - (b.time_step || 0));

    return (
        <div className="h-full flex flex-col gap-8">
            <h3 className="text-xl font-bold text-slate-800">Trajectory Analysis</h3>

            <div className="grid grid-cols-2 gap-6 h-[400px]">

                {/* Altitude vs Range (Trajectory Profile) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Flight Profile (Alt vs Range)</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="rng"
                                    type="number"
                                    label={{ value: 'Range (km)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#94a3b8' } }}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <YAxis
                                    label={{ value: 'Altitude (km)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#94a3b8' } }}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="alt"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Altitude"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Velocity vs Time */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Velocity Profile</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="time_step"
                                    type="number"
                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#94a3b8' } }}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <YAxis
                                    label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#94a3b8' } }}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="vel"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Velocity"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 uppercase block mb-1">Max Altitude</span>
                    <span className="text-xl font-bold text-slate-700">
                        {Math.max(...sortedData.map(d => d.alt || 0)).toFixed(1)} <span className="text-sm font-normal text-slate-500">km</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 uppercase block mb-1">Max Velocity</span>
                    <span className="text-xl font-bold text-slate-700">
                        {Math.max(...sortedData.map(d => d.vel || 0)).toFixed(0)} <span className="text-sm font-normal text-slate-500">m/s</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 uppercase block mb-1">Flight Time</span>
                    <span className="text-xl font-bold text-slate-700">
                        {Math.max(...sortedData.map(d => d.time_step || 0)).toFixed(0)} <span className="text-sm font-normal text-slate-500">s</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 uppercase block mb-1">Total Range</span>
                    <span className="text-xl font-bold text-slate-700">
                        {Math.max(...sortedData.map(d => d.rng || 0)).toFixed(1)} <span className="text-sm font-normal text-slate-500">km</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
