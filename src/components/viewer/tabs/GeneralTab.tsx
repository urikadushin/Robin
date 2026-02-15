import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { WeightAndSize } from '../../../../backend/src/models/WeightAndSizeModel';
import { ThreatImage } from '../../../../backend/src/models/EngineeringModels';
import { ImageCarousel } from '../ImageCarousel';

interface GeneralTabProps {
    threat: FullMissileData;
    layout?: 'default' | 'visual' | 'data';
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ threat, layout = 'default' }) => {
    const { images = [], weightAndSize = [] } = threat;

    const getVal = (genName: string) => {
        const item = weightAndSize.find((w: WeightAndSize) => w.generic_name === genName);
        return item ? item.property_value : null;
    };

    // Filter images relevant for Structure view (Executive Summary or Physical Data)
    const structureImages = images.filter((img: ThreatImage) =>
        img.image_type === 'executiveSummary' ||
        img.image_type === 'physicalData'
    );

    const isTacticalData = layout === 'data';
    const isTacticalVisual = layout === 'visual';

    const summaryUrl = threat.missile.executive_summary_file_name
        ? `http://localhost:3000/api/data/ExecutiveSummary/${threat.missile.executive_summary_file_name}`
        : null;

    if (isTacticalVisual) {
        return (
            <div className="w-full h-full flex flex-col gap-6 p-4 animate-in zoom-in duration-500 bg-white rounded-[12px] shadow-sm overflow-hidden">
                <div className="flex-1 min-h-[400px]">
                    <ImageCarousel images={structureImages} missileName={threat.missile.name} />
                </div>
                {summaryUrl && (
                    <div className="flex-1 border-t border-[#ECF2F6] pt-6 flex flex-col h-full min-h-[500px]">
                        <h3 className="text-[11px] font-extrabold text-[#747E8B] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full"></span>
                            Executive Summary Intelligence
                        </h3>
                        <iframe
                            src={summaryUrl}
                            className="w-full flex-1 border-none rounded-lg bg-slate-50"
                            title="Executive Summary"
                        />
                    </div>
                )}
            </div>
        );
    }

    if (isTacticalData) {
        return (
            <div className="flex flex-col gap-10 animate-in slide-in-from-right duration-500" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {/* Identification Widget */}
                <div className="border border-[#C7D8E6] bg-white p-6 rounded-[12px] relative overflow-hidden group shadow-sm">
                    <div className="absolute top-0 right-0 p-3 text-[9px] font-bold text-[#C7D8E6] uppercase select-none">ID_SECURLY_VERIFIED</div>
                    <h3 className="text-[12px] font-extrabold text-[#03879E] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                        Entity Identification
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        {[
                            { label: 'Name', value: threat.missile.name },
                            { label: 'Type', value: threat.missile.type },
                            { label: 'Status', value: threat.missile.status || 'OPERATIONAL' },
                            { label: 'Origin', value: getVal('origin') || threat.missile.family_type || 'GLOBAL' },
                            { label: 'Manufacturer', value: threat.missile.manufacturer || 'CLASSIFIED' },
                            { label: 'Year', value: threat.missile.year },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1 border-l-2 border-[#ECF2F6] pl-4 hover:border-[#03879E] transition-colors">
                                <span className="text-[10px] text-[#464C53] uppercase font-bold tracking-wider">{item.label}</span>
                                <span className="text-[15px] text-[#21133B] font-extrabold uppercase">{item.value || 'N/A'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description Widget */}
                <div className="border border-[#C7D8E6] bg-white p-6 rounded-[12px] group shadow-sm">
                    <h3 className="text-[12px] font-extrabold text-[#747E8B] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#C7D8E6] rounded-full"></span>
                        Asset Intelligence
                    </h3>
                    <p className="text-[14px] text-[#464C53] leading-relaxed font-semibold italic border-l-2 border-[#ECF2F6] pl-4">
                        {threat.missile.description || "No tactical description available for this asset. System is awaiting intelligence update."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-8 bg-white p-8 rounded-[12px] border border-[#C7D8E6] shadow-sm overflow-hidden">
            <div className="flex-1 min-h-[400px]">
                <ImageCarousel images={structureImages} missileName={threat.missile.name} />
            </div>
            {summaryUrl && (
                <div className="flex-1 border-t border-[#ECF2F6] pt-8 flex flex-col min-h-[600px]">
                    <h3 className="text-[12px] font-extrabold text-[#21133B] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#03879E] rounded-full"></span>
                        Strategic Executive Summary
                    </h3>
                    <iframe
                        src={summaryUrl}
                        className="w-full flex-1 border-none rounded-lg bg-slate-50"
                        title="Strategic Summary"
                    />
                </div>
            )}
        </div>
    );
};

