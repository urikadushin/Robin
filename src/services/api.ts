const API_URL = 'http://127.0.0.1:3000/api';

export const api = {
    getMissiles: async () => {
        const response = await fetch(`${API_URL}/missiles`);
        if (!response.ok) throw new Error('Failed to fetch missiles');
        return response.json();
    },
    getMissile: async (id: number) => {
        const response = await fetch(`${API_URL}/missiles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch missile');
        return response.json();
    },
    createMissile: async (data: any) => {
        const response = await fetch(`${API_URL}/missiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create missile');
        return response.json();
    },
    updateMissile: async (id: number, data: any) => {
        const response = await fetch(`${API_URL}/missiles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update missile');
        return response.json();
    },
    deleteMissile: async (id: number) => {
        const response = await fetch(`${API_URL}/missiles/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete missile');
        return response.json();
    },
    getStaticFile: (path: string) => {
        return `${API_URL}/data/${path}`;
    },
    getAerodynamics: async (missileId: string) => {
        const response = await fetch(`${API_URL}/aerodynamics/${missileId}`);
        if (!response.ok) throw new Error('Failed to fetch aerodynamics');
        return response.json();
    },
    createAerodynamicProfile: async (data: any) => {
        const response = await fetch(`${API_URL}/aerodynamics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create aerodynamic profile');
        return response.json();
    },
    getWeightAndSize: async (missileId: string) => {
        const response = await fetch(`${API_URL}/weightandsize/${missileId}`);
        if (!response.ok) throw new Error('Failed to fetch weight and size data');
        return response.json();
    },
    createWeightAndSize: async (data: any) => {
        const response = await fetch(`${API_URL}/weightandsize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create weight and size entry');
        return response.json();
    },
    deleteWeightAndSize: async (missileId: string) => {
        const response = await fetch(`${API_URL}/weightandsize/${missileId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete weight and size data');
        return response.json();
    }
};
