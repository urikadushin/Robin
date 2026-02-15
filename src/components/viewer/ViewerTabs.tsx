import React from 'react';

interface ViewerTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    variant?: 'default' | 'tactical';
}

export const ViewerTabs: React.FC<ViewerTabsProps> = ({ activeTab, onTabChange, variant = 'default' }) => {
    const isTactical = variant === 'tactical';

    const tabs = isTactical
        ? [
            { id: 'general', label: 'General' },
            { id: 'aero', label: 'Aero/Stability' },
            { id: 'mass', label: 'Mass prop' },
            { id: 'tech', label: 'Tech' },
            { id: 'history', label: 'History' },
            { id: 'performance', label: 'Performance' },
            { id: 'launch', label: 'Launch Platform' },
            { id: 'sensors', label: 'Sensors' },
            { id: 'warhead', label: 'Warhead' },
            { id: 'propulsion', label: 'Propulsion' },
            { id: 'guidance', label: 'Guidance' }
        ]
        : [
            { id: 'general', label: 'General Information' },
            { id: 'structural', label: 'Structural View' },
            { id: 'tech', label: 'Tech View' },
            { id: 'performance', label: 'Performance' }
        ];

    return (
        <div className={`flex items-center ${isTactical ? 'gap-10 border-b border-[#C7D8E6]' : 'gap-8 border-b border-slate-200'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative
                        ${activeTab === tab.id
                            ? 'text-[#0066FF]'
                            : 'text-[#333333] hover:text-[#000000]'}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066FF] rounded-t-full shadow-[0_-2px_6px_rgba(0,102,255,0.3)]" />
                    )}
                </button>
            ))}
        </div>
    );
};
