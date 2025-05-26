import React, { useState, useRef, useCallback } from "react";
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import './App.css';
import WorldMap from './components/figma/WorldMap';

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

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
          <FiltersBar />
        </div>
        {/* ResultsPanel (positioned higher on the screen) */}
        <div style={{ 
          pointerEvents: 'auto', 
          position: 'absolute', 
          top: 180, 
          right: 32,
          width: 'calc(100% - 32px)', // Take full width minus sidebar and right margin
          maxWidth: '700px' // Increased by 100px from previous 900px
        }}>
          <ResultsPanel />
        </div>
      </div>
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

function FiltersBar() {
  const [minRange, setMinRange] = useState(4000);
  const [minVelocity, setMinVelocity] = useState(30);
  const [minWeight, setMinWeight] = useState(150);
  const [viewBy, setViewBy] = useState<'threats' | 'countries'>('threats');

  // Utility to update --progress for a slider
  function updateSliderProgress(e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) {
    const input = e.target as HTMLInputElement;
    const min = Number(input.min);
    const max = Number(input.max);
    const val = Number(input.value);
    const percent = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--progress', `${percent}%`);
  }

  // Set initial progress on mount
  React.useEffect(() => {
    const sliders = document.querySelectorAll<HTMLInputElement>('.filters-bar input[type="range"]');
    sliders.forEach(input => {
      const min = Number(input.min);
      const max = Number(input.max);
      const val = Number(input.value);
      const percent = ((val - min) / (max - min)) * 100;
      input.style.setProperty('--progress', `${percent}%`);
    });
  }, []);

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
        <button className="filters-bar__reset">Reset</button>
      </div>
      <div className="filters-bar__filters">
        <div className="filters-bar__threat-types">
          <button className="filters-bar__threat-btn filters-bar__threat-btn--active">
            <span role="img" aria-label="Missile">🚀</span> Missile
          </button>
          <button className="filters-bar__threat-btn">
            <span role="img" aria-label="UAV">🛩️</span> UAV
          </button>
          <button className="filters-bar__threat-btn">
            <span role="img" aria-label="Cruise">🛸</span> Cruise
          </button>
        </div>
        <div className="filters-bar__slider">
          <label>
            Min Range (km):
            <input
              type="range"
              min="0"
              max="10000"
              value={minRange}
              onChange={e => {
                setMinRange(Number(e.target.value));
                updateSliderProgress(e);
              }}
              onInput={updateSliderProgress}
            />
          </label>
          <span>{minRange}</span>
        </div>
        <div className="filters-bar__slider">
          <label>
            Min Velocity (m/s):
            <input
              type="range"
              min="0"
              max="450"
              value={minVelocity}
              onChange={e => {
                setMinVelocity(Number(e.target.value));
                updateSliderProgress(e);
              }}
              onInput={updateSliderProgress}
            />
          </label>
          <span>{minVelocity}</span>
        </div>
        <div className="filters-bar__slider">
          <label>
            Min Warhead Weight (kg):
            <input
              type="range"
              min="0"
              max="500"
              value={minWeight}
              onChange={e => {
                setMinWeight(Number(e.target.value));
                updateSliderProgress(e);
              }}
              onInput={updateSliderProgress}
            />
          </label>
          <span>{minWeight}</span>
        </div>
      </div>
    </div>
  );
}


interface ThreatData {
  name: string;
  color: string;
  missile: string;
  range: string;
  speed: string;
  weight: string;
  countries: string;
  id: string;
  warhead?: string;
  status?: string;
  year?: number;
}

