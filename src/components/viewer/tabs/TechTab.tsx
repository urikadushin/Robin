import React from 'react';
import { FullMissileData } from '../../../../../../backend/src/models/FullMissileModel';

interface TechTabProps {
    threat: FullMissileData;
}

export const TechTab: React.FC<TechTabProps> = ({ threat }) => {
    const { missile, engine, weightAndSize } = threat;
    const ws = weightAndSize && weightAndSize.length > 0 ? weightAndSize[0] : null;

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">{title}</h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    const Row = ({ label, value, unit }: { label: string, value: string | number | undefined | boolean, unit?: string }) => (
        <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 text-sm font-medium">{label}</span>
            <span className="text-slate-700 font-semibold text-sm">
                {value === true ? 'Yes' : value === false ? 'No' : value || '-'}
                {unit && value ? <span className="ml-1 text-slate-400 text-xs font-normal">{unit}</span> : ''}
            </span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto">

            {/* Physical Dimensions */}
            <Section title="Physical Dimensions">
                <Row label="Length" value={ws?.length || missile.length} unit="m" />
                <Row label="Diameter" value={ws?.diameter || missile.diameter} unit="m" />
                <Row label="Span" value={ws?.span} unit="m" />
                <Row label="Launch Weight" value={ws?.weight || missile.launch_weight} unit="kg" />
                <Row label="Payload Weight" value={missile.payload_weight} unit="kg" />
                <Row label="Stage Count" value={ws?.stage_number} />
            </Section>

            {/* Propulsion System */}
            <Section title="Propulsion">
                <Row label="Engine Type" value={engine?.type} />
                <Row label="Thrust" value={engine?.thrust} unit="kN" />
                <Row label="ISP" value={engine?.isp0} unit="s" />
                <Row label="Burn Time" value={engine?.tburn} unit="s" />
                <Row label="Propellant Mass" value={engine?.mass_propelant} unit="kg" />
            </Section>

            {/* Guidance & Control (Placeholder fields based on generic model) */}
            <Section title="Guidance & Control">
                <Row label="Guidance Type" value={missile.accuracy ? "INS/GPS" : "Unknown"} />
                <Row label="Accuracy (CEP)" value={missile.accuracy} unit="m" />
                <Row label="Steerable" value="Yes" />
                <Row label="Terminal Homing" value="N/A" />
            </Section>

            {/* Warhead */}
            <Section title="Warhead">
                <Row label="Type" value="HE / Chemical / Nuclear" />
                <Row label="Weight" value={missile.payload_weight} unit="kg" />
                <Row label="Fuse Type" value="Impact / Proximity" />
            </Section>

            {/* Operational */}
            <Section title="Operational">
                <Row label="Country of Origin" value={missile.country} />
                <Row label="Manufacturer" value={missile.manufacturer} />
                <Row label="Service Entry" value={missile.year_entered_service} />
                <Row label="Status" value="Operational" />
            </Section>

        </div>
    );
};
