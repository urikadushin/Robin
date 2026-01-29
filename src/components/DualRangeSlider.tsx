import React, { useCallback, useEffect, useRef } from 'react';

interface DualRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    className?: string;
    step?: number;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min,
    max,
    value,
    onChange,
    className = '',
    step = 1
}) => {
    const [minVal, maxVal] = value;
    const minValRef = useRef(minVal);
    const maxValRef = useRef(maxVal);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        minValRef.current = minVal;
        maxValRef.current = maxVal;
    }, [minVal, maxVal]);

    return (
        <div className={`dual-slider-container ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    onChange([value, maxVal]);
                }}
                className="dual-slider-input thumb-z-3"
                style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    onChange([minVal, value]);
                }}
                className="dual-slider-input thumb-z-4"
                style={{ zIndex: 4 }}
            />

            <div className="dual-slider-track-bg" />
            <div ref={range} className="dual-slider-track-fill" />
        </div>
    );
};

export default DualRangeSlider;
