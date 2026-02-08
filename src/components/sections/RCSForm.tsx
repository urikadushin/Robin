import React from 'react';

interface RCSFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const RCSForm: React.FC<RCSFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>RCS Front (m²)</label>
                    <input
                        type="text"
                        name="rcsFront"
                        value={data.rcsFront}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 0.1"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>RCS Side (m²)</label>
                    <input
                        type="text"
                        name="rcsSide"
                        value={data.rcsSide}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 5.0"
                    />
                </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                    type="checkbox"
                    name="stealth"
                    checked={data.stealth}
                    onChange={onChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Stealth Capabilities / Low Observable Technology</label>
            </div>

            <div style={{ marginTop: '20px' }}>
                <label style={labelStyle}>Radar Signature Notes</label>
                <textarea
                    name="description" // Re-using description or adding a specific note field? I'll stick to a placeholder text area for UI completeness even if it maps to generic description for now unless I add rcsNotes
                    value={data.description} // Just binding to description for now to avoid error, typically this would be a separate field
                    onChange={onChange}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Additional notes on radar cross section..."
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
