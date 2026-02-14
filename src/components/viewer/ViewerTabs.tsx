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
            { id: 'general', label: 'GEN INFO' },
            { id: 'tech', label: 'TECH VIEW' },
            { id: 'performance', label: 'PERFORMANCE' },
            { id: 'aero', label: 'AERODYNAMICS' },
            { id: 'mass', label: 'MASS PROP' }
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
                            ? (isTactical ? 'text-[#03879E]' : 'text-blue-600')
                            : (isTactical ? 'text-[#464C53] hover:text-[#21133B]' : 'text-slate-400 hover:text-slate-600')}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${isTactical ? 'bg-[#03879E]' : 'bg-blue-600'} rounded-t-full shadow-[0_-2px_6px_rgba(3,135,158,0.3)]`} />
                    )}
                </button>
            ))}
        </div>
    );
};
