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
    const { images = [], weightAndSize = [], performance = [] } = threat;

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

    const CapabilityItem = ({ label, active }: { label: string, active?: boolean }) => (
        <div className="flex items-center justify-between py-3 border-b border-dashed border-slate-200 last:border-0 group">
            <span className="text-[14px] font-medium text-[#475569]">
                {label}
            </span>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${active
                ? 'bg-[#E0F2FE] text-[#227d8d]'
                : 'bg-slate-100 text-slate-400'
                }`}>
                {active ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" /></svg>
                )}
            </div>
        </div>
    );

    if (isTacticalVisual) {
        return (
            <div className="w-full bg-white animate-in fade-in duration-500">
                <div className="flex flex-col min-h-0 bg-white">
                    <ImageCarousel images={structureImages} missileName={threat.missile.name} />
                </div>
            </div>
        );
    }

    if (isTacticalData) {
        return (
            <div className="w-full animate-in fade-in duration-500" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* Single Card Content Layout (Container provided by ThreatViewer) */}
                <div className="flex flex-col lg:flex-row">

                    {/* Left Side: Capabilities & Exec Summary */}
                    <div className="flex-[1.6] flex flex-col gap-8 pr-4 lg:pr-8">

                        {/* Capabilities Section */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[14px] font-bold text-[#6b788e] uppercase tracking-widest">
                                Capabilities
                            </h3>
                            <div className="grid grid-cols-1 gap-y-3">
                                {threat.missile.mirv && <CapabilityItem label="Separation Threats" active={true} />}
                                {threat.missile.maneuverable && <CapabilityItem label="Maneuverable" active={true} />}
                                {threat.missile.decoys && <CapabilityItem label="Decoys" active={true} />}
                                {threat.missile.nuclear_capable && <CapabilityItem label="Nuclear Capable" active={true} />}
                                {threat.missile.hypersonic && <CapabilityItem label="Hypersonic" active={true} />}
                                {threat.missile.terminal_maneuver && <CapabilityItem label="Terminal Maneuver" active={true} />}
                                {/* Fallback if no capabilities are active */}
                                {!threat.missile.mirv && !threat.missile.maneuverable && !threat.missile.decoys &&
                                    !threat.missile.nuclear_capable && !threat.missile.hypersonic && !threat.missile.terminal_maneuver && (
                                        <div className="text-sm text-gray-400 italic">No specific capabilities listed.</div>
                                    )}
                            </div>
                        </div>

                        {/* Executive Summary Section */}
                        <div className="flex flex-col gap-4 w-full">
                            <h3 className="text-[14px] font-bold text-[#6b788e] uppercase tracking-widest">
                                Executive Summary Intelligence
                            </h3>
                            {summaryUrl ? (
                                <iframe
                                    src={summaryUrl}
                                    className="w-full min-h-[600px] border border-[#E2E8F0] rounded-[6px] shadow-sm bg-slate-50"
                                    title="Executive Summary"
                                />
                            ) : (
                                <div className="p-8 text-center text-[#6b788e] italic bg-slate-50 rounded-[6px] border border-dashed border-slate-200">
                                    No Executive Summary available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vertical Separator (only on large screens) */}
                    <div className="hidden lg:block w-[1px] bg-[#E2E8F0] my-2"></div>

                    {/* Right Side: Image Carousel */}
                    <div className="flex-1 lg:pl-12 flex flex-col py-8 min-h-[500px]">
                        <div className="w-full flex-1 flex flex-col">
                            <ImageCarousel
                                images={isTacticalVisual ? structureImages : [...structureImages, ...(images || [])]}
                                missileName={threat.missile.name}
                            />
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return null;
};
