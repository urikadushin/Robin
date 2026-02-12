import React, { useState } from 'react';
import { FullMissileData } from '../../../../../backend/src/models/FullMissileModel';
import { ViewerHeader } from './ViewerHeader';
import { ViewerTabs } from './ViewerTabs';
import { GeneralTab } from './tabs/GeneralTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TechTab } from './tabs/TechTab';

interface ThreatViewerProps {
    threat: FullMissileData;
    onClose: () => void;
    onEdit: () => void;
}

export const ThreatViewer: React.FC<ThreatViewerProps> = ({ threat, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('general');

    // Backdrop click handler
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-8"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-7xl h-full max-h-[90vh] bg-[#f5f7fa] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">

                {/* Top Bar / Header Region */}
                <div className="bg-white px-8 pt-6 pb-4 shadow-sm z-10 relative">
                    <div className="flex justify-between items-start mb-6">
                        {/* Title Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-800">{threat.missile.name}</h1>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {threat.missile.type || 'Missile'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span>Explore</span>
                                <span>/</span>
                                <span className="font-medium text-slate-700">{threat.missile.name}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                title="Edit"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Metrics Strip */}
                    <ViewerHeader threat={threat} />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white px-8 border-b border-slate-200">
                    <ViewerTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#f5f7fa]">
                    {activeTab === 'general' && <GeneralTab threat={threat} />}
                    {activeTab === 'performance' && <PerformanceTab threat={threat} />}
                    {activeTab === 'tech' && <TechTab threat={threat} />}
                    {activeTab === 'rcs' && <div className="p-10 text-center text-slate-400">RCS View Construction...</div>}
                    {activeTab === 'structure' && <div className="p-10 text-center text-slate-400">Structural View Construction...</div>}
                </div>

            </div>
        </div>
    );
};
