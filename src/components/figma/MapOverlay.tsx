import React from "react";

/**
 * Props for MapOverlay component.
 * @param mode - "light" or "dark"
 * @param opacity - Opacity of the overlay (0 to 1, default: 0.4)
 * @param zIndex - z-index for overlay stacking (default: 2)
 */
interface MapOverlayProps {
  mode: "light" | "dark";
  opacity?: number;
  zIndex?: number;
}

/**
 * MapOverlay - A semi-transparent overlay for map components.
 * - In light mode: uses a white overlay.
 * - In dark mode: uses a black overlay.
 * - Does not block pointer events.
 */
const MapOverlay: React.FC<MapOverlayProps> = ({
  mode,
  opacity = 0.4,
  zIndex = 2,
}) => {
  const background =
    mode === "dark"
      ? `rgba(0,0,0,${opacity})`
      : `rgba(255,255,255,${opacity * 0.7})`; // Slightly lighter for light mode

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background,
        pointerEvents: "none",
        zIndex,
        transition: "background 0.3s",
      }}
      aria-hidden="true"
    />
  );
};

export default MapOverlay;
