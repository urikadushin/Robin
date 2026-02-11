import React, { useState } from 'react';

interface GenericEngineeringFormProps {
    title: string;
    data: Record<string, string | number> | undefined;
    onChange: (updatedData: Record<string, string | number>) => void;
}

export const GenericEngineeringForm: React.FC<GenericEngineeringFormProps> = ({ title, data = {}, onChange }) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newKey && newValue) {
            onChange({ ...data, [newKey]: newValue });
            setNewKey('');
            setNewValue('');
        }
    };

    const handleRemove = (key: string) => {
        const updated = { ...data };
        delete updated[key];
        onChange(updated);
    };

    const handleChangeValue = (key: string, val: string) => {
        onChange({ ...data, [key]: val });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ margin: '0 0 10px', color: 'var(--text)' }}>{title}</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '10px', alignItems: 'end' }}>
                <div>
                    <label style={labelStyle}>Parameter Name</label>
                    <input
                        style={inputStyle}
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="e.g. nozzleExitDiameter"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Value</label>
                    <input
                        style={inputStyle}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="e.g. 0.45"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    style={buttonStyle}
                    disabled={!newKey || !newValue}
                >
                    +
                </button>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                {Object.entries(data).length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No parameters defined.</div>
                )}
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <div style={{ ...inputStyle, background: 'var(--bg)', border: 'none', paddingLeft: 0 }}>{key}</div>
                        <input
                            style={inputStyle}
                            value={value}
                            onChange={(e) => handleChangeValue(key, e.target.value)}
                        />
                        <button
                            onClick={() => handleRemove(key)}
                            style={{ ...buttonStyle, background: '#ff6b6b', borderColor: '#ff6b6b' }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text)',
    opacity: 0.8
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--item-bg)',
    color: 'var(--text)',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none'
};

const buttonStyle: React.CSSProperties = {
    height: '38px',
    width: '38px',
    borderRadius: '6px',
    border: '1px solid var(--primary)',
    background: 'var(--primary)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
};
