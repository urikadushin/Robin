import React from 'react';
import SidebarNavigation from './SidebarNavigation';
import Header from './Header';
import FiltersSection from './FiltersSection';
import MapSection_ResultsSection from './MapSection_ResultsSection';

const ExploreLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#f5f6f7' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <SidebarNavigation />
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '24px' }}>
          <FiltersSection />
          <MapSection_ResultsSection />
        </div>
      </div>
    </div>
  );
};

export default ExploreLayout;

