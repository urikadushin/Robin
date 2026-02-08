import React, { useState, useEffect } from 'react';
import { GeneralInformationForm } from './sections/GeneralInformationForm';
import { TechViewForm } from './sections/TechViewForm';
import { StructuralViewForm } from './sections/StructuralViewForm';
import { RCSForm } from './sections/RCSForm';
import { PerformanceForm } from './sections/PerformanceForm';
import { FlightLogicForm } from './sections/FlightLogicForm';
import { HeatTransferForm } from './sections/HeatTransferForm';
import { CountermeasuresForm } from './sections/CountermeasuresForm';
import { OperationalUseForm } from './sections/OperationalUseForm';

interface ThreatData {
    id: string;
    name: string;
    range: string;
    speed: string;
    weight: string;
    countries: string;
    missile: string;
    color: string;
    warhead?: string;
    status?: string;
    year?: number;
    description?: string;
    // Tech View
    length?: string;
    diameter?: string;
    launchWeight?: string;
    payloadWeight?: string;
    propulsion?: string;
    guidance?: string;
    accuracy?: string;
    // Structural
    stages?: string;
    materials?: string;
    // RCS
    rcsFront?: string;
    rcsSide?: string;
    stealth?: boolean;
    // Performance
    maxAltitude?: string;
    burnTime?: string;
    thrust?: string;
    // Flight Logic
    flightProfile?: string;
    maneuverability?: string;
    // Heat Transfer
    nosetipMaterial?: string;
    maxTemp?: string;
    // Countermeasures
    decoys?: string;
    jamming?: string;
    // Operational
    deployment?: string;
    operators?: string;
}

interface ThreatEditorProps {
    threat?: ThreatData;
    onSave: (threat: ThreatData) => void;
    onCancel: () => void;
}

export const ThreatEditor: React.FC<ThreatEditorProps> = ({ threat, onSave, onCancel }) => {
    const [activeSection, setActiveSection] = useState('general');

    // Initial State with expanded fields
    const [formData, setFormData] = useState<any>({
        name: '',
        range: '',
        speed: '',
        weight: '',
        countries: '',
        missile: '',
        color: '#ff6b6b',
        warhead: '',
        status: 'Operational',
        year: new Date().getFullYear(),
        description: '',
        // Tech View
        length: '',
        diameter: '',
        launchWeight: '',
        payloadWeight: '',
        propulsion: '',
        guidance: '',
        accuracy: '',
        // Structural
        stages: '',
        materials: '',
        // RCS
        rcsFront: '',
        rcsSide: '',
        stealth: false,
        // Performance
        maxAltitude: '',
        burnTime: '',
        thrust: '',
        // Flight Logic
        flightProfile: '',
        maneuverability: '',
        // Heat Transfer
        nosetipMaterial: '',
        maxTemp: '',
        // Countermeasures
        decoys: '',
        jamming: '',
        // Operational
        deployment: '',
        operators: '',
    });

    useEffect(() => {
        if (threat) {
            setFormData((prev: any) => ({ ...prev, ...threat }));
        }
    }, [threat]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

    const sections = [
        { id: 'general', label: 'General Information' },
        { id: 'tech', label: 'Technical View' },
        { id: 'structural', label: 'Structural View' },
        { id: 'rcs', label: 'RCS & Stealth' },
        { id: 'performance', label: 'Performance' },
        { id: 'flight', label: 'Flight Logic' },
        { id: 'heat', label: 'Heat Transfer' },
        { id: 'countermeasures', label: 'Countermeasures' },
        { id: 'operational', label: 'Operational Use' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;
        const id = threat?.id || formData.id || `threat-${Date.now()}`;
        onSave({ ...formData, id });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'var(--panel-bg)',
                borderRadius: '12px',
                width: '900px',
                maxWidth: '95%',
                height: '80vh',
                display: 'flex',
                overflow: 'hidden',
                color: 'var(--text)',
                boxShadow: 'var(--shadow-hover)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Sidebar */}
                <div style={{
                    width: '240px',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRight: '1px solid var(--border)',
                    padding: '20px 0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 style={{
                        margin: '0 0 20px 20px',
                        fontSize: '1.2rem',
                        color: 'var(--text)',
                        opacity: 0.9
                    }}>
                        {threat ? 'Edit Threat' : 'Add Threat'}
                    </h2>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                background: activeSection === section.id ? 'var(--accent)' : 'transparent',
                                color: activeSection === section.id ? '#fff' : 'var(--text)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                fontWeight: activeSection === section.id ? 500 : 400
                            }}
                        >
                            {section.label}
                        </button>
                    ))}

                    <div style={{ flex: 1 }} />

                    <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text)',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={{
                                flex: 2,
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--accent)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        {sections.find(s => s.id === activeSection)?.label}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {activeSection === 'general' && <GeneralInformationForm data={formData} onChange={handleChange} />}
                        {activeSection === 'tech' && <TechViewForm data={formData} onChange={handleChange} />}
                        {activeSection === 'structural' && <StructuralViewForm data={formData} onChange={handleChange} />}
                        {activeSection === 'rcs' && <RCSForm data={formData} onChange={handleChange} />}
                        {activeSection === 'performance' && <PerformanceForm data={formData} onChange={handleChange} />}
                        {activeSection === 'flight' && <FlightLogicForm data={formData} onChange={handleChange} />}
                        {activeSection === 'heat' && <HeatTransferForm data={formData} onChange={handleChange} />}
                        {activeSection === 'countermeasures' && <CountermeasuresForm data={formData} onChange={handleChange} />}
                        {activeSection === 'operational' && <OperationalUseForm data={formData} onChange={handleChange} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
