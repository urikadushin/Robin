
import React, { useState } from 'react';
import { ThreatImage } from '../../../backend/src/models/EngineeringModels';

interface ImageCarouselProps {
    images: ThreatImage[];
    missileName: string;
    showNavigation?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, missileName, showNavigation = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const filteredImages = images?.filter(img =>
        img?.image_path?.toLowerCase().endsWith('.htm') === false &&
        img?.image_path?.toLowerCase().endsWith('.docx') === false
    ) || [];

    if (!filteredImages || filteredImages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl" >
                <div className="text-slate-300 flex flex-col items-center" >
                    <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No Images Available</span>
                </div>
            </div>
        );
    }

    const currentImage = filteredImages[currentIndex];

    // Helper to build image URL
    const getImageUrl = (img: ThreatImage) => {
        const baseUrl = 'http://localhost:3000/api/data/Images';
        const type = img.image_type;
        const filename = img.image_path || '';
        const mName = missileName.toUpperCase();

        let path = '';
        if (type === 'executiveSummary') {
            path = `ExecutiveSummary/${mName}/${filename}`;
        } else if (type === 'physicalData') {
            path = `PhysicalData/${filename}`;
        } else if (type === 'rcs') {
            path = `Rcs/${mName}/${filename}`;
        } else if (type === 'thermal') {
            path = `Thermal/${mName}/${filename}`;
        } else {
            path = filename;
        }

        return `${baseUrl}/${path}`;
    };

    const next = () => setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] rounded-[16px] border border-[#E5E5E5]" >
            {/* Header portion of the card */}
            <div className="px-8 pt-8 pb-4 flex flex-col items-center gap-1 text-center">
                <h3 className="text-[18px] font-bold text-[#111827] uppercase tracking-wide">
                    {missileName} Gallery
                </h3>
                <p className="text-[13px] font-normal text-[#6B7280]">Description regarding this specific picture if needed</p>
            </div>

            <div className="flex-1 flex items-center justify-center relative group px-4 pb-8" >
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={getImageUrl(currentImage)}
                        alt={currentImage.image_description || missileName}
                        className="max-w-full max-h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {/* Navigation Arrows - Minimal & Integrated */}
                    {showNavigation && filteredImages.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827] transition-all rounded-full shadow-sm z-10 opacity-0 group-hover:opacity-100"
                                title="Previous image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={next}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827] transition-all rounded-full shadow-sm z-10 opacity-0 group-hover:opacity-100"
                                title="Next image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}
                </div>

                {/* Pagination Dots */}
                {showNavigation && filteredImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {filteredImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                                    ? 'bg-[#3B82F6] w-5'
                                    : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                                    }`}
                                title={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

