import React from 'react';
import { ThreatData } from '../App';

interface ComparisonViewProps {
    threats: ThreatData[];
    onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ threats, onClose }) => {
    if (!threats || threats.length === 0) return null;

    const modalStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        opacity: 1,
        transition: 'opacity 0.3s ease'
    };

    const contentStyle: React.CSSProperties = {
        backgroundColor: 'var(--panel-bg)',
        width: '90%',
        maxWidth: '1000px',
        height: '80vh',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    };

    const headerStyle: React.CSSProperties = {
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    };

    const gridStyle: React.CSSProperties = {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `150px repeat(${threats.length}, 1fr)`,
        overflow: 'auto',
        padding: '24px'
    };

    const rowStyle: React.CSSProperties = {
        display: 'contents',
    };

    const labelCellStyle: React.CSSProperties = {
        padding: '16px',
        color: 'var(--text)',
        opacity: 0.7,
        fontWeight: 500,
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        left: 0,
        backgroundColor: 'var(--panel-bg)', // distinct background
        zIndex: 10
    };

    const valueCellStyle = (color?: string): React.CSSProperties => ({
        padding: '16px',
        color: 'var(--text)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        textAlign: 'center',
        fontWeight: 500,
        position: 'relative'
    });

    const attributes = [
        { label: 'Type', key: 'missile' },
        { label: 'Range', key: 'range' },
        { label: 'Speed', key: 'speed' },
        { label: 'Weight', key: 'weight' },
        { label: 'Origin', key: 'countries' },
        { label: 'Warhead', key: 'warhead' },
        { label: 'Manufacturer', key: 'manufacturer' },
        { label: 'Guidance', key: 'guidance' },
        { label: 'Status', key: 'status' },
        { label: 'Year', key: 'year' },
    ];

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>⚖️</span>
                        <h2 style={{ margin: 0, color: 'var(--text)' }}>Threat Comparison</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            opacity: 0.7
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={gridStyle}>
                    {/* Header Row (Names) */}
                    <div style={{ ...labelCellStyle, fontSize: '14px', alignSelf: 'end' }}>SPECIFICATION</div>
                    {threats.map(t => (
                        <div key={t.id} style={{ ...valueCellStyle(t.color), borderBottom: '2px solid var(--border)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: t.color }}>{t.name}</div>
                        </div>
                    ))}

                    {/* Attribute Rows */}
                    {attributes.map(attr => (
                        <div style={rowStyle} key={attr.key}>
                            <div style={labelCellStyle}>{attr.label}</div>
                            {threats.map(t => (
                                <div key={`${t.id}-${attr.key}`} style={valueCellStyle()}>
                                    {/* @ts-ignore - dynamic key access */}
                                    {t[attr.key] || '-'}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Description Row (Full Width Logic needed? Grid handles it) */}
                    <div style={rowStyle}>
                        <div style={labelCellStyle}>Description</div>
                        {threats.map(t => (
                            <div key={`${t.id}-desc`} style={{ ...valueCellStyle(), fontSize: '13px', lineHeight: '1.5', textAlign: 'left' }}>
                                {t.description || 'No description available.'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
