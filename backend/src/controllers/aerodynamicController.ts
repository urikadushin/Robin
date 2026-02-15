import { Request, Response } from 'express';
import pool from '../config/database';
import { Aerodynamic } from '../models/AerodynamicModel';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAerodynamicsByMissileId = async (req: Request, res: Response) => {
    const { missileId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM aerodynamic WHERE missile_id = ?', [missileId]);
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching aerodynamics for missile ${missileId}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const createAerodynamicProfile = async (req: Request, res: Response) => {
    // This is complex as it likely involves uploading multiple rows or a file.
    // For now, let's support adding a single entry or bulk if needed.
    // Implementing single entry for basic alignment.
    const data: Aerodynamic = req.body;

    // Basic validation
    if (!data.missile_id || !data.part_name) {
        res.status(400).json({ message: 'missile_id and part_name are required' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO aerodynamic 
            (missile_id, missile_name, part_name, aero_cx0_on, aero_cx0_off, aero_cna, aero_xcp, aero_cmq, aero_cnd, aero_clp, aero_cl, dim, mach_vec, alpha_vec) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.missile_id, data.missile_name, data.part_name,
                data.aero_cx0_on, data.aero_cx0_off, data.aero_cna, data.aero_xcp,
                data.aero_cmq, data.aero_cnd, data.aero_clp, data.aero_cl,
                data.dim, data.mach_vec, data.alpha_vec
            ]
        );
        res.json({ id: result.insertId, message: 'Aerodynamic profile created successfully' });
    } catch (error) {
        console.error('Error creating aerodynamic profile:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const updateAerodynamicProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: Partial<Aerodynamic> = req.body;

    // Construct dynamic update query
    // ... (simplify for now, just update specific fields if needed)
    // Given the schema complexity, updates might be better handled by replace or delete/insert for tables.
    // Let's implement delete first as it's easier to manage via UI (clear and re-upload).
    res.status(501).json({ message: 'Not implemented yet. Use Delete + Create for updates.' });
};

export const deleteAerodynamicsByMissileId = async (req: Request, res: Response) => {
    const { missileId } = req.params;
    try {
        await pool.query('DELETE FROM aerodynamic WHERE missile_id = ?', [missileId]);
        res.json({ message: 'Aerodynamic profiles deleted for missile' });
    } catch (error) {
        console.error(`Error deleting aerodynamics for missile ${missileId}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};
