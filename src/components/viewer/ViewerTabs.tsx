import React from 'react';

interface ViewerTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    variant?: 'default' | 'tactical';
}

export const ViewerTabs: React.FC<ViewerTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'general', label: 'General Information' },
        { id: 'structural', label: 'Structural View' },
        { id: 'tech', label: 'Tech View' },
        { id: 'rcs', label: 'RCS' },
        { id: 'performance', label: 'Performance' },
        { id: 'flight', label: 'Flight Logic' },
        { id: 'heat', label: 'Heat Transfer' },
    ];

    return (
        <div className="flex items-center gap-10 border-b border-[#E2E8F0] mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        py-4 text-[13px] tracking-wide relative transition-all duration-200
                        ${activeTab === tab.id
                            ? 'text-[#144a54] font-bold'
                            : 'text-[#64748B] font-medium hover:text-[#144a54]'}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#227d8d] rounded-t-sm shadow-[0_-2px_6px_rgba(34,125,141,0.2)]" />
                    )}
                </button>
            ))}
        </div>
    );
};
