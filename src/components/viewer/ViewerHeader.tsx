import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';

interface ViewerHeaderProps {
    threat: FullMissileData;
    variant?: 'default' | 'tactical';
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({ threat, variant = 'default' }) => {
    const { performance = [], weightAndSize = [] } = threat;
    const isTactical = variant === 'tactical';

    const MetricItem = ({ label, value, unit }: { label: string, value: string | number | null | undefined, unit?: string }) => (
        <div className={`flex flex-col gap-1 ${isTactical ? 'min-w-[140px]' : 'border-r border-slate-100 last:border-0 pr-8 last:pr-0'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isTactical ? 'text-[#464C53]' : 'text-slate-400'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {label}
            </span>
            <div className="flex items-baseline gap-1">
                <span className={`text-xl font-extrabold leading-tight ${isTactical ? 'text-[#0066FF]' : 'text-slate-900'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {value ?? '---'}
                </span>
                {unit && (
                    <span className={`text-[10px] font-bold ${isTactical ? 'text-[#747E8B]' : 'text-slate-400'}`} >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className={`flex items-center ${isTactical ? 'justify-between' : 'gap-12'}`}>
            <MetricItem
                label="Threat Type"
                value={threat.missile.type}
            />
            <MetricItem
                label="Origin"
                value={threat.missile.origin}
            />
            <MetricItem
                label="Max Range"
                value={threat.missile.max_range}
                unit="KM"
            />
            <MetricItem
                label="Accuracy"
                value={threat.missile.accuracy ? `to ${threat.missile.accuracy}` : null}
                unit="M"
            />
            <MetricItem
                label="Velocity"
                value={threat.missile.velocity_mach}
                unit="MACH"
            />
            <MetricItem
                label="Launch Weight"
                value={threat.weightandsize?.launch_weight}
                unit="T"
            />
            <MetricItem
                label="Length"
                value={threat.weightandsize?.length}
                unit="M"
            />
            {threat.weightandsize?.diameter && (
                <MetricItem
                    label="Diameter"
                    value={threat.weightandsize.diameter}
                    unit="M"
                />
            )}
        </div>
    );
};
