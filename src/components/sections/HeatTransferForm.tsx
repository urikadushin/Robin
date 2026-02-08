import React from 'react';

interface HeatTransferFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const HeatTransferForm: React.FC<HeatTransferFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Re-entry Vehicle / Nosetip Material</label>
                <input
                    type="text"
                    name="nosetipMaterial"
                    value={data.nosetipMaterial}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. Carbon-Carbon composite"
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Max Atmospheric Temp (°K)</label>
                <input
                    type="text"
                    name="maxTemp"
                    value={data.maxTemp}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. 3000"
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
