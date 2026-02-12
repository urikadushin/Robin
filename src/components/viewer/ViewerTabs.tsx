import React from 'react';

interface ViewerTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const ViewerTabs: React.FC<ViewerTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'general', label: 'General Information' },
        { id: 'structure', label: 'Structural View' },
        { id: 'tech', label: 'Tech View' },
        { id: 'rcs', label: 'RCS' },
        { id: 'performance', label: 'Performance' },
        { id: 'flight_logic', label: 'Flight Logic' },
        { id: 'heat', label: 'Heat Transfer' },
    ];

    return (
        <div className="flex items-center gap-2 pt-2">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
              relative px-6 py-3 text-sm font-medium transition-all duration-200
              ${isActive
                                ? 'text-sky-600 bg-[#f5f7fa]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }
              rounded-t-2xl
              before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] 
              ${isActive ? 'before:bg-sky-500' : 'before:bg-transparent'}
            `}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
