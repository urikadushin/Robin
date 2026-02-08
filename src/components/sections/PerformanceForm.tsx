import React from 'react';

interface PerformanceFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const PerformanceForm: React.FC<PerformanceFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Max Altitude (km)</label>
                    <input
                        type="text"
                        name="maxAltitude"
                        value={data.maxAltitude}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 400"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Burn Time (s)</label>
                    <input
                        type="text"
                        name="burnTime"
                        value={data.burnTime}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 180"
                    />
                </div>
            </div>

            <div className="form-group">
                <label style={labelStyle}>Thrust (kN)</label>
                <input
                    type="text"
                    name="thrust"
                    value={data.thrust}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. 250"
                />
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text)',
    opacity: 0.9
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--item-bg)',
    color: 'var(--text)',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
