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
  opacity = 0.2,
  zIndex = 2,
}) => {
  const background =
    mode === "dark"
      ? `rgba(20,33,61,${opacity})` // #14213d with opacity for dark blue overlay
      : `rgba(255,255,255,${opacity * 0.7})`; // Slightly lighter for light mode

  // Overlay disabled as per user request
  return null;
};

export default MapOverlay;
