import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { WeightAndSize } from '../../../../backend/src/models/WeightAndSizeModel';

interface TechTabProps {
    threat: FullMissileData;
}

export const TechTab: React.FC<TechTabProps> = ({ threat }) => {
    const { missile, engine, weightAndSize = [] } = threat;

    const getVal = (genNames: string | string[]) => {
        const names = Array.isArray(genNames) ? genNames : [genNames];
        // 1. Try generic names
        const item = weightAndSize.find((w: WeightAndSize) => names.includes(w.generic_name));
        if (item) return item.property_value;

        // 2. Try description as fallback (if generic_name is null)
        const descMatch = weightAndSize.find((w: WeightAndSize) => names.some(n => w.description?.toLowerCase().includes(n.toLowerCase())));
        if (descMatch) return descMatch.property_value;

        return null;
    };

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
            {/* Physical Dimensions */}
            <Section title="Structural Geometry" icon_color="text-[#227d8d]">
                <Row label="Total Length" value={getVal(['totalLength', 'length'])} unit="M" />
                <Row label="Body Diameter" value={getVal(['d', 'diameter'])} unit="M" />
                <Row label="Weapon Span" value={getVal(['span', 'span'])} unit="M" />
                <Row label="Launch Mass" value={getVal(['launchWeight', 'launch_weight'])} unit="KG" />
                <Row label="Payload Mass" value={getVal(['wh_weight'])} unit="KG" />
                <Row label="Section Count" value={getVal(['stage_number']) || missile.num_of_stages} />
            </Section>


            {/* Systems & Logic */}
            <Section title="Logic & Avionics" icon_color="text-[#6b788e]">
                <Row label="Guidance Mode" value={getVal('accuracy') ? "INS / GPS / TERCOM" : "INERTIAL"} />
                <Row label="Accuracy CEP" value={getVal('accuracy')} unit="M" />
                <Row label="Lofted Logic" value={threat.capability?.is_lofted} />
                <Row label="Decoy System" value={threat.capability?.is_decoy} />
                <Row label="Burst Debris" value={threat.capability?.is_burning_debris} />
            </Section>

            {/* Warhead & Effects */}
            <Section title="Effectors / Warhead" icon_color="text-[#d840be]">
                <Row label="Explosive Class" value={missile.explosive_type || 'CONVENTIONAL'} />
                <Row label="Net Expl. Mass" value={getVal('wh_weight')} unit="KG" />
                <Row label="Fuse Matrix" value="MULTI-MODE" />
                <Row label="Target Type" value={missile.family_type || 'SURFACE'} />
                <Row label="Destruction Mod" value="OPTIMIZED" />
            </Section>
        </div>
    );
};
