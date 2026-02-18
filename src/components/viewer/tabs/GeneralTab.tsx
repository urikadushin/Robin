import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { ThreatImage } from '../../../../backend/src/models/EngineeringModels';
import { ImageCarousel } from '../ImageCarousel';

interface GeneralTabProps {
    threat: FullMissileData;
    layout?: 'default' | 'visual' | 'data';
    tab?: string;
}

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

const Section = ({ title, children, variant }: { title: string, children: React.ReactNode, variant?: string }) => (
    <div className="flex flex-col gap-4">
        <h3 className={`text-[14px] font-bold text-[#6b788e] uppercase tracking-widest ${variant === 'tactical' ? 'text-slate-500' : ''}`}>
            {title}
        </h3>
        {children}
    </div>
);

export const GeneralTab: React.FC<GeneralTabProps> = ({ threat, layout = 'data', tab = 'general' }) => {
    const { images = [] } = threat;

    // Filter images ONLY from the ExecutiveSummary directory
    const structureImages = images.filter((img: ThreatImage) =>
        img.image_type === 'executiveSummary'
    );

    const summaryUrl = threat.missile.executive_summary_file_name
        ? `http://localhost:3000/api/data/ExecutiveSummary/${threat.missile.executive_summary_file_name}`
        : null;

    return (
        <div className="w-full h-full bg-white animate-in fade-in duration-500" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex flex-col lg:flex-row min-h-0">
                {/* Left Side: Capabilities & Exec Summary - Expanded (flex-1.6) */}
                <div className="flex-[1.6] px-10 py-10 overflow-y-auto custom-scrollbar min-h-0 relative">
                    <Section title="CAPABILITIES" variant="tactical">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            {threat.missile.mirv && <CapabilityItem label="Separation Threats" active={true} />}
                            {threat.missile.maneuverable && <CapabilityItem label="Maneuverable" active={true} />}
                            {threat.missile.decoys && <CapabilityItem label="Decoys" active={true} />}
                            {threat.missile.nuclear_capable && <CapabilityItem label="Nuclear Capable" active={true} />}
                            {threat.missile.hypersonic && <CapabilityItem label="Hypersonic" active={true} />}
                            {threat.missile.terminal_maneuver && <CapabilityItem label="Terminal Maneuver" active={true} />}

                            {/* Static/Common capabilities for layout filling if data is sparse */}
                            <CapabilityItem label="Precision Guidance" active={true} />
                            <CapabilityItem label="Solid Propellant" active={true} />
                        </div>
                    </Section>

                    <div className="mt-12">
                        <Section title="EXECUTIVE SUMMARY INTELLIGENCE" variant="tactical">
                            {summaryUrl ? (
                                <div className="mt-4 border border-slate-200 rounded-[12px] bg-slate-50 overflow-hidden shadow-inner">
                                    <iframe
                                        src={summaryUrl}
                                        className="w-full h-[600px] border-none"
                                        title="Intelligence Summary"
                                    />
                                </div>
                            ) : (
                                <div className="mt-4 p-8 border border-dashed border-slate-300 rounded-[12px] bg-slate-50 text-slate-500 text-center">
                                    No executive summary available for this threat.
                                </div>
                            )}
                        </Section>
                    </div>
                </div>

                {/* Delicate Vertical Separator */}
                <div className="hidden lg:block w-[1px] bg-slate-200 self-stretch my-10 opacity-60"></div>

                {/* Right Side: Image Carousel */}
                <div className="flex-1 lg:pl-12 flex flex-col py-6">
                    <div className="w-full h-fit flex flex-col sticky top-10">
                        <ImageCarousel
                            images={structureImages}
                            missileName={threat.missile.name}
                            showNavigation={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
