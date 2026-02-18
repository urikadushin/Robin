import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';

interface MotorTabProps {
    threat: FullMissileData;
}

export const MotorTab: React.FC<MotorTabProps> = ({ threat }) => {
    const { engine } = threat;

    const Section = ({ title, icon_color, children }: { title: string, icon_color: string, children: React.ReactNode }) => (
        <div className="border border-[#C7D8E6] bg-white p-6 rounded-[8px] h-full hover:border-[#227d8d]/40 transition-all group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-3 text-[9px] font-bold text-[#C7D8E6] uppercase select-none group-hover:text-[#6b788e] transition-colors">AODS_TECH_V2.0</div>
            <h3 className={`text-[12px] font-extrabold uppercase tracking-widest mb-6 flex items-center gap-2 ${icon_color}`}>
                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)] ${icon_color.replace('text-', 'bg-')}`}></span>
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const Row = ({ label, value, unit }: { label: string, value: string | number | undefined | boolean | null, unit?: string }) => (
        <div className="flex justify-between items-center py-2.5 border-b border-[#ECF2F6] last:border-0 group/row">
            <span className="text-[#6b788e] text-[10px] uppercase font-bold tracking-wider group-hover/row:text-[#6b788e] transition-colors">{label}</span>
            <span className="text-[#144a54] text-[14px] font-bold flex items-center gap-1">
                {value === true ? 'TRUE' : value === false ? 'FALSE' : value || '---'}
                {unit && value && <span className="text-[10px] font-bold text-[#6b788e] uppercase ml-1">{unit}</span>}
            </span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 animate-in fade-in duration-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Section title="Propulsion Matrix" icon_color="text-[#6b788e]">
                <Row label="Motor Variant" value={engine?.type || 'STANDARD'} />
                <Row label="Nominal Thrust" value={engine?.thrust} unit="KN" />
                <Row label="Spec Impulse" value={engine?.isp0} unit="SEC" />
                <Row label="Activation Lvl" value={engine?.tburn} unit="SEC" />
                <Row label="Propellant Mass" value={engine?.mass_propelant} unit="KG" />
                <Row label="Burn Profile" value={engine?.thrust_profile_file_name ? 'AVAILABLE' : 'INTERNAL'} />
            </Section>

            {/* Placeholder for potential Motor Graphs if data exists */}
            <div className="flex flex-col gap-6">
                <div className="text-[12px] text-[#6b788e] font-bold italic opacity-60 px-4">
                    Additional motor telemetric data will be visualised here.
                </div>
            </div>
        </div>
    );
};
