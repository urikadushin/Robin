import React, { useState } from "react";
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
        {/* ResultsPanel (now directly below FiltersBar) */}
        <div style={{ pointerEvents: 'auto', position: 'absolute', top: 220, right: 32 }}>
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

  return (
    <div className="filters-bar">
      <div className="filters-bar__row">
        <div className="filters-bar__viewby">
          <span>View By</span>
          <button className="filters-bar__btn filters-bar__btn--active">Threats</button>
          <button className="filters-bar__btn">Countries</button>
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
              onChange={e => setMinRange(Number(e.target.value))}
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
              onChange={e => setMinVelocity(Number(e.target.value))}
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
              onChange={e => setMinWeight(Number(e.target.value))}
            />
          </label>
          <span>{minWeight}</span>
        </div>
      </div>
    </div>
  );
}


function ResultsPanel() {
  return (
    <aside className="results-panel">
      <div className="results-panel__header">
        <span>Results (4)</span>
        <button className="results-panel__compare">Comparison</button>
      </div>
      <div className="results-panel__list">
        <div className="results-panel__item">
          <div className="results-panel__item-title">Shibbolet</div>
          <div className="results-panel__item-meta">Missile | 20-3000 km | 150 m/s | 342 kg | 2 Countries</div>
        </div>
        <div className="results-panel__item">
          <div className="results-panel__item-title">Lev</div>
          <div className="results-panel__item-meta">Missile | 20-3000 km | 150 m/s | 342 kg | 2 Countries</div>
        </div>
        <div className="results-panel__item">
          <div className="results-panel__item-title">Rea</div>
          <div className="results-panel__item-meta">Missile | 20-3000 km | 150 m/s | 342 kg | 1 Country</div>
        </div>
        <div className="results-panel__item">
          <div className="results-panel__item-title">Threat Name</div>
          <div className="results-panel__item-meta">Missile | 20-3000 km | 150 m/s | 342 kg | 1 Country</div>
        </div>
      </div>
    </aside>
  );
}

