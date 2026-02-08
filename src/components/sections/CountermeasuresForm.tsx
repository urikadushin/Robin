import React from 'react';

interface CountermeasuresFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const CountermeasuresForm: React.FC<CountermeasuresFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Decoys</label>
                <textarea
                    name="decoys"
                    value={data.decoys}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Describe decoy capabilities..."
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Jamming / Electronic Warfare</label>
                <textarea
                    name="jamming"
                    value={data.jamming}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Describe jamming capabilities..."
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
