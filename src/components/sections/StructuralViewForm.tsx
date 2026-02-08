import React from 'react';

interface StructuralViewFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const StructuralViewForm: React.FC<StructuralViewFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Number of Stages</label>
                <input
                    type="text"
                    name="stages"
                    value={data.stages}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. 2 Stages"
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Airframe Materials</label>
                <textarea
                    name="materials"
                    value={data.materials}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="e.g. Aluminum alloys, Composite materials, Steel..."
                />
            </div>

            <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text)', opacity: 0.7 }}>
                    Structural analysis visualization would appear here.
                </p>
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