const ResultsPanel: React.FC = () => {
  const [hoveredThreatId, setHoveredThreatId] = useState<string | null>(null);
  
  const threats: ThreatData[] = [
    {
      id: 'irbm1',
      name: 'Emad MRBM',
      color: '#ff6b6b',
      missile: 'Ballistic',
      range: '1700 km',
      speed: '2400 m/s',
      weight: '17500 kg',
      countries: 'Iran',
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
      speed: '2600 m/s',
      weight: '21500 kg',
      countries: 'Iran',
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
      speed: '2300 m/s',
      weight: '8500 kg',
      countries: 'Yemen (Houthi)',
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
      speed: '3500 m/s',
      weight: '3500 kg',
      countries: 'Lebanon (Hezbollah)',
      warhead: '650 kg',
      status: 'Operational',
      year: 2012
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

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: '525px', // 25% smaller than 700px
    height: 'calc(100vh - 200px)',
    padding: '12px 0 20px', // Slightly reduced padding
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    scrollBehavior: 'smooth',
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: '24px' // Slightly reduced right margin
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
    maxWidth: '525px',
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
    padding: cardPadding,
    backgroundColor: 'var(--panel-bg)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    border: '1px solid var(--border)',
    transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'none',
    boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow)',
    margin: `0 0 ${itemMargin}px 0`,
    width: '100%',
    boxSizing: 'border-box',
    height: `${itemHeight}px`,
    zIndex: 1
  });

  const colorIndicatorStyle = (color: string): React.CSSProperties => ({
    width: '4px', // Even thinner indicator
    height: '28px', // Slightly shorter
    backgroundColor: color,
    borderRadius: '2px',
    flexShrink: 0,
    marginRight: '6px' // Further reduced margin
  });

  const metaItemStyle: React.CSSProperties = {
    fontFamily: 'Inter',
    fontSize: '10px', // Even smaller font
    color: 'var(--text)',
    lineHeight: '14px',
    whiteSpace: 'nowrap',
    opacity: 0.9,
    margin: '0 1px', // Reduced margin between items
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px' // Prevent any single item from taking too much space
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '10px', // Even shorter divider
    backgroundColor: 'var(--text)',
    opacity: 0.2, // More subtle
    margin: '0 2px', // Further reduced margin
    flexShrink: 0
  };

  // Card dimensions and spacing
  const itemHeight = 90; // More compact height
  const itemMargin = 12; // Increased margin between cards for better separation
  const cardPadding = '10px 12px'; // Even more compact padding
  
  // Create a single row renderer with proper TypeScript types
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const threat = threats[index];
    const isHovered = hoveredThreatId === threat.id;
    
    return (
      <div 
        style={{
          ...style,
          padding: '0 8px',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={getThreatItemStyle(threat.id, isHovered)}
          onMouseEnter={() => setHoveredThreatId(threat.id)}
          onMouseLeave={() => setHoveredThreatId(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '8px' }}>
              <div style={colorIndicatorStyle(threat.color)} />
              <div style={{ 
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1
              }}>
                {threat.name}
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'nowrap', // Prevent wrapping to new line
              overflow: 'hidden',
              paddingLeft: '24px', // Reduced left padding
              width: '100%',
              gap: '2px' // Minimal gap between items
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
      </div>
    );
  }, [threats, hoveredThreatId]);

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
          <button 
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '';
              e.currentTarget.style.transform = '';
            }}
          >
            Comparison
          </button>
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        minHeight: '200px', 
        width: '100%', 
        overflow: 'hidden',
        paddingRight: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <AutoSizer>
            {({ height, width: autoSizerWidth }: { height: number; width: number }) => {
              const width = Math.min(autoSizerWidth, 700 - 32); // Account for right padding
              // Calculate how many items can fit in the visible area
              const visibleItemsCount = Math.floor(height / (itemHeight + itemMargin));
              // Adjust the height to only show full items
              const adjustedHeight = visibleItemsCount * (itemHeight + itemMargin);
              
              return (
                <List
                  height={adjustedHeight}
                  itemCount={threats.length}
                  itemSize={itemHeight + itemMargin}
                  width={width}
                  style={{ 
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    padding: '0 4px 0 0' // Adjust scrollbar padding
                  }}
                  overscanCount={2} // Render 2 items outside the visible area for smoother scrolling
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
};
