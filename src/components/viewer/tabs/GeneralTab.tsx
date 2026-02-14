import React from 'react';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';
import { WeightAndSize } from '../../../../../backend/src/models/WeightAndSizeModel';
import { ThreatImage } from '../../../../../backend/src/models/EngineeringModels';
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

    if (isTacticalVisual) {
        return (
            <div className="w-full h-full flex flex-col p-4 animate-in zoom-in duration-500 bg-white rounded-[12px] shadow-sm">
                <ImageCarousel images={structureImages} missileName={threat.missile.name} />
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
        <div className="w-full h-full flex flex-col gap-8 bg-white p-8 rounded-[12px] border border-[#C7D8E6] shadow-sm">
            <ImageCarousel images={structureImages} missileName={threat.missile.name} />
        </div>
    );
};
