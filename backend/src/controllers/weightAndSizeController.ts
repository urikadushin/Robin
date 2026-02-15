import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { WeightAndSize } from '../models/WeightAndSizeModel';

export const getWeightAndSizeByMissileId = async (req: Request, res: Response) => {
    const { missileId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM weightandsize WHERE missile_id = ?', [missileId]);
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching weightandsize for missile ${missileId}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const createWeightAndSizeEntry = async (req: Request, res: Response) => {
    const data: WeightAndSize = req.body;

    if (!data.missile_id || !data.description) {
        res.status(400).json({ message: 'missile_id and description are required' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO weightandsize 
            (missile_id, missile_name, description, generic_name, property_value, sign, unit, subject) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.missile_id, data.missile_name, data.description,
                data.generic_name, data.property_value, data.sign,
                data.unit, data.subject
            ]
        );
        res.json({ id: result.insertId, message: 'Weight and Size entry created successfully' });
    } catch (error) {
        console.error('Error creating weightandsize entry:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const deleteWeightAndSizeByMissileId = async (req: Request, res: Response) => {
    const { missileId } = req.params;
    try {
        await pool.query('DELETE FROM weightandsize WHERE missile_id = ?', [missileId]);
        res.json({ message: 'Weight and Size entries deleted for missile' });
    } catch (error) {
        console.error(`Error deleting weightandsize for missile ${missileId}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};
