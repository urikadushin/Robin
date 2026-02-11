import { ThreatData } from '../App';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    async getAllMissiles(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/missiles`);
        if (!response.ok) throw new Error('Failed to fetch missiles');
        return response.json();
    },

    async updateMissile(id: number, missile: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/missiles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missile),
        });
        if (!response.ok) throw new Error('Failed to update missile');
        return response.json();
    },

    async createMissile(missile: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/missiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missile),
        });
        if (!response.ok) throw new Error('Failed to create missile');
        return response.json();
    },

    async getFullThreat(id: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/missiles/${id}/full`);
        if (!response.ok) throw new Error('Failed to fetch full threat data');
        return response.json();
    },

    async saveFullThreat(threatData: ThreatData): Promise<any> {
        const payload = mapToBackendFormat(threatData);

        const response = await fetch(`${API_BASE_URL}/missiles/full`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to save threat data');
        return response.json();
    },

    async deleteThreat(id: number | string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/missiles/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete threat');
    }
};

function mapToBackendFormat(threat: ThreatData) {
    return {
        missile: {
            id: threat.id && !threat.id.startsWith('new') ? parseInt(threat.id) : undefined,
            name: threat.name,
            type: threat.missile,
            num_of_stages: threat.stages ? parseInt(threat.stages) : 1,
            family_type: threat.countries,
            explosive_type: threat.warhead,
            flight_logic_file_name: threat.flightProfile
        },
        weightAndSize: [
            { description: 'אורך כללי', generic_name: 'totalLength', property_value: threat.length, unit: 'mm', subject: 'general' },
            { description: 'קוטר(יחוס)', generic_name: 'd', property_value: threat.diameter, unit: 'mm', subject: 'general' },
            { description: 'משקל בהמראה', generic_name: 'launchWeight', property_value: threat.launchWeight, unit: 'kg', subject: 'general' },
            { description: 'משקל רש"ק', generic_name: 'wh_weight', property_value: threat.warhead, unit: 'kg', subject: 'rv' },
            { description: 'טווח מקסימום', generic_name: 'maxRange', property_value: threat.maxRange, unit: 'km', subject: 'general' },
            { description: 'טווח מינימום', generic_name: 'minRange', property_value: threat.minRange, unit: 'km', subject: 'general' },
            ...(threat.flightProfile ? [{ description: 'Flight Path Mode', property_value: threat.flightProfile, subject: 'logic' }] : []),
            ...(threat.maxTemp ? [{ description: 'Max Temperature', property_value: threat.maxTemp, unit: 'C', subject: 'thermal' }] : [])
        ],
        aerodynamics: threat.aerodynamics?.parts?.map((part: any) => ({
            part_name: part.name,
            aero_cx0_on: JSON.stringify(part.cx0_on),
            aero_cx0_off: JSON.stringify(part.cx0_off),
            aero_cna: JSON.stringify(part.cna),
            aero_xcp: JSON.stringify(part.xcp)
        })),
        engine: threat.thrust ? {
            tburn: threat.burnTime ? parseFloat(threat.burnTime) : 0,
            thrust: threat.thrust ? parseFloat(threat.thrust) : 0
        } : undefined
    };
}
