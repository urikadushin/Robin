import React, { useState } from 'react';

interface FiltersSectionProps {
  onFilterChange?: (filters: {
    threatType: string;
    range: number;
    velocity: number;
    warheadWeight: number;
  }) => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ onFilterChange }) => {
  const [threatType, setThreatType] = useState('missile');
  const [range, setRange] = useState(4000);
  const [velocity, setVelocity] = useState(30);
  const [warheadWeight, setWarheadWeight] = useState(150);

  const handleReset = () => {
    setThreatType('missile');
    setRange(4000);
    setVelocity(30);
    setWarheadWeight(150);
    onFilterChange?.({
      threatType: 'missile',
      range: 4000,
      velocity: 30,
      warheadWeight: 150
    });
  };

  const handleThreatTypeClick = (type: string) => {
    setThreatType(type);
    onFilterChange?.({
      threatType: type,
      range,
      velocity,
      warheadWeight
    });
  };

  return (
    <div style={{
      padding: '24px',
      background: '#f5f6f7',
      borderRadius: '8px',
      border: '1px solid #f2f3fa',
      minWidth: '1200px',
      margin: '0 24px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#154961',
          letterSpacing: '-0.96px'
        }}>
          Filters
        </div>
        <div 
          onClick={handleReset}
          style={{
            color: '#227d8d',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Reset
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '40px',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'center' }}>
          <div style={{ color: '#6b788e', fontSize: '14px', fontWeight: 500 }}>
            Threat Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            {[
              { type: 'missile', icon: 'frame-10.png', label: 'Missile' },
              { type: 'uav', icon: 'mingcute.png', label: 'UAV' },
              { type: 'cruise', icon: 'fontisto.png', label: 'Cruise' }
            ].map((item) => (
              <div 
                key={item.type}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => handleThreatTypeClick(item.type)}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: threatType === item.type ? '#144a54' : '#fff',
                  border: `1px solid ${threatType === item.type ? 'transparent' : '#154961'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/${item.icon}`} 
                    alt={item.type}
                    style={{ width: '24px', height: '24px' }}
                  />
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#091e42'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '1px', height: '55px', background: '#00000014' }} />

        {[
          { label: 'Min Range (km):', value: range, max: 10000, onChange: setRange },
          { label: 'Min Velocity (m/s):', value: velocity, max: 450, onChange: setVelocity },
          { label: 'Min Warhead Weight (kg):', value: warheadWeight, max: 500, onChange: setWarheadWeight }
        ].map((item, index) => (
          <React.Fragment key={item.label}>
            <div style={{ width: '399px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ color: '#6b788e', fontSize: '14px', fontWeight: 500 }}>
                  {item.label}
                </div>
                <div style={{
                  padding: '8px',
                  border: '1px solid #7a8699',
                  borderRadius: '5px',
                  width: '100px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#091e42'
                }}>
                  {item.value}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={item.max}
                value={item.value}
                onChange={(e) => item.onChange(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#6b788e',
                fontSize: '14px',
                fontWeight: 500
              }}>
                <span>0</span>
                <span>{item.max}</span>
              </div>
            </div>
            {index < 2 && <div style={{ width: '1px', height: '55px', background: '#00000014' }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FiltersSection;

