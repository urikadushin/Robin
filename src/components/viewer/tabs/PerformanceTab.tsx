import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';
import { Performance } from '../../../../../backend/src/models/EngineeringModels';

interface PerformanceTabProps {
    threat: FullMissileData;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ threat }) => {
    const performanceData = threat.performance || [];

    if (performanceData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#747E8B] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[12px] bg-white">
                Data Stream Empty: No performance metrics detected
            </div>
        );
    }

    const sortedData = [...performanceData].sort((a: Performance, b: Performance) => (a.perfIndex || 0) - (b.perfIndex || 0));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#C7D8E6] p-4 shadow-xl rounded-[4px]">
                    <p className="text-[10px] font-bold text-[#464C53] mb-2 uppercase">Step Index: {label}</p>
                    {payload.map((p: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }}></div>
                            <span className="text-[14px] font-extrabold text-[#21133B] uppercase">{p.value.toLocaleString()}</span>
                            <span className="text-[10px] text-[#747E8B] font-bold uppercase">{p.name}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col gap-10 animate-in fade-in duration-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <h3 className="text-[12px] font-extrabold text-[#21133B] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                Dynamic Trajectory Analysis
            </h3>

            <div className="grid grid-cols-2 gap-8 h-[400px]">
                {/* Altitude vs Range */}
                <div className="bg-white p-6 rounded-[12px] border border-[#C7D8E6] flex flex-col group hover:border-[#03879E]/40 transition-all shadow-sm">
                    <h4 className="text-[11px] font-extrabold text-[#747E8B] mb-6 uppercase tracking-wider">Flight Profile [ALT_KM x RNG_KM]</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ECF2F6" vertical={false} />
                                <XAxis
                                    dataKey="rng"
                                    type="number"
                                    stroke="#C7D8E6"
                                    tick={{ fontSize: 9, fill: '#747E8B', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#C7D8E6"
                                    tick={{ fontSize: 9, fill: '#747E8B', fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#03879E', strokeWidth: 1 }} />
                                <Line
                                    type="monotone"
                                    dataKey="alt"
                                    stroke="#03879E"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Alt (km)"
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Velocity vs Time */}
                <div className="bg-white p-6 rounded-[12px] border border-[#C7D8E6] flex flex-col group hover:border-[#03879E]/40 transition-all shadow-sm">
                    <h4 className="text-[11px] font-extrabold text-[#747E8B] mb-6 uppercase tracking-wider">Velocity Dynamics [VEL_MS x TIME_S]</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ECF2F6" vertical={false} />
                                <XAxis
                                    dataKey="timeOfFlight"
                                    type="number"
                                    stroke="#C7D8E6"
                                    tick={{ fontSize: 9, fill: '#747E8B', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#C7D8E6"
                                    tick={{ fontSize: 9, fill: '#747E8B', fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3050EF', strokeWidth: 1 }} />
                                <Line
                                    type="monotone"
                                    dataKey="velEndOfBurn"
                                    stroke="#3050EF"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Vel (m/s)"
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-4 gap-4 pb-8">
                {[
                    { label: 'Apogee', value: Math.max(...sortedData.map((d: Performance) => d.apogeeAlt || 0)).toFixed(1), unit: 'KM', color: 'text-[#03879E]' },
                    { label: 'Max Velocity', value: Math.max(...sortedData.map((d: Performance) => d.velEndOfBurn || 0)).toFixed(0), unit: 'M/S', color: 'text-[#3050EF]' },
                    { label: 'TOB', value: Math.max(...sortedData.map((d: Performance) => d.timeEndOfBurn || 0)).toFixed(0), unit: 'SEC', color: 'text-[#21133B]' },
                    { label: 'Total Range', value: Math.max(...sortedData.map((d: Performance) => d.rng || 0)).toFixed(1), unit: 'KM', color: 'text-[#21133B]' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[12px] border border-[#C7D8E6] flex flex-col gap-1 shadow-sm">
                        <span className="text-[10px] font-bold text-[#747E8B] uppercase tracking-wider">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-[20px] font-extrabold ${stat.color}`}>{stat.value}</span>
                            <span className="text-[10px] text-[#747E8B] font-bold">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
