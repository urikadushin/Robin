const API_URL = 'http://localhost:3000/api';

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
    }
};
