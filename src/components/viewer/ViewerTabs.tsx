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
        { id: 'motor', label: 'Motor Properties' },
        { id: 'rcs', label: 'RCS' },
        { id: 'aero', label: 'Aero' },
        { id: 'performance', label: 'Performance' },
        { id: 'heat', label: 'Heat Signature' },
        { id: 'mass', label: 'Mass Properties' },
    ];

    return (
        <div className="flex items-end bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 pt-4 -mx-10" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        px-8 py-3 text-[14px] tracking-tight transition-all duration-200 whitespace-nowrap relative
                        ${activeTab === tab.id
                            ? 'bg-white text-[#03879E] font-bold border-t border-x border-[#E2E8F0] rounded-t-[10px] -mb-[1px] z-10'
                            : 'text-[#464C53] font-semibold hover:text-[#03879E]'}
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
