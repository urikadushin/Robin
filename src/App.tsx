import React, { useState, useEffect } from "react";
import './App.css';
import WorldMap from './components/figma/WorldMap';
import DualRangeSlider from './components/DualRangeSlider';
import { ThreatEditor } from './components/ThreatEditor';
import { api } from './services/api';
import { mapFrontendToBackend, mapBackendToFrontend } from './utils/threatMapper';

export interface ThreatData {
  id: string;
  name: string;
  color: string;
  missile: string;
  // range: string; // Deprecated
  minRange?: number;
  maxRange?: number;
  operationalRange?: number;
  range?: string; // Display
  speed: string;
  weight: string;
  countries: string;
  manufacturer?: string;
  rvDesignName?: string;
  warhead?: string;
  status?: string;
  year?: number;
  description?: string;
  // Tech View
  length?: string;
  diameter?: string;
  launchWeight?: string;
  payloadWeight?: string;
  propulsion?: string;
  guidance?: string;
  accuracy?: string;
  // Structural
  stages?: string;
  materials?: string;
  // Performance
  maxAltitude?: string;
  burnTime?: string;
  thrust?: string;
  // Flight Logic
  flightProfile?: string;
  maneuverability?: string;
  // Heat Transfer
  nosetipMaterial?: string;
  maxTemp?: string;
  // Countermeasures
  decoys?: string;
  jamming?: string;
  // Operational
  deployment?: string;
  operators?: string;

  // Advanced Engineering
  btParams?: Record<string, string | number>;
  rvParams?: Record<string, string | number>;
  aerodynamics?: any; // JSON structure for aerodynamic tables
  massProperties?: any; // JSON structure for mass tensors
  stageData?: any; // JSON structure for Stages, Guidance, and Control
}

