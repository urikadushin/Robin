import React from 'react';

interface FlightLogicFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const FlightLogicForm: React.FC<FlightLogicFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Flight Profile</label>
                <textarea
                    name="flightProfile"
                    value={data.flightProfile}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Describe the flight profile/trajectory..."
                />
            </div>

            <div className="form-group">
                <label style={labelStyle}>Maneuverability</label>
                <textarea
                    name="maneuverability"
                    value={data.maneuverability}
                    onChange={onChange}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Describe maneuverability capabilities (e.g. terminal maneuvers)..."
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
