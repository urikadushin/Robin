import React from 'react';
import { FullMissileData } from '../../../../../../backend/src/models/FullMissileModel';

interface GeneralTabProps {
    threat: FullMissileData;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ threat }) => {
    const { performance = [] } = threat;

    // Find max range from performance data
    const maxRng = performance.length > 0 ? Math.max(...performance.map(p => p.rng || 0)) : 0;

    return (
        <div className="grid grid-cols-12 gap-8 h-full">

            {/* Left Column: Capabilities & Text Details */}
            <div className="col-span-7 flex flex-col gap-8">

                {/* Capabilities Section */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Capabilities</h3>
                    <div className="bg-sky-50 rounded-xl p-6 border border-sky-100">
                        <ul className="space-y-2">
                            {threat.capability?.is_lofted && (
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    Capable of Lofted Trajectory
                                </li>
                            )}
                            {threat.capability?.is_decoy && (
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    Deploys Decoys
                                </li>
                            )}
                            {/* Fallback if no specific capabilities are true */}
                            {(!threat.capability || (!threat.capability.is_lofted && !threat.capability.is_decoy)) && (
                                <li className="text-slate-500 italic">No specific capabilities listed</li>
                            )}
                        </ul>
                    </div>
                </section>

                {/* Details / Description Section */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Details</h3>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                        <p>
                            {threat.missile.description || "No description available for this threat."}
                        </p>
                        {/* Placeholder for extended text if available */}
                        <p className="mt-4">
                            The {threat.missile.name} is a {threat.missile.type} system developed by {threat.missile.country || 'Unknown'}.
                            Detailed analysis of its performance indicates a maximum range of approximately {maxRng > 0 ? maxRng : 'Unknown'} km.
                            It utilizes a {threat.engine?.type || 'standard'} propulsion system.
                        </p>
                    </div>
                </section>
            </div>

            {/* Right Column: Gallery / Structure Image */}
            <div className="col-span-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">{threat.missile.name} Structure</h3>
                    <p className="text-sm text-slate-400 text-center mb-6">Description regarding this specific picture if needed</p>

                    <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl relative overflow-hidden group">
                        {/* Placeholder for actual image */}
                        <div className="text-slate-300 flex flex-col items-center">
                            <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>No Structure Image</span>
                        </div>

                        {/* Carousel Controls Placeholders */}
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            ←
                        </button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                        </button>
                    </div>

                    <div className="flex justify-center gap-2 mt-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};
