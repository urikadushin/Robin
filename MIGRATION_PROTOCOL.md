# Robin Applications Migration & Integration Protocol

This document outlines the protocols for splitting the current monolithic codebase into two separate, integratable applications: the **Explore App** (Threat Data Viewer) and the **Trajectory App** (3D Scene Playback).

Both applications are built with React (Vite) and use Tailwind CSS for styling.

---

## Part 1: The Explore App

**Purpose:** A comprehensive database viewer and editor for threat models, including 3D galleries, technical specifications, aerodynamics, and mass properties.

### 1. Key Dependencies

- `react`, `react-dom`
- `lucide-react` (Icons)
- `@react-three/fiber`, `@react-three/drei` (3D Gallery Models)
- Tailwind CSS

### 2. Frontend Files to Port

* **Core Components:**
  - `src/components/viewer/ThreatViewer.tsx` (Main Container)
  - `src/components/viewer/ViewerHeader.tsx`
  - `src/components/viewer/ViewerTabs.tsx`
  - `src/components/viewer/Gallery.tsx`
  - All tabs in `src/components/viewer/tabs/` (EXCEPT `TrajectorySceneTab.tsx`)
- **Data Management (Admin):**
  - `src/components/sections/*` (DataImportForm, ThreatList, GeneralInformationForm, etc.)
- **Utilities & Services:**
  - `src/services/api.ts` (API connection layer)
  - `src/utils/threatMapper.ts` (Transforms DB models to frontend interfaces)
- **Assets:**
  - `public/models/` (3D .glb files for the gallery)
  - `public/images/`

### 3. Backend & Database to Port

* **Database:** Connect to or export the `alumadb2` MySQL database (Requires the schema definition).
- **Node.js/Express Backend:**
  - `backend/src/models/` (All models: Threat, EngineeringModels, User)
  - `backend/src/routes/`
  - `backend/src/controllers/`
  - `backend/src/server.ts`

### 4. Integration Steps

1. Mount `<ThreatViewer />` in the target application's router.
2. Ensure the Express backend is running and the `VITE_API_URL` environment variable in the target frontend points to this backend.
3. Import the exact Tailwind configs (colors: `#144a54`, `#227d8d`, `#4ecdc4`, etc.) into the target app.

---

## Part 2: The Trajectory App

**Purpose:** A high-performance 2D/3D trajectory visualization engine using ArcGIS and Recharts for live telemetry playback.

### 1. Key Dependencies

- `@arcgis/core` (Esri Maps)
- `recharts` (Telemetry graphs)
- `lucide-react` (Icons)

### 2. Frontend Files to Port

* **Core Component:**
  - `src/components/viewer/tabs/TrajectorySceneTab.tsx` (This is the standalone app container).
- **Styling:**
  - `src/App.css` (Ensure the `@import "https://js.arcgis.com/4.31/esri/themes/dark/main.css";` is ported to the new host application).
- **Assets (CRITICAL for Offline/Local rendering):**
  - All map tile packages and 3D terrain data stored in `public/` (e.g., `public/tiles/`, `public/gltf/`).
  - `public/trajectories/` (Or connect to the endpoint serving these CSV/TXT files).

### 3. Backend Requirements

Unlike the Explore app, the Trajectory app primarily needs a read-only API to:

1. Fetch the list of threats (for the dropdown).
2. Fetch the `performance` database records (to retrieve `apogeeAlt`, `timeEndOfBurn`, etc.).
3. Serve static trajectory files via a `/api/data/Trajectories/` route.

*You can extract just the trajectory-serving endpoints from `backend/src/server.ts`.*

### 4. Integration Steps

1. **Host Container:** The `<TrajectorySceneTab />` uses absolute positioning and `fixed inset-0 z-[200]`. Modify these top-level wrapper classes if you need to embed it *inside* a specific div rather than taking over the whole screen.
2. **ArcGIS Integration:** The target platform MUST NOT have conflicting global spatial libraries (like Leaflet or Mapbox) operating on the exact same DOM node.
3. **Props Injection:** Currently, `TrajectorySceneTab` takes `threat` and `allThreats` props. In the new platform, you will either need to pass these from a parent state or modify the tab to fetch them on mount.

---

## Part 3: Shared Architecture Connectors

If the two apps are integrated into the *same* larger platform but as distinct modules:

1. **State Management:** Lift the `selectedThreat` state to a global context (e.g., Redux, Zustand, or React Context) so that selecting a missile in the "Explore App" automatically pre-populates the dropdown in the "Trajectory App".
2. **API Unification:** Combine their Node.js backend endpoints into a single microservice, or deploy the Trajectory static file serving (`/api/data/Trajectories/`) as a separate CDN/microservice to reduce load on the main DB API.
