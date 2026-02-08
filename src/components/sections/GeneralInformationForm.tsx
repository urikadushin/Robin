import React from 'react';

interface GeneralInformationFormProps {
    data: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const GeneralInformationForm: React.FC<GeneralInformationFormProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
                <label style={labelStyle}>Name</label>
                <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    style={inputStyle}
                    required
                    placeholder="e.g. Sejjil-2"
                />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Type</label>
                    <select name="missile" value={data.missile} onChange={onChange} style={inputStyle}>
                        <option value="Ballistic">Ballistic</option>
                        <option value="Cruise">Cruise</option>
                        <option value="UAV">UAV</option>
                        <option value="Kamikaze Drone">Kamikaze Drone</option>
                        <option value="Surveillance Drone">Surveillance Drone</option>
                        <option value="Rocket">Rocket</option>
                    </select>
                </div>
                <div style={{ width: '120px' }}>
                    <label style={labelStyle}>Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="color"
                            name="color"
                            value={data.color}
                            onChange={onChange}
                            style={{ ...inputStyle, height: '42px', padding: '2px', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Range</label>
                    <input
                        type="text"
                        name="range"
                        value={data.range}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 2000 km"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Speed</label>
                    <input
                        type="text"
                        name="speed"
                        value={data.speed}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. Mach 12"
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Total Weight</label>
                    <input
                        type="text"
                        name="weight"
                        value={data.weight}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 23,600 kg"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Warhead Weight</label>
                    <input
                        type="text"
                        name="warhead"
                        value={data.warhead}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 1,000 kg"
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Origin Country</label>
                    <input
                        type="text"
                        name="countries"
                        value={data.countries}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. Iran"
                    />
                </div>
                <div style={{ width: '150px' }}>
                    <label style={labelStyle}>Year</label>
                    <input
                        type="number"
                        name="year"
                        value={data.year}
                        onChange={onChange}
                        style={inputStyle}
                    />
                </div>
            </div>

            <div className="form-group">
                <label style={labelStyle}>Status</label>
                <select name="status" value={data.status} onChange={onChange} style={inputStyle}>
                    <option value="Operational">Operational</option>
                    <option value="Development">Development</option>
                    <option value="Tested">Tested</option>
                    <option value="Retired">Retired</option>
                    <option value="Unknown">Unknown</option>
                </select>
            </div>

            <div className="form-group">
                <label style={labelStyle}>Description</label>
                <textarea
                    name="description"
                    value={data.description}
                    onChange={onChange}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                    placeholder="Enter thorough description of the threat capabilities..."
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
