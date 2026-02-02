import React from 'react';

interface NavButtonProps {
  icon: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: isSelected ? '100px' : '0',
        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <img 
        src={icon} 
        alt="nav icon" 
        style={{
          width: '24px',
          height: '24px',
        }}
      />
    </div>
  );
};

const SidebarNavigation: React.FC = () => {
  return (
    <div style={{
      width: '56px',
      minHeight: '100vh',
      backgroundColor: '#154961',
      padding: '16px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '55px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '55px'
      }}>
        <img 
          src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/image-9.png" 
          alt="logo"
          style={{
            width: '26px',
            height: '31px',
          }}
        />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <NavButton 
            icon="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/main-nav.png"
          />
          <NavButton 
            icon="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/wxplore.png"
            isSelected={true}
          />
          <NavButton 
            icon="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/simulati.png"
          />
          <NavButton 
            icon="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/tabler-s.png"
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

