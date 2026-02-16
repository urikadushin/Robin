import React from 'react';
import { FullMissileData } from '../../../../backend/src/models/FullMissileModel';
import { ThreatImage, Performance } from '../../../../backend/src/models/EngineeringModels';
import { ImageCarousel } from '../ImageCarousel';
import { RcsPlotter } from '../RcsPlotter';
import { Activity, Shield, Target } from 'lucide-react';

interface RcsTabProps {
    threat: FullMissileData;
}

export const RcsTab: React.FC<RcsTabProps> = ({ threat }) => {
    const { images = [], performance = [] } = threat;

    // Filter images for RCS data
    const rcsImages = images.filter((img: ThreatImage) =>
        img.image_type === 'rcs' || img.image_type === 'physical'
    );

    const sortedPerformance = [...performance].sort((a: Performance, b: Performance) =>
        (a.perfIndex || 0) - (b.perfIndex || 0)
    );

    return (
        <div className="h-full flex flex-col gap-10 animate-in fade-in duration-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-[#144a54] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#227d8d] rounded-full shadow-[0_2px_6px_rgba(3,135,158,0.3)]"></span>
                    Radar Cross Section (RCS) Analytics
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Physical Analysis Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#227d8d]/10 rounded-lg">
                            <Shield className="w-5 h-5 text-[#227d8d]" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-bold text-[#144a54]">Static Physical Analysis</h4>
                            <p className="text-[10px] text-[#6b788e] font-bold uppercase tracking-tight">Geometry & Material Reflectivity</p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden shadow-sm p-4">
                        {rcsImages.length > 0 ? (
                            <ImageCarousel
                                images={rcsImages}
                                missileName={threat.missile.name}
                                showNavigation={true}
                            />
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-[6px] p-8 text-center">
                                <Activity className="w-12 h-12 opacity-20 mb-4" />
                                <p className="text-sm font-medium">No static RCS imagery available</p>
                                <p className="text-xs opacity-60 mt-1 uppercase font-bold tracking-widest">Awaiting sensor data</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-[8px]">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Detection Prob.</span>
                            <div className="text-xl font-bold text-[#144a54]">82.4%</div>
                        </div>
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-[8px]">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Aspect Angle</span>
                            <div className="text-xl font-bold text-[#144a54]">{threat.performance?.[0]?.hitAngle?.toFixed(1) || '0.0'}°</div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Signal Analysis Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#227d8d]/10 rounded-lg">
                            <Target className="w-5 h-5 text-[#227d8d]" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-bold text-[#144a54]">Dynamic Signal Analytics</h4>
                            <p className="text-[10px] text-[#6b788e] font-bold uppercase tracking-tight">Time-domain radar cross section</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[400px]">
                        {sortedPerformance.length > 0 ? (
                            <RcsPlotter performanceData={sortedPerformance} />
                        ) : (
                            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-[8px] bg-slate-50 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                Telemetry stream unavailable
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
