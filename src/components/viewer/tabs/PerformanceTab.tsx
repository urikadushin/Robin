import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { Performance } from '../../../../backend/src/models/EngineeringModels';
import { TrajectoryPlotter } from '../TrajectoryPlotter';

interface PerformanceTabProps {
    threat: FullMissileData;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ threat }) => {
    const performanceData = threat.performance || [];

    if (performanceData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#6b788e] font-bold text-[12px] uppercase tracking-widest border border-dashed border-[#C7D8E6] p-20 rounded-[8px] bg-white">
                Data Stream Empty: No performance metrics detected
            </div>
        );
    }

    const sortedData = [...performanceData].sort((a: Performance, b: Performance) => (a.perfIndex || 0) - (b.perfIndex || 0));

    return (
        <div className="h-full flex flex-col gap-10 animate-in fade-in duration-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Apogee', value: Math.max(...sortedData.map((d: Performance) => d.apogeeAlt || 0)).toFixed(1), unit: 'KM', color: 'text-[#227d8d]' },
                    { label: 'Max Velocity', value: Math.max(...sortedData.map((d: Performance) => d.velEndOfBurn || 0)).toFixed(0), unit: 'M/S', color: 'text-[#5bbdeb]' },
                    { label: 'TOB', value: Math.max(...sortedData.map((d: Performance) => d.timeEndOfBurn || 0)).toFixed(0), unit: 'SEC', color: 'text-[#144a54]' },
                    { label: 'Total Range', value: Math.max(...sortedData.map((d: Performance) => d.rng || 0)).toFixed(1), unit: 'KM', color: 'text-[#144a54]' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[8px] border border-[#C7D8E6] flex flex-col gap-1 shadow-sm">
                        <span className="text-[10px] font-bold text-[#6b788e] uppercase tracking-wider">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-[20px] font-bold ${stat.color}`}>{stat.value}</span>
                            <span className="text-[10px] text-[#6b788e] font-bold">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Dynamic Plotter */}
            <div className="flex-1 min-h-[500px]">
                <TrajectoryPlotter performanceData={sortedData} />
            </div>
        </div>
    );
};
