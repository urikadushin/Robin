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
        <div className="flex items-center gap-10 border-b border-[#E2E8F0] mb-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        py-4 text-[14px] tracking-tight relative transition-all duration-200
                        ${activeTab === tab.id
                            ? 'text-[#03879E] font-bold'
                            : 'text-[#464C53] font-semibold hover:text-[#03879E]'}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#03879E]" />
                    )}
                </button>
            ))}
        </div>
    );
};
