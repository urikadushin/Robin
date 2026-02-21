import React from 'react';

const Header: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      padding: '12px 24px',
      width: '100%',
      minWidth: '1000px',
      height: '64px',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      {/* Logo and Explore Text */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
        height: '32px'
      }}>
        <img
          src="/rayven-logo.png"
          alt="Logo"
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain'
          }}
        />
        <span style={{
          fontFamily: 'Inter',
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.96px',
          color: '#144a54'
        }}>
          Explore
        </span>
      </div>

      {/* Right Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Notifications and Avatar */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '24px',
          alignItems: 'center',
          height: '40px',
          border: '1px solid #144a5440'
        }}>
          <img
            src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/notifica.png"
            alt="Notifications"
            style={{
              width: '34px',
              height: '36px',
              cursor: 'pointer'
            }}
          />
          <img
            src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/avatar.png"
            alt="Avatar"
            style={{
              width: '40px',
              height: '40px',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Action Icons */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '40px',
          padding: '4px',
          alignItems: 'center'
        }}>
          <img
            src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/minus-th.png"
            alt="Minus"
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <img
            src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/minus-do.png"
            alt="Double Down"
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '32px',
            height: '32px'
          }}>
            <img
              src="https://dashboard.codeparrot.ai/api/image/aBtV5y9L86pAlMTH/x-mark.png"
              alt="Close"
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

