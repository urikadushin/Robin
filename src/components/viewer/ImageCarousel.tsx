
import React, { useState } from 'react';
import { ThreatImage } from '../../../../backend/src/models/EngineeringModels';

interface ImageCarouselProps {
    images: ThreatImage[];
    missileName: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, missileName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const filteredImages = images.filter(img =>
        !img.image_path.toLowerCase().endsWith('.htm') &&
        !img.image_path.toLowerCase().endsWith('.docx')
    );

    if (!filteredImages || filteredImages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl" >
                <div className="text-slate-300 flex flex-col items-center" >
                    <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    < span > No Images Available </span>
                </div>
            </div>
        );
    }

    const currentImage = filteredImages[currentIndex];

    // Helper to build image URL
    const getImageUrl = (img: ThreatImage) => {
        const baseUrl = 'http://localhost:3000/api/data/Images';
        const type = img.image_type;
        const filename = img.image_path;
        const mName = missileName.toUpperCase();

        let path = '';
        if (type === 'executiveSummary') {
            path = `ExecutiveSummary/${mName}/${filename}`;
        } else if (type === 'physicalData') {
            path = `PhysicalData/${filename}`; // Physical data seems to be flat in some cases
            // But let's try nested if it's there
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
        <div className="flex-1 flex flex-col h-full" >
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl relative overflow-hidden group" >
                <img
                    src={getImageUrl(currentImage)}
                    alt={currentImage.image_description || missileName}
                    className="max-w-full max-h-full object-contain p-4 transition-all duration-300"
                    onError={(e) => {
                        // Fallback if URL is wrong (e.g. try without missile name folder)
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('fallback')) {
                            const newUrl = `http://localhost:3000/api/data/Images/${currentImage.image_type === 'physicalData' ? 'PhysicalData' : 'ExecutiveSummary'}/${currentImage.image_path}`;
                            target.src = newUrl + '?fallback=1';
                        }
                    }}
                />

                {
                    filteredImages.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 text-slate-600 font-bold"
                            >
                                ←
                            </button>
                            < button
                                onClick={next}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 text-slate-600 font-bold"
                            >
                                →
                            </button>
                        </>
                    )
                }

                {
                    currentImage.image_description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs text-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" >
                            {currentImage.image_description}
                        </div>
                    )
                }
            </div>

            < div className="flex justify-center gap-2 mt-6" >
                {
                    filteredImages.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-sky-500 w-4' : 'bg-slate-200'
                                }`}
                            title={`Go to image ${i + 1}`}
                        />
                    ))}
            </div>
        </div>
    );
};
