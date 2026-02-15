import { Request, Response } from 'express';
import pool from '../config/database';
import { Missile } from '../models/MissileModel';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllMissiles = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM missiles');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching missiles:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const getMissileById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM missiles WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Missile not found' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error fetching missile ${id}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const createMissile = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: 'Name is required' });
        return;
    }
    try {
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO missiles (name) VALUES (?)', [name]);
        res.json({ id: result.insertId, name, message: 'Missile created successfully' });
    } catch (error) {
        console.error('Error creating missile:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const updateMissile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [result] = await pool.query<ResultSetHeader>('UPDATE missiles SET name = ? WHERE id = ?', [name, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Missile not found' });
            return;
        }
        res.json({ id, name, message: 'Missile updated successfully' });
    } catch (error) {
        console.error(`Error updating missile ${id}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};

export const deleteMissile = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM missiles WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Missile not found' });
            return;
        }
        res.json({ message: 'Missile deleted successfully' });
    } catch (error) {
        console.error(`Error deleting missile ${id}:`, error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
};
