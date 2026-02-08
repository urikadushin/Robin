import React from 'react';

interface OperationalUseFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const OperationalUseForm: React.FC<OperationalUseFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Deployed Units / Locations</label>
                <textarea
                    name="deployment"
                    value={data.deployment}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Describe operational deployment..."
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Known Operators</label>
                <textarea
                    name="operators"
                    value={data.operators}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="List countries or groups operating this threat..."
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
