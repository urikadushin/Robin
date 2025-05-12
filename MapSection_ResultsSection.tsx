import React from 'react';

interface ThreatData {
  name: string;
  color: string;
  missile: string;
  range: string;
  speed: string;
  weight: string;
  countries: string;
}

const MapSection_ResultsSection: React.FC = () => {
  const threats: ThreatData[] = [
    {
      name: 'Shibbolet',
      color: '#227d8d',
      missile: 'Missile',
      range: '20-3000 km',
      speed: '150 m/s',
      weight: '342 kg',
      countries: '2 Countries'
    },
    {
      name: 'Lev',
      color: '#5bbdeb',
      missile: 'Missile',
      range: '20-3000 km',
      speed: '150 m/s',
      weight: '342 kg',
      countries: '2 Countries'
    },
    {
      name: 'Rea',
      color: '#d6ee4d',
      missile: 'Missile',
      range: '20-3000 km',
      speed: '150 m/s',
      weight: '342 kg',
      countries: '1 Countries'
    },
    {
      name: 'Threat Name',
      color: '#d840be',
      missile: 'Missile',
      range: '20-3000 km',
      speed: '150 m/s',
      weight: '342 kg',
      countries: '1 Countries'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '29px', minHeight: '701px', width: '100%' }}>
      <div style={{ flex: 1, position: 'relative', minWidth: '600px' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
          {/* Map Background */}
          <div style={{ width: '100%', height: '100%', backgroundColor: '#ebedf0' }} />
          
          {/* Map Controls */}
          <div style={{ 
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ebedf0',
            borderRadius: '8px',
            padding: '21px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px'
          }}>
            <img src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/ic-outli.png" alt="zoom-in" style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
            <img src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/ic-round.png" alt="zoom-out" style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
            <img src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/tabler-f.png" alt="focus" style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      <div style={{ width: '550px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0' }}>
          <div style={{ 
            fontFamily: 'Inter',
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: '30px',
            color: '#144a54'
          }}>
            Results (4)
          </div>
          <button style={{
            backgroundColor: '#227d8d',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '4px 12px',
            height: '42px',
            cursor: 'pointer',
            fontFamily: 'Inter',
            fontSize: '18px',
            fontWeight: 400,
          }}>
            Comparison
          </button>
        </div>

        {threats.map((threat, index) => (
          <div key={index} style={{
            display: 'flex',
            padding: '16px 24px',
            backgroundColor: '#eaf7f9',
            borderRadius: '5px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '14px', alignItems: 'center' }}>
                <div style={{ 
                  width: '6px',
                  height: '20px',
                  backgroundColor: threat.color,
                  borderRadius: '20px'
                }} />
                <div style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  color: '#144a54'
                }}>
                  {threat.name}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center' }}>
                {[
                  threat.missile,
                  threat.range,
                  threat.speed,
                  threat.weight,
                  threat.countries
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <span style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      color: '#144a54',
                      lineHeight: '18px'
                    }}>
                      {item}
                    </span>
                    {i < 4 && (
                      <div style={{
                        width: '1px',
                        height: '16px',
                        backgroundColor: '#144a54',
                        opacity: 0.25
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapSection_ResultsSection;

