import React, { useState } from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';

import { ViewerHeader } from './ViewerHeader';
import { ViewerTabs } from './ViewerTabs';
import { GeneralTab } from './tabs/GeneralTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TechTab } from './tabs/TechTab';
import { AeroTab } from './tabs/AeroTab';
import { MassPropertiesTab } from './tabs/MassPropertiesTab';

interface ThreatViewerProps {
    threat: FullMissileData;
    onClose: () => void;
    onEdit: () => void;
}

export const ThreatViewer: React.FC<ThreatViewerProps> = ({ threat, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('general');

    // Design System Tokens (AODS)
    const AODS = {
        mainDark: '#21133B',
        primaryTeal: '#03879E',
        bgColor: '#ECF2F6',
        surfaceWhite: '#FFFFFF',
        textMain: '#21133B',
        textSecondary: '#464C53',
        radiusBtn: '4px',
        radiusCard: '12px'
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#ECF2F6] text-[#21133B] overflow-hidden animate-in fade-in duration-300 font-sans" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {/* Tactical Header Overlay - AeroDan Official Dark Header */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="flex items-center justify-between px-10 py-4 bg-[#21133B] shadow-lg pointer-events-auto">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-white leading-none">{threat.missile.name}</h1>
                            <div className="px-2 py-0.5 bg-[#03879E] text-white text-[9px] font-bold tracking-widest uppercase rounded-[4px]">Verified_Entity</div>
                        </div>
                        <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Sector: Global | Class: {threat.missile.type || 'Ballistic'}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onEdit}
                            className="px-6 py-2 bg-[#03879E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#03778C] transition-all rounded-[4px] shadow-sm active:scale-95"
                        >
                            Modify_Spec
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all rounded-[4px]"
                        >
                            <span className="text-xl font-light">✕</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Split View Container - Contained Width */}
            <div className="flex-1 flex mt-[72px] overflow-hidden max-w-[2560px] mx-auto w-full">

                {/* Data LEFT Panel (Tables, Specs) */}
                <div className="flex-1 h-full flex flex-col bg-[#ECF2F6] relative">
                    {/* Metrics Bar - Multi-Metric Surface */}
                    <div className="px-10 py-6 border-b border-[#C7D8E6] bg-white shadow-sm overflow-x-auto whitespace-nowrap">
                        <div className="max-w-[1400px]">
                            <ViewerHeader threat={threat} variant="tactical" />
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="px-10 mt-6 overflow-x-auto">
                        <div className="max-w-[1400px]">
                            <ViewerTabs activeTab={activeTab} onTabChange={setActiveTab} variant="tactical" />
                        </div>
                    </div>

                    {/* Tab Content Area - Scrollable but contained */}
                    <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                        <div className="max-w-[1400px]">
                            {activeTab === 'general' && <GeneralTab threat={threat} layout="data" />}
                            {activeTab === 'performance' && <PerformanceTab threat={threat} />}
                            {activeTab === 'tech' && <TechTab threat={threat} />}
                            {activeTab === 'aero' && <AeroTab threat={threat} />}
                            {activeTab === 'mass' && <MassPropertiesTab threat={threat} />}
                        </div>
                    </div>
                </div>

                {/* Visual RIGHT Panel (Image Carousel etc) */}
                <div className="w-[450px] xl:w-[600px] h-full border-l border-[#C7D8E6] relative bg-white flex flex-col flex-shrink-0">
                    <div className="p-8 h-full flex flex-col relative z-10">
                        <GeneralTab threat={threat} layout="visual" />
                    </div>
                    {/* Bottom visual decoration */}
                    <div className="absolute bottom-6 right-6 p-3 px-5 border-l-4 border-[#03879E] bg-[#03879E]/5">
                        <span className="text-[10px] font-bold text-[#03879E] uppercase tracking-widest">Telemetry_Stream_Active</span>
                    </div>
                </div>
            </div>

            {/* Status Bar Footer */}
            <div className="h-8 bg-[#21133B] px-10 flex items-center justify-between text-[9px] font-semibold text-white/40 uppercase tracking-widest relative z-50">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#40B5BF] rounded-full animate-pulse"></span>
                        Status: System_Operational
                    </span>
                    <span className="opacity-60">LAT: 35.6892° N | LON: 51.3890° E</span>
                </div>
                <div className="flex items-center gap-6">
                    <span>SYNC_TIME: {new Date().toLocaleTimeString()}</span>
                    <span className="text-[#30C7F1] font-bold">AODS_V1_READY</span>
                </div>
            </div>
        </div>
    );
};
