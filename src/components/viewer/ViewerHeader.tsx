import React from 'react';
import { FullMissileData } from '../../../backend/src/models/FullMissileModel';

interface ViewerHeaderProps {
    threat: FullMissileData;
    variant?: 'default' | 'tactical';
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({ threat, variant = 'default' }) => {
    const { performance = [], weightAndSize = [] } = threat;
    const isTactical = variant === 'tactical';

    const MetricItem = ({ label, value, unit }: { label: string, value: string | number | null | undefined, unit?: string }) => (
        <div className="flex flex-col gap-1.5 min-w-[80px]">
            <span className="text-[12px] text-[#6b788e]" style={{ fontFamily: "'Inter', sans-serif" }}>
                {label}
            </span>
            <div className="flex items-baseline gap-1">
                <span className="text-[14px] text-[#144a54]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {value ?? '---'}
                </span>
            </div>
        </div>
    );

    const getPerformanceValue = (propertyName: string) => {
        // 1. Try to find in structured performance records (Direct column access)
        const firstPerf = performance[0];
        if (firstPerf) {
            // Map common requested names to DB columns
            if (propertyName === 'max_range' && firstPerf.rng) return firstPerf.rng;
            if (propertyName === 'velocity_mach' && firstPerf.velEndOfBurn) return (firstPerf.velEndOfBurn / 343).toFixed(1); // Rough m/s to Mach
            if (propertyName === 'accuracy' && (firstPerf as any).accuracy) return (firstPerf as any).accuracy;
        }

        // 2. Fallback to generic name search in performance (if backend returns key-value pairs)
        const item = performance.find((p: any) => p.property_name === propertyName || p.generic_name === propertyName);
        if (item) return (item as any).property_value;

        // 3. Last fallback: Check weightAndSize (sometimes data is duplicated there)
        const wsItem = weightAndSize.find((w: any) => w.generic_name === propertyName || (propertyName === 'max_range' && w.generic_name === 'maxRange'));
        return wsItem ? wsItem.property_value : null;
    };

    const getSizeValue = (genericNames: string[]) => {
        const item = weightAndSize.find((w: any) => genericNames.includes(w.generic_name));
        return item ? item.property_value : null;
    };

    return (
        <div className="flex items-center justify-between w-full h-full">
            <div className="flex items-center gap-16">
                <MetricItem label="Origin" value={getSizeValue(['origin'])} />
                <MetricItem label="Range (km)" value={getPerformanceValue('max_range') || getSizeValue(['maxRange', 'max_range'])} />
                <MetricItem label="Accuracy (m)" value={getPerformanceValue('accuracy') || getSizeValue(['accuracy'])} />
                <MetricItem label="Velocity (mach)" value={getPerformanceValue('velocity_mach') || getSizeValue(['velocity'])} />
                <MetricItem label="Mass (tonnes)" value={getSizeValue(['launchWeight', 'launch_weight', 'weight']) ? (parseFloat(getSizeValue(['launchWeight', 'launch_weight', 'weight'])!) / 1000).toFixed(1) : '---'} />
                <MetricItem label="Length (m)" value={getSizeValue(['length', 'totalLength'])} />
                <MetricItem label="Diameter (m)" value={getSizeValue(['diameter', 'd'])} />
                <MetricItem label="Warhead Weight (kg)" value={getSizeValue(['payloadWeight', 'whWeight', 'wh_weight', 'warhead_weight', 'payload_weight'])} />
            </div>
        </div>
    );
};