const initialThreats: ThreatData[] = [
  {
    id: 'irbm1',
    name: 'Emad MRBM',
    color: '#ff6b6b',
    missile: 'Ballistic',
    range: '1700 km',
    minRange: 500,
    maxRange: 1700,
    operationalRange: 1700,
    speed: '2400 m/s',
    weight: '17500 kg',
    countries: 'Iran',
    manufacturer: 'Iran',
    warhead: '1000 kg',
    status: 'Operational',
    year: 2015
  },
  {
    id: 'irbm2',
    name: 'Sejjil-2',
    color: '#ff6b6b',
    missile: 'Ballistic',
    range: '2000 km',
    minRange: 700,
    maxRange: 2000,
    operationalRange: 2000,
    speed: '2600 m/s',
    weight: '21500 kg',
    countries: 'Iran',
    manufacturer: 'Iran',
    warhead: '750 kg',
    status: 'Operational',
    year: 2014
  },
  {
    id: 'yembm1',
    name: 'Qaher-2M',
    color: '#4ecdc4',
    missile: 'Ballistic',
    range: '1800 km',
    minRange: 300,
    maxRange: 1800,
    operationalRange: 1800,
    speed: '2300 m/s',
    weight: '8500 kg',
    countries: 'Yemen (Houthi)',
    manufacturer: 'Yemen (Houthi)',
    warhead: '500 kg',
    status: 'Operational',
    year: 2019
  },
  {
    id: 'lebbm1',
    name: 'Fateh-110',
    color: '#45b7d1',
    missile: 'Ballistic',
    range: '300 km',
    minRange: 50,
    maxRange: 300,
    operationalRange: 300,
    speed: '3500 m/s',
    weight: '3500 kg',
    countries: 'Lebanon (Hezbollah)',
    manufacturer: 'Lebanon (Hezbollah)',
    warhead: '500 kg',
    status: 'Operational',
    year: 2010
  },
  {
    id: 'ircm1',
    name: 'Soumar',
    color: '#ff9f43',
    missile: 'Cruise',
    range: '2500 km',
    speed: '900 km/h',
    weight: '1200 kg',
    countries: 'Iran',
    warhead: '450 kg',
    status: 'Operational',
    year: 2014
  },
  {
    id: 'yemcm1',
    name: 'Quds-1',
    color: '#26de81',
    missile: 'Cruise',
    range: '800 km',
    speed: '864 km/h',
    weight: '300 kg',
    countries: 'Yemen (Houthi)',
    warhead: '45 kg',
    status: 'Operational',
    year: 2019
  },
  {
    id: 'iruav1',
    name: 'Shahed-136',
    color: '#a55eea',
    missile: 'Kamikaze Drone',
    range: '2500 km',
    speed: '185 km/h',
    weight: '200 kg',
    countries: 'Iran',
    warhead: '40 kg',
    status: 'Operational',
    year: 2021
  },
  {
    id: 'lebuav1',
    name: 'Mirsad-1',
    color: '#8854d0',
    missile: 'Surveillance Drone',
    range: '150 km',
    speed: '120 km/h',
    weight: '45 kg',
    countries: 'Lebanon (Hezbollah)',
    warhead: 'N/A',
    status: 'Operational',
    year: 2020
  }
];

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });

  // Filter state
  const [range, setRange] = useState<[number, number]>([0, 10000]);
  const [velocity, setVelocity] = useState<[number, number]>([0, 4000]);
  const [weight, setWeight] = useState<[number, number]>([0, 25000]);

  // Threat data & Editor state
  const [threats, setThreats] = useState<ThreatData[]>([]);

  const [editingThreat, setEditingThreat] = useState<ThreatData | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Helper to extract number from strings
  const parseNum = (val: string | number | undefined) => {
    if (typeof val === 'number') return val;
    if (!val || val === 'Unknown') return 0;
    const matches = val.toString().match(/(\d+(\.\d+)?)/);
    return matches ? parseFloat(matches[0]) : 0;
  };

  // Dynamic boundaries based on data
  const bounds = React.useMemo(() => {
    if (threats.length === 0) return {
      range: [0, 10000] as [number, number],
      velocity: [0, 4000] as [number, number],
      weight: [0, 25000] as [number, number]
    };

    const ranges = threats.map(t => t.maxRange ?? parseNum(t.range));
    const velocities = threats.map(t => parseNum(t.speed));
    const weights = threats.map(t => parseNum(t.weight));

    return {
      range: [0, Math.ceil(Math.max(...ranges, 1000))] as [number, number],
      velocity: [0, Math.ceil(Math.max(...velocities, 1000))] as [number, number],
      weight: [0, Math.ceil(Math.max(...weights, 1000))] as [number, number]
    };
  }, [threats]);

  // Reset filters when bounds change significantly or on load
  useEffect(() => {
    setRange([bounds.range[0], bounds.range[1]]);
    setVelocity([bounds.velocity[0], bounds.velocity[1]]);
    setWeight([bounds.weight[0], bounds.weight[1]]);
  }, [bounds]);

  React.useEffect(() => {
    const loadThreats = async () => {
      try {
        const missiles = await api.getMissiles();
        console.log("Raw missiles from API:", missiles);

        const detailedThreats: ThreatData[] = [];
        for (const m of missiles) {
          try {
            const ws = await api.getWeightAndSize(m.id);
            // Assuming getAerodynamics exists even if empty
            let aero: any[] = [];
            try {
              aero = await api.getAerodynamics(m.id);
            } catch (e) {
              console.warn(`Aerodynamics missing for missile ${m.id}`);
            }
            detailedThreats.push(mapBackendToFrontend(m, ws, aero));
          } catch (mError) {
            console.error(`Error loading details for missile ${m.id}:`, mError);
            // Push partial data if possible or skip
            detailedThreats.push(mapBackendToFrontend(m, [], []));
          }
        }

        console.log("Detailed Threats Loaded:", detailedThreats);
        setThreats(detailedThreats);
      } catch (error) {
        console.error("Failed to load threats from API", error);
      }
    };
    loadThreats();
  }, []);

  const handleEditThreat = (threat: ThreatData) => {
    setEditingThreat(threat);
    setIsEditorOpen(true);
  };

  const handleAddThreat = () => {
    setEditingThreat(undefined);
    setIsEditorOpen(true);
  };

  const handleSaveThreat = async (updatedThreat: ThreatData) => {
    try {
      if (editingThreat) {
        // Update existing
        const { missile, weightAndSize } = mapFrontendToBackend(updatedThreat);

        // Update Missile
        // Ensure ID is passed and is a number
        const id = parseInt(editingThreat.id);
        if (isNaN(id)) throw new Error("Invalid ID");

        await api.updateMissile(id, { ...missile, id });

        // Update WeightAndSize
        try {
          await api.deleteWeightAndSize(editingThreat.id);
          for (const ws of weightAndSize) {
            await api.createWeightAndSize(ws);
          }
        } catch (wsError) {
          console.error("Failed to update weightandsize", wsError);
        }

        setThreats(threats.map(t => t.id === editingThreat.id ? updatedThreat : t));
      } else {
        // Create new
        const { missile, weightAndSize } = mapFrontendToBackend({ ...updatedThreat, id: '0' });
        const newMissile = await api.createMissile(missile);
        const newId = newMissile.id.toString();

        for (const ws of weightAndSize) {
          await api.createWeightAndSize({ ...ws, missile_id: newMissile.id });
        }

        setThreats([...threats, { ...updatedThreat, id: newId }]);
      }
      setIsEditorOpen(false);
      setEditingThreat(undefined);
    } catch (error) {
      console.error("Failed to save threat", error);
      alert("Failed to save threat to backend");
    }
  };

  return (
    <div className={darkMode ? 'dark-mode' : ''} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Map as interactive background */}
      <WorldMap className="map-background" />
      {/* UI overlays */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10 }}>
        {/* TopBar */}
        <div style={{ pointerEvents: 'auto', position: 'absolute', top: 0, left: 0, right: 0 }}>
          <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
        {/* Sidebar */}
        <div style={{ pointerEvents: 'auto', position: 'absolute', top: 56, left: 0, bottom: 0 }}>
          <Sidebar />
        </div>
        {/* FiltersBar */}
        <div style={{ pointerEvents: 'auto', position: 'absolute', top: 56, left: 58, right: 0 }}>
          <FiltersBar
            range={range}
            setRange={setRange}
            velocity={velocity}
            setVelocity={setVelocity}
            weight={weight}
            setWeight={setWeight}
            bounds={bounds}
          />
        </div>
        {/* ResultsPanel (positioned higher on the screen) */}
        <div style={{
          pointerEvents: 'auto',
          position: 'absolute',
          top: 180,
          right: 32,
          width: 'calc(100% - 32px)',
          maxWidth: '700px'
        }}>
          <ResultsPanel
            threats={threats}
            rangeFilter={range}
            velocityFilter={velocity}
            weightFilter={weight}
            onEdit={handleEditThreat}
            onAdd={handleAddThreat}
          />
        </div>
      </div>

      {/* Threat Editor Modal */}
      {isEditorOpen && (
        <ThreatEditor
          threat={editingThreat}
          onSave={handleSaveThreat}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

function TopBar({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  return (
    <header className="top-bar">
      <div className="top-bar__title">Explore</div>
      <div className="top-bar__spacer" />
      <button
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          marginRight: 18
        }}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark mode"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? '🌙' : '☀️'}
      </button>
      <div className="top-bar__icons">
        <span className="icon notification" title="Notifications">🔔</span>
        <span className="icon avatar" title="Profile">👤</span>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__icon" title="Explore">🧭</div>
      <div className="sidebar__icon" title="Settings">⚙️</div>
      <div className="sidebar__icon" title="Help">❓</div>
    </nav>
  );
}

interface FiltersBarProps {
  range: [number, number];
  setRange: (value: [number, number]) => void;
  velocity: [number, number];
  setVelocity: (value: [number, number]) => void;
  weight: [number, number];
  setWeight: (value: [number, number]) => void;
  bounds: {
    range: [number, number];
    velocity: [number, number];
    weight: [number, number];
  };
}

function FiltersBar({ range, setRange, velocity, setVelocity, weight, setWeight, bounds }: FiltersBarProps) {
  const [viewBy, setViewBy] = useState<'threats' | 'countries'>('threats');

  return (
    <div className="filters-bar">
      <div className="filters-bar__row">
        <div className="filters-bar__viewby">
          <span>View By</span>
          <button
            className={`filters-bar__btn${viewBy === 'threats' ? ' filters-bar__btn--active' : ''}`}
            onClick={() => setViewBy('threats')}
          >
            Threats
          </button>
          <button
            className={`filters-bar__btn${viewBy === 'countries' ? ' filters-bar__btn--active' : ''}`}
            onClick={() => setViewBy('countries')}
          >
            Countries
          </button>
        </div>
        <button
          className="filters-bar__reset"
          onClick={() => {
            setRange([bounds.range[0], bounds.range[1]]);
            setVelocity([bounds.velocity[0], bounds.velocity[1]]);
            setWeight([bounds.weight[0], bounds.weight[1]]);
          }}
        >
          Reset
        </button>
      </div>
      <div className="filters-bar__filters">
        <div className="filters-bar__threat-types">
          <button className="filters-bar__threat-btn filters-bar__threat-btn--active">
            <span role="img" aria-label="Missile" style={{ fontSize: '18px', fontWeight: 'bold' }}>▲</span> Missile
          </button>
          <button className="filters-bar__threat-btn">
            <span role="img" aria-label="UAV" style={{ fontSize: '18px' }}>✈</span> UAV
          </button>
          <button className="filters-bar__threat-btn">
            <span role="img" aria-label="Cruise" style={{ fontSize: '18px', fontWeight: 'bold' }}>➤</span> Cruise
          </button>
        </div>
        <div className="filter-group">
          <div className="filter-header">
            <span>Range (km):</span>
            <span>{range[0]} - {range[1]}</span>
          </div>
          <DualRangeSlider
            min={bounds.range[0]}
            max={bounds.range[1]}
            step={Math.ceil(bounds.range[1] / 100)}
            value={range}
            onChange={setRange}
          />
        </div>

        <div className="filter-group">
          <div className="filter-header">
            <span>Velocity (m/s):</span>
            <span>{velocity[0]} - {velocity[1]}</span>
          </div>
          <DualRangeSlider
            min={bounds.velocity[0]}
            max={bounds.velocity[1]}
            step={Math.ceil(bounds.velocity[1] / 100)}
            value={velocity}
            onChange={setVelocity}
          />
        </div>

        <div className="filter-group">
          <div className="filter-header">
            <span>Warhead Weight (kg):</span>
            <span>{weight[0]} - {weight[1]}</span>
          </div>
          <DualRangeSlider
            min={bounds.weight[0]}
            max={bounds.weight[1]}
            step={Math.ceil(bounds.weight[1] / 100)}
            value={weight}
            onChange={setWeight}
          />
        </div>
      </div>
    </div>
  );
}

interface ResultsPanelProps {
  threats: ThreatData[];
  rangeFilter: [number, number];
  velocityFilter: [number, number];
  weightFilter: [number, number];
  onEdit: (threat: ThreatData) => void;
  onAdd: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  threats,
  rangeFilter,
  velocityFilter,
  weightFilter,
  onEdit,
  onAdd
}) => {
  const [hoveredThreatId, setHoveredThreatId] = useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: '450px',
    height: 'calc(100vh - 200px)',
    padding: '12px 0 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    scrollBehavior: 'smooth',
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: '24px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    height: '42px',
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: 500,
    transition: 'all 0.2s ease'
  };

  const buttonHoverStyle = {
    opacity: '0.9',
    transform: 'translateY(-1px)'
  };

  const headerContentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'transparent',
    padding: '12px 0',
    pointerEvents: 'auto',
    marginLeft: 'auto',
    marginRight: '24px'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 0 4px',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    margin: '0',
    pointerEvents: 'none',
    width: '100%'
  };

  const getThreatItemStyle = (threatId: string, isHovered: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 12px',
    backgroundColor: 'var(--panel-bg)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    border: '1px solid var(--border)',
    transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'none',
    boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow)',
    margin: `0 0 12px 0`,
    width: '100%',
    boxSizing: 'border-box',
    height: `auto`,
    minHeight: '90px',
    zIndex: 1,
    position: 'relative'
  });

  const colorIndicatorStyle = (color: string): React.CSSProperties => ({
    width: '4px',
    height: '28px',
    backgroundColor: color,
    borderRadius: '2px',
    flexShrink: 0,
    marginRight: '6px'
  });

  const metaItemStyle: React.CSSProperties = {
    fontFamily: 'Inter',
    fontSize: '12px',
    color: 'var(--text)',
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    opacity: 0.9,
    margin: '0 1px',
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px'
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '10px',
    backgroundColor: 'var(--text)',
    opacity: 0.2,
    margin: '0 2px',
    flexShrink: 0
  };

  return (
    <div className="results-panel" style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            color: 'var(--text)',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            Results ({threats.length})
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={buttonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '';
                e.currentTarget.style.transform = '';
              }}
              onClick={onAdd}
            >
              + Add Threat
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '';
                e.currentTarget.style.transform = '';
              }}
            >
              Comparison
            </button>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        minHeight: '200px',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        {threats.filter((threat) => {
          // Helper to extract number from strings like "1000 km" or "Unknown"
          const parseNum = (val: string | number | undefined) => {
            if (typeof val === 'number') return val;
            if (!val || val === 'Unknown') return 0;
            const matches = val.toString().match(/(\d+(\.\d+)?)/);
            return matches ? parseFloat(matches[0]) : 0;
          };

          const threatRange = threat.maxRange ?? parseNum(threat.range);
          const threatSpeed = parseNum(threat.speed);
          const threatWeight = parseNum(threat.weight);

          // Filter based on slider values
          return (
            threatRange >= rangeFilter[0] && threatRange <= rangeFilter[1] &&
            threatSpeed >= velocityFilter[0] && threatSpeed <= velocityFilter[1] &&
            threatWeight >= weightFilter[0] && threatWeight <= weightFilter[1]
          );
        }).map((threat) => {
          const isHovered = hoveredThreatId === threat.id;
          return (
            <div
              key={threat.id}
              style={getThreatItemStyle(threat.id, isHovered)}
              onMouseEnter={() => setHoveredThreatId(threat.id)}
              onMouseLeave={() => setHoveredThreatId(null)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '8px' }}>
                  <div style={colorIndicatorStyle(threat.color)} />
                  <div style={{
                    fontFamily: 'Inter',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}>
                    {threat.name}
                  </div>
                  {/* Edit Button - Visible on Hover */}
                  <button
                    style={{
                      opacity: isHovered ? 1 : 0,
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(threat);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                  overflow: 'hidden',
                  paddingLeft: '24px',
                  width: '100%',
                  gap: '2px'
                }}>
                  {[threat.missile, threat.range, threat.speed, threat.weight, threat.countries].map((item, i, arr) => (
                    <React.Fragment key={i}>
                      <span style={{
                        ...metaItemStyle,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                        display: 'inline-block'
                      }}>{item}</span>
                      {i < arr.length - 1 && <div style={dividerStyle} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
