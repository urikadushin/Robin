import React, { useState } from 'react';
import { FullMissileData } from '../../../backend/src/models/FullMissileModel';

import { ViewerHeader } from './ViewerHeader';
import { ViewerTabs } from './ViewerTabs';
import { GeneralTab } from './tabs/GeneralTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TechTab } from './tabs/TechTab';
import { MotorTab } from './tabs/MotorTab';
import { AeroTab } from './tabs/AeroTab';
import { MassPropertiesTab } from './tabs/MassPropertiesTab';
import { RcsTab } from './tabs/RcsTab';
import HeatTab from './tabs/HeatTab';
import { ThreeDViewer } from './ThreeDViewer';
interface ThreatViewerProps {
    threat: FullMissileData;
    onClose: () => void;
    onEdit: () => void;
}

export const ThreatViewer: React.FC<ThreatViewerProps> = ({ threat, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('general');

    // Design System Tokens (AODS - Aligned with Figma)
    const AODS = {
        mainDark: '#144a54',
        primaryTeal: '#227d8d',
        primaryBlue: '#227d8d', // Unifying blue/teal
        bgColor: '#f5f6f7',
        surfaceWhite: '#FFFFFF',
        textMain: '#144a54',
        textSecondary: '#6b788e',
        radiusBtn: '4px',
        radiusCard: '8px'
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f5f6f7] text-[#144a54] overflow-hidden animate-in fade-in duration-300 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background Depth Blobs - Premium Ambient Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 select-none">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#227d8d] blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-[#0066FF] blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-[#ECF2F6] blur-[140px] rounded-full" />
            </div>

            {/* High-Fidelity Header - Floating Card (8px Radius) */}
            <div className="relative z-50 px-8 pt-6 pb-2 pointer-events-none">
                <div className="flex flex-col gap-4 px-8 py-6 bg-white border-[1px] border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-[8px] pointer-events-auto">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#6b788e]">
                        <span className="hover:text-[#227d8d] cursor-pointer">Explore</span>
                        <span>/</span>
                        <span className="text-[#144a54]">{threat.missile.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col gap-1 pr-10 border-r border-[#E2E8F0]">
                                <h1 className="text-3xl font-bold text-[#144a54] leading-none tracking-tight">{threat.missile.name}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <svg className="w-3 h-3 text-[#6b788e]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 19.6L3.8 20.9 9.4 15.3 11.2 17.1 2.9 25.4 1 23.5 9.3 15.2 6.5 12.4 2.5 19.6ZM15.3 3.6L16.4 2.5 21.6 7.7 20.5 8.9 16.9 8.2 12 13.1 13.1 12 8.2 16.9 8.9 20.5 7.7 21.6 2.5 16.4 3.6 15.3 11.3 13 13 11.3 15.3 3.6Z" /></svg>
                                    <span className="text-[12px] font-medium text-[#6b788e] tracking-wide">{threat.missile.type || 'Missile'}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <ViewerHeader threat={threat} variant="tactical" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onEdit}
                                className="w-10 h-10 flex items-center justify-center bg-[#F1F5F9] text-[#717171] hover:bg-[#E2E8F0] hover:text-[#1A1A1A] transition-all rounded-[10px]"
                                title="Edit Specifications"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center bg-[#F1F5F9] text-[#717171] hover:bg-[#E2E8F0] hover:text-[#1A1A1A] transition-all rounded-[10px] group"
                            >
                                <span className="text-xl font-light transform group-hover:rotate-90 transition-transform">✕</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Tabs Navigation - Full Width */}
            <div className="px-8 pb-4">
                <div className="bg-[#F1F5F9] rounded-t-[12px] border-t border-x border-[#E0E0E0] overflow-hidden">

                </div>
            </div>

            {/* Split View Container - Expanded to full width */}
            <div className="flex-1 flex overflow-hidden max-w-[2560px] mx-auto w-full px-8 pb-8">

                {/* Data Panel (Tables, Specs) - Now always full width */}
                <div className="flex-1 h-full flex flex-col bg-white border-[1px] border-[#E0E0E0] rounded-[8px] relative overflow-hidden shadow-sm">
                    {/* Tabs Navigation - Always at the top of the panel */}
                    <div className="bg-[#F1F5F9]">
                        <div className="max-w-[1400px]">
                            <ViewerTabs activeTab={activeTab} onTabChange={setActiveTab} variant="tactical" />
                        </div>
                    </div>

                    {/* Tab Content Area - Scrollable but contained */}
                    <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar relative z-10 bg-white">
                        <div className="max-w-[1400px] mx-auto h-full flex flex-col">
                            {activeTab === 'general' && <GeneralTab threat={threat} layout="data" tab={activeTab} />}
                            {activeTab === 'structural' && <ThreeDViewer missileName={threat.missile.name} assets={threat.images} />}
                            {activeTab === 'tech' && <TechTab threat={threat} />}
                            {activeTab === 'motor' && <MotorTab threat={threat} />}
                            {activeTab === 'rcs' && <RcsTab threat={threat} />}
                            {activeTab === 'aero' && <AeroTab threat={threat} />}
                            {activeTab === 'performance' && <PerformanceTab threat={threat} />}
                            {activeTab === 'flight' && <PerformanceTab threat={threat} />}
                            {activeTab === 'heat' && <HeatTab threat={threat} />}
                            {activeTab === 'mass' && <MassPropertiesTab threat={threat} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar Footer */}
            <div className="h-8 bg-[#144a54] px-10 flex items-center justify-between text-[9px] font-semibold text-white/60 uppercase tracking-widest relative z-50">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#227d8d] rounded-full animate-pulse"></span>
                        Status: System_Operational
                    </span>
                    <span className="opacity-60">LAT: 35.6892° N | LON: 51.3890° E</span>
                </div>
                <div className="flex items-center gap-6">
                    <span>SYNC_TIME: {new Date().toLocaleTimeString()}</span>
                    <span className="text-[#227d8d] font-bold">AODS_V2_FIGMA</span>
                </div>
            </div>

        </div>
    );
};
