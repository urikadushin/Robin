import React from 'react';

interface TechViewFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const TechViewForm: React.FC<TechViewFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Length (m)</label>
                    <input
                        type="text"
                        name="length"
                        value={data.length}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 18.2"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Diameter (m)</label>
                    <input
                        type="text"
                        name="diameter"
                        value={data.diameter}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 1.25"
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Launch Weight (kg)</label>
                    <input
                        type="text"
                        name="launchWeight"
                        value={data.launchWeight}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 23600"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Payload Weight (kg)</label>
                    <input
                        type="text"
                        name="payloadWeight"
                        value={data.payloadWeight}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 750"
                    />
                </div>
            </div>

            <div className="form-group">
                <label style={labelStyle}>Propulsion System</label>
                <textarea
                    name="propulsion"
                    value={data.propulsion}
                    onChange={onChange}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="e.g. Two-stage solid propellant with vector control..."
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Guidance System</label>
                <textarea
                    name="guidance"
                    value={data.guidance}
                    onChange={onChange}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="e.g. Inertial Navigation System (INS) with GPS update..."
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Accuracy (CEP)</label>
                <input
                    type="text"
                    name="accuracy"
                    value={data.accuracy}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. 10m - 50m"
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
