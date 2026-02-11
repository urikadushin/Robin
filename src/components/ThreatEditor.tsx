import React, { useState, useEffect } from 'react';
import { GeneralInformationForm } from './sections/GeneralInformationForm';
import { TechViewForm } from './sections/TechViewForm';
import { StructuralViewForm } from './sections/StructuralViewForm';
import { PerformanceForm } from './sections/PerformanceForm';
import { FlightLogicForm } from './sections/FlightLogicForm';
import { HeatTransferForm } from './sections/HeatTransferForm';
import { CountermeasuresForm } from './sections/CountermeasuresForm';
import { OperationalUseForm } from './sections/OperationalUseForm';
import { GenericEngineeringForm } from './sections/GenericEngineeringForm';
import { DataImportForm } from './sections/DataImportForm';

interface ThreatData {
    id: string;
    name: string;
    // range: string; // Deprecated in favor of min/max/operational
    minRange?: number;
    maxRange?: number;
    operationalRange?: number;
    range?: string; // Keeping for backward compatibility/display calculated from maxRange
    speed: string;
    weight: string;
    countries: string; // Used as Manufacturer in some contexts, but adding specific field
    manufacturer?: string;
    rvDesignName?: string;
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

    // Advanced Engineering
    btParams?: Record<string, string | number>;
    rvParams?: Record<string, string | number>;
    aerodynamics?: any;
    massProperties?: any;
    stageData?: any;
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
        // Advanced Engineering
        btParams: {},
        rvParams: {},
        aerodynamics: undefined,
        massProperties: undefined,
        stageData: undefined,
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
        { id: 'performance', label: 'Performance' },
        { id: 'flight', label: 'Flight Logic' },
        { id: 'heat', label: 'Heat Transfer' },
        { id: 'countermeasures', label: 'Countermeasures' },
        { id: 'operational', label: 'Operational Use' },
        { id: 'boost', label: 'Boost Phase (BtParams)' },
        { id: 'rv', label: 'Reentry Vehicle (RvParams)' },
        { id: 'aero', label: 'Aerodynamics (Import)' },
        { id: 'mass', label: 'Mass Properties (Import)' },
        { id: 'stages', label: 'Stages & Guidance (Import)' },
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
                height: '90vh',
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
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 style={{
                        margin: '20px 0 20px 20px',
                        fontSize: '1.2rem',
                        color: 'var(--text)',
                        opacity: 0.9,
                        flexShrink: 0
                    }}>
                        {threat ? 'Edit Threat' : 'Add Threat'}
                    </h2>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
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
                                    fontWeight: activeSection === section.id ? 500 : 400,
                                    flexShrink: 0
                                }}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '20px', display: 'flex', gap: '10px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
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
                        {activeSection === 'performance' && <PerformanceForm data={formData} onChange={handleChange} />}
                        {activeSection === 'flight' && <FlightLogicForm data={formData} onChange={handleChange} />}
                        {activeSection === 'heat' && <HeatTransferForm data={formData} onChange={handleChange} />}
                        {activeSection === 'countermeasures' && <CountermeasuresForm data={formData} onChange={handleChange} />}
                        {activeSection === 'operational' && <OperationalUseForm data={formData} onChange={handleChange} />}
                        {activeSection === 'boost' && (
                            <GenericEngineeringForm
                                title="Boost Phase Parameters"
                                data={formData.btParams}
                                onChange={(newParams) => setFormData((prev: any) => ({ ...prev, btParams: newParams }))}
                            />
                        )}
                        {activeSection === 'rv' && (
                            <GenericEngineeringForm
                                title="Reentry Vehicle Parameters"
                                data={formData.rvParams}
                                onChange={(newParams) => setFormData((prev: any) => ({ ...prev, rvParams: newParams }))}
                            />
                        )}
                        {activeSection === 'aero' && (
                            <DataImportForm
                                title="Aerodynamic Coefficients"
                                description="Upload or paste JSON containing aerodynamic tables (Cx, Cz, Cm, etc. vs Mach/Alpha)."
                                data={formData.aerodynamics}
                                onChange={(newData) => setFormData((prev: any) => ({ ...prev, aerodynamics: newData }))}
                            />
                        )}
                        {activeSection === 'mass' && (
                            <DataImportForm
                                title="Mass Properties & Inertia"
                                description="Upload or paste JSON containing Mass, CG, and Inertia Tensor definitions."
                                data={formData.massProperties}
                                onChange={(newData) => setFormData((prev: any) => ({ ...prev, massProperties: newData }))}
                            />
                        )}
                        {activeSection === 'stages' && (
                            <DataImportForm
                                title="Stages, Guidance & Control"
                                description="Upload or paste JSON containing Stage definitions, Guidance tables (PropNav, Theta), and Control loops."
                                data={formData.stageData}
                                onChange={(newData) => setFormData((prev: any) => ({ ...prev, stageData: newData }))}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
