import React from 'react';

// Dynamically import all .tsx files in ./components/figma
const modules = import.meta.glob('./components/figma/*.tsx', { eager: true });

const figmaComponents = Object.entries(modules)
  .map(([path, mod]) => {
    // Try to get the default export (the component)
    const name = path.replace('./components/figma/', '').replace('.tsx', '');
    const Component = (mod as any).default;
    return { name, Component };
  })
  .filter(({ Component }) => typeof Component === 'function');

const FigmaGallery: React.FC = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
    {figmaComponents.length === 0 && <div>No Figma TSX components found in <code>src/components/figma</code>.</div>}
    {figmaComponents.map(({ name, Component }) => (
      <div key={name} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 240, textAlign: 'center', background: '#fafafa' }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{name}</div>
        <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Component />
        </div>
      </div>
    ))}
  </div>
);

export default FigmaGallery;
