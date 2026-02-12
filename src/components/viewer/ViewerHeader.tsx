import React from 'react';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';

interface ViewerHeaderProps {
    threat: FullMissileData;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({ threat }) => {
    const { missile, performance = [], weightAndSize = [] } = threat;

    const getVal = (genName: string) => {
        const item = weightAndSize.find(w => w.generic_name === genName);
        return item ? item.property_value : null;
    };

    // Find max metrics from performance data
    const maxRng = performance.length > 0 ? Math.max(...performance.map(p => p.rng || 0)) : 0;
    const maxVel = performance.length > 0 ? Math.max(...performance.map(p => p.velEndOfBurn || 0)) : 0;

    const MetricItem = ({ label, value, unit }: { label: string, value: string | number | null | undefined, unit?: string }) => (
        <div className="flex flex-col gap-1 pr-12 border-r border-slate-100 last:border-0 last:pr-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-lg font-bold text-slate-700">
                {value ?? '-'} <span className="text-sm font-normal text-slate-500">{unit}</span>
            </span>
        </div>
    );

    return (
        <div className="flex flex-wrap items-center gap-y-4 bg-white/50 rounded-xl">
            <MetricItem label="Origin" value={missile.country || 'Unknown'} />
            <MetricItem
                label="Range"
                value={getVal('maxRange') || (maxRng > 0 ? maxRng : null)}
                unit="km"
            />
            <MetricItem
                label="Accuracy"
                value={missile.accuracy || 'to 50'}
                unit="m"
            />
            <MetricItem
                label="Velocity"
                value={maxVel > 0 ? (maxVel / 340).toFixed(1) : null}
                unit="mach"
            />
            <MetricItem
                label="Mass"
                value={getVal('launchWeight') || missile.launch_weight}
                unit="kg"
            />
            <MetricItem
                label="Length"
                value={getVal('totalLength') || missile.length}
                unit="m"
            />
            <MetricItem
                label="Diameter"
                value={getVal('d') || missile.diameter}
                unit="m"
            />
            <MetricItem
                label="Warhead"
                value={getVal('wh_weight') || missile.payload_weight}
                unit="kg"
            />
        </div>
    );
};
